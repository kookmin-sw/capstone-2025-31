# 채점 함수를 정의한 파이썬 파일
import os, pickle, torch
import numpy as np
import pandas as pd
from tqdm import tqdm

def autocheck(result_path = r"./result", target_folder1 = r"./result/dataset_masking/ko-wiki", target_folder2 = r"./result/dataset_masking/ko-wiki-masked", threshold1 = 0.85, threshold2 = 0.90):
    encode_path1 = f"{target_folder1}/encode"
    encode_path2 = f"{target_folder2}/encode"

    result_dir = f"{result_path}/results/{os.path.basename(target_folder1)}+{os.path.basename(target_folder2)}"
    os.makedirs(result_dir, exist_ok=True)

    csv_path = f"{result_dir}/{threshold1}-{threshold2}.csv"
    first_write = not os.path.exists(csv_path)

    path_list1 = os.listdir(encode_path1)
    path_list2 = os.listdir(encode_path2)

    for path1 in tqdm(path_list1, desc="Checking", ncols=100):
        if path1 not in path_list2:
            continue
        
        pkl_list1 = [f for f in os.listdir(f"{encode_path1}/{path1}") if f.endswith(".pkl")]
        pkl_list2 = [f for f in os.listdir(f"{encode_path2}/{path1}") if f.endswith(".pkl")]

        for file1 in pkl_list1:
            with open(f"{encode_path1}/{path1}/{file1}", "rb") as f1:
                pivot_data = np.array(pickle.load(f1))
            pivot_tensor = torch.tensor(pivot_data, dtype=torch.float32, device="cuda")

            for file2 in pkl_list2:
                with open(f"{encode_path2}/{path1}/{file2}", "rb") as f2:
                    compare_data = np.array(pickle.load(f2))
                compare_tensor = torch.tensor(compare_data, dtype=torch.float32, device="cuda")

                sim_matrix = torch.mm(pivot_tensor, compare_tensor.T) # GPU 가속 필요
                cnt = (sim_matrix >= threshold1).sum(dim=1).gt(0).sum().item()
                label = 1 if cnt >= len(pivot_data) * threshold2 else 0

                row = pd.DataFrame([{
                    "type" : path1,
                    "original" : file1,
                    "compare" : file2,
                    "similarity" : cnt / len(pivot_data) * 100,
                    "label" : label,
                }])

                row.to_csv(csv_path, mode="a", header=first_write, index=False)
                first_write = False
    return csv_path
    
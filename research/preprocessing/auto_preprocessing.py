
import os
from sentence_transformers import SentenceTransformer, util
from tqdm import tqdm
import pandas as pd
import numpy as np
import torch, os, pickle

# txt 파일 불러오는 함수
def read_text(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

# 개행 문자 제거 함수
def delete_newline(text):
    return text.replace('\n', ' ')

# 단어 단위 전처리 방식
def word_preprocessing(data_dict, window_size=10, slide=1):
    result_dict = {}

    for doc in data_dict.keys():
        result_dict[doc] = []

        text = delete_newline(data_dict[doc])
        words = text.split()

        # 예외 처리
        if len(words) < window_size:
            result_dict[doc].append(text)
            continue

        # 슬라이딩 윈도우 적용
        for i in range(0, len(words), slide):
            window = words[i:i+window_size]
            if len(window) == window_size:
                sentence = ' '.join(window)
                result_dict[doc].append(sentence)

    return result_dict


def autoencode(result_path=r"./result", model=SentenceTransformer("jhgan/ko-sbert-sts")):
    path_list = os.listdir(f"{result_path}/preprocess")
    
    for path in tqdm(path_list, desc="Encoding", ncols=100):

        # 전처리된 딕셔너리 로드
        with open(f"{result_path}/preprocess/{path}", "rb") as f:
            data = pickle.load(f)

        encoded_dict = {}

        for doc in data.keys():
            sentences = data[doc]
            embeddings = model.encode(sentences, normalize_embeddings=True)
            encoded_dict[doc] = embeddings

        # 인코딩된 딕셔너리를 저장
        with open(f"{result_path}/encode/{path}", "wb") as f:
            pickle.dump(encoded_dict, f)

def autocheck(result_path="./result", target_folder1="./result/encode", threshold1=0.85, threshold2=0.10):
    path_list = os.listdir(target_folder1)

    for path in tqdm(path_list, desc="Checking", ncols=100):
        with open(f"{target_folder1}/{path}", "rb") as f:
            data = pickle.load(f)

        files = list(data.keys())

        # pivot: ori.txt 파일 / target: 나머지
        pivot_files = [f for f in files if f.endswith("ori.txt")]
        target_files = [f for f in files if not f.endswith("ori.txt")]

        all_rows = []

        for pivot_file in pivot_files:
            pivot = np.array(data[pivot_file])
            pivot = torch.tensor(pivot, dtype=torch.float32, device='cuda')

            for target_file in target_files:
                target = np.array(data[target_file])
                target = torch.tensor(target, dtype=torch.float32, device='cuda')

                sim_matrix = torch.mm(pivot, target.T)
                cnt = (sim_matrix >= threshold1).sum(dim=1).gt(0).sum().item()
                label = 1 if cnt >= len(pivot) * threshold2 else 0

                row = {
                    "file1": pivot_file,
                    "file2": target_file,
                    "similarity": cnt / len(pivot) * 100,
                    "label": label
                }

                all_rows.append(row)

        df = pd.DataFrame(all_rows)
        
        base_filename = os.path.splitext(path)[0]
        output_path = f"{result_path}/check/{base_filename}_{threshold1}_{threshold2}.csv"
        
        df.to_csv(output_path, index=False)

if __name__ == "__main__":
    autocheck()
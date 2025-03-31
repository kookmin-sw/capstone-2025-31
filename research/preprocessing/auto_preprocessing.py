
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
def word_preprocessing(data_dict, window_size=10, slide=3):
    result_dict = {}

    for doc in data_dict.keys():
        result_dict[doc] = []

        text = delete_newline(data_dict[doc])
        words = text.split()
        for i in range(0, len(words), slide):
            window = words[i:i+window_size]
            if window:
                sentence = ' '.join(window)
                result_dict[doc].append(sentence)

        # 나머지 단어 청크 추가
        last = (len(words) - window_size) % slide
        if last != 0:
            window = words[-window_size:]
            sentence = ' '.join(window)
            if sentence not in result_dict[doc]:
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

def autocheck(result_path = r"./result", target_folder1 = r"./result/encode", threshold1 = 0.85, threshold2 = 0.10):
    path_list = os.listdir(target_folder1)
    for path in tqdm(path_list, desc="Checking", ncols=100):
        with open(f"{target_folder1}/{path}", "rb") as f:
            data = pickle.load(f)

        # 유사도 계산
        # sim_dict = {}
        file_list = list(data.keys())

        for i in range(len(file_list)):
            pivot = np.array(data[file_list[i]])
            pivot = torch.tensor(pivot, dtype=torch.float32, device='cuda')

            for j in range(i+1, len(file_list)):
                target = np.array(data[file_list[j]])
                target = torch.tensor(target, dtype=torch.float32, device='cuda')

                sim_matrix = torch.mm(pivot, target.T)
                cnt = (sim_matrix >= threshold1).sum(dim=1).gt(0).sum().item()
                label = 1 if cnt >= len(pivot) * threshold2 else 0
            
                row = pd.DataFrame([{
                    "file1": file_list[i],
                    "file2": file_list[j],
                    "similarity": cnt / len(pivot) * 100,
                    "label": label
                }])

                row.to_csv(f"{result_path}/check/{path}_{threshold1}_{threshold2}.csv", mode='a', header=False, index=False)

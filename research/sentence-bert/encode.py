# 인코딩 함수를 정의한 파이썬 파일
from sentence_transformers import SentenceTransformer, util
from tqdm import tqdm
import pandas as pd
import numpy as np
import re, os, pickle

# 전처리 문서 임베딩 자동화화 함수
def autoencode(result_path = r"./result", model = SentenceTransformer("jhgan/ko-sbert-sts")):
    path_list = os.listdir(f"{result_path}/preprocess")
    for path in tqdm(path_list, desc="Encoding : ", ncols=100):
        os.makedirs(f"{result_path}/encode/{path}", exist_ok=True)
        pkl_list = [f for f in os.listdir(f"{result_path}/preprocess/{path}") if f.endswith(".pkl")]
        for pkl_file in pkl_list:
            with open(f"{result_path}/preprocess/{path}/{pkl_file}", "rb") as f2:
                encode_list = model.encode(pickle.load(f2), normalize_embeddings=True)
            with open(f"{result_path}/encode/{path}/{pkl_file}", "wb") as f2:
                pickle.dump(encode_list, f2)
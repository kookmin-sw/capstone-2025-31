import hnswlib
import pickle
import numpy as np
import os
from sentence_transformers import SentenceTransformer
from pathlib import Path

import preprocessing as pre

default_options = {
    "sliding_window_size" : 30,
    "slide" : 1,
    "threshold1" : 0.85, # -1 ~ 1
    "threshold2" : 90, # %
}

class VectorSearchEngine:
    def __init__(self, index_path, label_map_path, model_name="jhgan/ko-sbert-sts", dim=768):
        self.index_path = index_path
        self.label_map_path = label_map_path
        self.dim = dim
        self.model = SentenceTransformer(model_name, trust_remote_code=True)
        
        # hnswlib 인덱스 생성 및 로드
        self.index = hnswlib.Index(space='cosine', dim=self.dim)
        if self._index_files_exist():
            print("[INFO] Loading existing index and label map...")
            self.index.load_index(self.index_path)
            with open(self.label_map_path, "rb") as f:
                self.label_map = pickle.load(f)
        else:
            print("[INFO] Creating new empty index and label map...")
            self.index.init_index(max_elements=1000000, ef_construction=200, M=16)
            self.label_map = {}
        
        self.index.set_ef(1000)  # 검색 정확도용

    def _index_files_exist(self):
        return os.path.exists(self.index_path) and os.path.exists(self.label_map_path)
    
    def add_confidential_file(self, confidential_file_path, options=default_options):
        if not os.path.exists(confidential_file_path):
            raise FileNotFoundError(f"File path {confidential_file_path} does not exist.")

        with open(confidential_file_path, "r", encoding="utf-8") as f:
            confidential_text = f.read()
        
        sliding_sentences = pre.word_sliding_window(confidential_text, window_size=options["sliding_window_size"], slide=options["slide"])

        embeddings = self.model.encode(sliding_sentences, convert_to_numpy=True, normalize_embeddings=True)

        next_label = max(self.label_map.keys(), default=-1) + 1
        labels = []
        label_to_file = {}

        for i in range(len(embeddings)):
            label = next_label
            labels.append(label)
            label_to_file[label] = f"{os.path.basename(confidential_file_path)}_sent_{i}"
            next_label += 1

        self.index.add_items(embeddings, labels)

        self.label_map.update(label_to_file)

        self.save()

        print(f"[INFO] Finished adding {confidential_file_path} to the index.")

        
    def encode_confidential_file(self, confidential_file_path, options=default_options):
        confidential_file_list = os.listdir(confidential_file_path)
        next_label = max(self.label_map.keys(), default=-1) + 1
    
        for file_name in confidential_file_list:
            file_path = os.path.join(confidential_file_path, file_name)
            with open(file_path, "r", encoding="utf-8") as f:
                confidential_text = f.read()
    
            # 슬라이딩 윈도우 적용
            sliding_sentences = pre.word_sliding_window(confidential_text, window_size=options["sliding_window_size"], slide=options["slide"])
    
            print(f"[DEBUG] {file_name} 슬라이딩 문장 개수: {len(sliding_sentences)}")
    
            # 임베딩
            embeddings = self.model.encode(sliding_sentences, convert_to_numpy=True, normalize_embeddings=True)
    
            labels = []
            label_to_file = {}
    
            for i in range(len(embeddings)):
                labels.append(next_label)
                label_to_file[next_label] = f"{file_name}_sent_{i}"
                next_label += 1
    
            # 벡터 추가
            self.index.add_items(embeddings, labels)
    
            # 라벨 → 파일명 매핑
            self.label_map.update(label_to_file)
    
        # 마지막에 인덱스 저장
        self.save()
    
        print(f"[INFO] Finished adding all files from {confidential_file_path}.")

    
    def query_confidential_file(self, query_text, top_k=1, sim_threshold=0.85):
        # 슬라이딩 윈도우 적용
        query_sentences = pre.word_sliding_window(query_text, window_size=default_options["sliding_window_size"], slide=default_options ["slide"])


        # 슬라이딩 문장들 인코딩
        query_embeddings = self.model.encode(query_sentences, convert_to_numpy=True, normalize_embeddings=True)

        # threshold를 distance 기준으로 변환
        distance_threshold = 1 - sim_threshold

        match_count = 0
        total_count = len(query_embeddings)

        for embedding in query_embeddings:
            embedding = embedding.reshape(1, -1)  # (1, 768)

            # 검색
            labels, distances = self.index.knn_query(embedding, k=top_k)

            # top_k 중에서 distance가 threshold보다 작은 결과 개수 세기
            matches = (distances[0] <= distance_threshold).sum()
            match_count += matches

        print(f"[INFO] 총 {total_count}개의 슬라이딩 문장 중 {match_count}개가 threshold 이상 매칭되었습니다.")

        return match_count, total_count


    def save(self):
        output_dir = os.path.dirname(self.index_path)
        os.makedirs(output_dir, exist_ok=True)

        # 인덱스 저장
        self.index.save_index(self.index_path)

        # 라벨 매핑 저장
        with open(self.label_map_path, "wb") as f:
            pickle.dump(self.label_map, f)


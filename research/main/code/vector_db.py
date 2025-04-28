import hnswlib
import pickle
import numpy as np
import os
from sentence_transformers import SentenceTransformer
from pathlib import Path

import preprocessing as pre

default_options = {
    "sliding_window_size" : 35,
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
            self.index.init_index(max_elements=10000, ef_construction=200, M=16)
            self.label_map = {}
        
        self.index.set_ef(100)  # 검색 정확도용

    def _index_files_exist(self):
        return os.path.exists(self.index_path) and os.path.exists(self.label_map_path)
        
    def encode_confidential_file(self, confidential_file_path, options=default_options):
        confidential_file_list = os.listdir(confidential_file_path)

        for file_name in confidential_file_list:
            file_path = os.path.join(confidential_file_path, file_name)
            with open(file_path, "r", encoding="utf-8") as f:
                confidential_text = f.read()

            # 슬라이딩 윈도우 적용
            sliding_sentences = pre.word_sliding_window(confidential_text, window_size=options["sliding_window_size"],  slide=options["slide"])

            print(f"[DEBUG] {file_name} 슬라이딩 문장 개수: {len(sliding_sentences)}")


            # 임베딩
            embeddings = self.model.encode(sliding_sentences, convert_to_numpy=True, normalize_embeddings=True)

            # 현재 라벨 결정
            if self.label_map:
                label = max(self.label_map.keys()) + 1
            else:
                label = 0

            labels = [label] * len(embeddings)  # 모든 문장에 같은 라벨 부여

            # 벡터 추가
            self.index.add_items(embeddings, labels)

            # 라벨 → 파일명 매핑
            self.label_map[label] = file_name

        # 마지막에 인덱스 저장
        self.save()

        print(f"[INFO] Finished adding all files from {confidential_file_path}.")



    def add_vector(self, text, file_name):
        # 텍스트 인코딩
        embedding = self.model.encode([text], convert_to_numpy=True, normalize_embeddings=True)
        
        # 새로운 라벨 ID
        if self.label_map:
            new_label = max(self.label_map.keys()) + 1
        else:
            new_label = 0
        
        # 추가
        self.index.add_items(embedding, [new_label])
        self.label_map[new_label] = file_name
        
        # 디스크에 저장
        self.save()

        print(f"[INFO] Added vector for '{file_name}' with label {new_label}.")

    def save(self):
        output_dir = os.path.dirname(self.index_path)
        os.makedirs(output_dir, exist_ok=True)

        # 인덱스 저장
        self.index.save_index(self.index_path)

        # 라벨 매핑 저장
        with open(self.label_map_path, "wb") as f:
            pickle.dump(self.label_map, f)


    def search(self, query_text, top_k=1):
        # 쿼리 인코딩
        query_vec = self.model.encode([query_text], convert_to_numpy=True, normalize_embeddings=True)
        
        # 검색
        labels, distances = self.index.knn_query(query_vec, k=top_k)
        
        results = []
        for label, distance in zip(labels[0], distances[0]):
            file_name = self.label_map[label]
            results.append({"file_name": file_name, "distance": distance})
        
        return results


if __name__ == "__main__":

    engine = VectorSearchEngine(
            index_path=f"../output/hnsw_index.bin",
            label_map_path=f"../output/label_to_file_map.pkl"
        )

    query = "르네상스 시대에 자신들과 중세를 구분하면서 시작되었으며, 카를 마르크스의 역사 성장 단계 이론이 나온 후, 경제적 개진 수준에 따라서 분간하는 추세가 우월하다. 사실 각 지역 간에 정형화된 특징의 고대나 중세란 실재하지 않는다. 한편 마르크스의 세기 구분론의"

    engine.encode_confidential_file("../../data/namu") 
    results = engine.search(query, top_k=1)
    for result in results:
        print(f"File: {result['file_name']}, Distance: {result['distance']}")
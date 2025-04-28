import hnswlib
import pickle
import numpy as np
import os
from sentence_transformers import SentenceTransformer

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
        try:
            with open(self.label_map_path, "rb"):
                return True
        except FileNotFoundError:
            return False

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
        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
        os.makedirs(os.path.dirname(self.label_map_path), exist_ok=True)

        self.index.save_index(self.index_path)
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
    # 서버 시작할 때 (index 파일, label 파일 지정)
    engine = VectorSearchEngine(
        index_path="../output/hnsw_index.bin",
        label_map_path="../output/label_to_file_map.pkl"
    )

    model = SentenceTransformer("jhgan/ko-sbert-sts", trust_remote_code=True)
    e1 = model.encode('비밀 파일 내용입니다. ', convert_to_numpy=True, normalize_embeddings=True)
    e2 = model.encode('비밀스러운 문서를 찾아줘', convert_to_numpy=True, normalize_embeddings=True)
    
    # 코사인 유사도
    cos_sim = np.dot(e1, e2)
    print(f"코사인 유사도: {cos_sim:.4f}")

    # 벡터 추가하기
    engine.add_vector(text="비밀 파일 내용입니다.", file_name="confidential-1.txt")

    # 검색하기
    results = engine.search(query_text="비밀스러운 문서를 찾아줘", top_k=1)

    for r in results:
        cosine_similarity = 1 - r['distance']
        print(f"파일명: {r['file_name']}, 코사인 유사도: {cosine_similarity:.4f}")


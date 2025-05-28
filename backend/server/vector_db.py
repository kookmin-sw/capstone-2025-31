import hnswlib
import pickle
import numpy as np
import os
from sentence_transformers import SentenceTransformer
from pathlib import Path

import server.preprocessing as pre

default_options = {
    "sliding_window_size" : 5,
    "slide" : 1,
    "threshold1" : 0.75, # -1 ~ 1
    "threshold2" : 30, # %
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
        
        self.index.set_ef(500)  # 검색 정확도용

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
            if any(v.startswith(f"{file_name}_sent_") for v in self.label_map.values()):
                print(f"[INFO] 문서 {file_name} 은 이미 등록되어 있어 건너뜁니다.")
                continue

            file_path = os.path.join(confidential_file_path, file_name)
            with open(file_path, "r", encoding="utf-8") as f:
                confidential_text = f.read()

            # 슬라이딩 윈도우 적용
            sliding_sentences = pre.word_sliding_window(
                confidential_text,
                window_size=options["sliding_window_size"],
                slide=options["slide"]
            )

            print(f"[DEBUG] {file_name} 슬라이딩 문장 개수: {len(sliding_sentences)}")

            # 임베딩
            embeddings = self.model.encode(
                sliding_sentences, convert_to_numpy=True, normalize_embeddings=True
            )

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


    
    def query_confidential_file(self, query_text, top_k=1, sim_threshold= default_options["threshold2"]):
        query_sentences = pre.word_sliding_window(
            query_text,
            window_size=default_options["sliding_window_size"],
            slide=default_options["slide"]
        )

        print("[DEBUG] 슬라이딩 첫 문장:", query_sentences[:2])
        print("[DEBUG] 타입:", type(query_sentences[0]))


        query_embeddings = self.model.encode(
            query_sentences, convert_to_numpy=True, normalize_embeddings=True
        )
        distance_threshold = 1 - sim_threshold

        first_filename = None
        positions = []

        total_count = len(query_embeddings)
        match_count = 0
        

        for i, embedding in enumerate(query_embeddings):  # i = query 문장 인덱스
            embedding = embedding.reshape(1, -1)
            labels, distances = self.index.knn_query(embedding, k=top_k)

            for j, dist in enumerate(distances[0]):
                if dist <= distance_threshold:
                    label = labels[0][j]
                    file_tag = self.label_map.get(label)  # e.g. "기밀문서1.txt_sent_5"
                    if file_tag and "_sent_" in file_tag:
                        filename, sent_idx = file_tag.split("_sent_")

                        # 첫 매칭 문서 저장
                        if first_filename is None:
                            first_filename = filename

                        # 첫 문서에 대해서만 position 기록
                        if filename == first_filename:
                            positions.append([i + 1, int(sent_idx)])
                            match_count += 1
                        break  # query 문장당 하나만 저장

        return first_filename or 'N/A', positions, match_count, total_count


    def save(self):
        output_dir = os.path.dirname(self.index_path)
        os.makedirs(output_dir, exist_ok=True)

        # 인덱스 저장
        self.index.save_index(self.index_path)

        # 라벨 매핑 저장
        with open(self.label_map_path, "wb") as f:
            pickle.dump(self.label_map, f)

if __name__ == "__main__":
    # 예시 사용법
    engine = VectorSearchEngine(
        index_path="output/index.bin",
        label_map_path="output/label_map.pkl",
        model_name="jhgan/ko-sbert-sts"
    )

    # 파일 추가
    engine.encode_confidential_file(confidential_file_path="./data")
    
    # 쿼리
    filename, positions, match_count, total_count = engine.query_confidential_file("2025년 1월부터 4월까지 진행된 보안 강화 프로젝트는 다수의 패스워드 교체와 경로 재정비를 수반했으며, 일부 회의록에는 노출되어서는 안 될 기밀 정보가 부주의하게 기록되기도 했다. 1월 8일 회의에서는 기존 VPN 서버 인증용 패스워드가 너무 단순하다는 지적이 나왔고, 이에 따라 네트워크 엔지니어 김하늘이 VPN 관리자 계정 비밀번호를 기존 'admin1234'에서 'V!pn#2025$Secure'로 변경하고, 설정 파일 '/etc/openvpn/server.conf' 경로에 직접 반영하였다. 이 사실은 회의록에 수정 내역과 함께 기록되었는데, 문제는 해당 파일 경로와 신규 비밀번호가 함께 기재되어 노출 리스크가 발생했다는 점이다. 또한 1월 22일 회의에서는 사내 주요 파일 서버의 접속 계정 비밀번호 변경도 결정되었는데, 시스템 관리자 최은지가 'fileserver01'의 관리자 계정 패스워드를 'Chang3Me!@2025'로 교체하고, Samba 공유 경로인 '\\internal-server\\securefiles'에 이를 적용했다는 내역이 자세히 기록됐다. 이 변경 또한 파일 경로와 새로운 비밀번호가 노출된 형태로 회의록에 남았다. ", top_k=1)
    print(filename, positions, match_count, total_count)
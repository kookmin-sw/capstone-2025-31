'''
preprocessing.py : 전처리 함수를 정의한 파일
- 최신화 : 2025.03.26
'''
import sentencepiece as spm
import os

# txt 파일 불러오는 함수
def read_text(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

# 개행 문자 제거 함수
def delete_newline(text):
    return text.replace('\n', ' ')

# 단어 단위 전처리 방식
def word_preprocessing(file_path, window_size=10, slide=3):
    text = read_text(file_path)
    text = delete_newline(text) # 개행 문자 제거

    words = text.split()
    result = []
    
    for i in range(0, len(words) - window_size + 1, slide):
        window = words[i:i+window_size]
        result.append(window)

    # 나머지 단어 청크 추가
    last = (len(words) - window_size) % slide
    if last != 0:
        window = words[-window_size:]
        if window not in result:
            result.append(window)

    return result

# SentencePiece 학습 함수
def training_spm(file_path, model_name="default"):
    os.makedirs("./sentencepiece", exist_ok=True)
    spm.SentencePieceTrainer.Train(
        input=file_path,
        model_prefix=f"./sentencepiece/{model_name}",
        character_coverage=1.0,
        vocab_size=32000, # 수정 가능
        model_type="unigram" # 기본 값
    )
    print(f"[training_spm] : Training Complete to ./sentencepiece/{model_name}")

# Debug
if __name__ == '__main__':
    print(word_preprocessing(r"./sample_text.txt", 10, 3))
    training_spm(r"./ko_wiki_text.txt", model_name="ko_wiki_text_model")
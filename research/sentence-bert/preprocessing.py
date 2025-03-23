# 전처리 함수를 정의한 파이썬 파일
from tqdm import tqdm
import pandas as pd
import numpy as np
import re, os, pickle

# 괄호 제거 함수
def remove_parenthesse_func(text):
    return re.sub(r"[\(\{\[].*?[\)\}\]]", "", text)

# 문장 단위 분리 함수
def split_sentence(text):
    sentences = text.split(". ")
    return [sentence.strip().rstrip('.') for sentence in sentences if len(sentence) > 0 and sentence != ' '] # 비어 있는 문장 삭제

# 문자 단위 슬라이딩 윈도우 함수
def sliding_window_char(text, window_size=100, plus=1, sentence=True, remove_parenthesse=False):
    if sentence == False:
        if remove_parenthesse == True:
            text = remove_parenthesse_func(text)
        if len(text) < window_size:
            return [text]
        return [text[i:i+window_size] for i in range(0, len(text)-window_size+1, plus)]
    else:
        if remove_parenthesse == True:
            text = remove_parenthesse_func(text)
        sentences = split_sentence(text)
        result = []
        for text in sentences:
            if len(text) < window_size:
                result.extend([text])
            else:
                result.extend([text[i:i+window_size] for i in range(0, len(text)-window_size+1, plus)])
        return result

# 단어 단위 슬라이딩 윈도우 함수
def sliding_window_word(text, window_size=10, plus=1, sentence=True, remove_parenthesse=False):
    if sentence == False:
        if remove_parenthesse == True:
            text = remove_parenthesse_func(text)
        words = text.split(' ')
        if len(words) < window_size:
            return [' '.join(words).rstrip('.')]
        return [' '.join(words[i:i+window_size]).rstrip('.') for i in range(0, len(words)-window_size+1, plus)]
    else:
        if remove_parenthesse == True:
            text = remove_parenthesse_func(text)
        sentences = split_sentence(text)
        result = []
        for text in sentences:
            words = text.split(' ')
            if len(words) < window_size:
                result.extend([' '.join(words).rstrip('.')])
            else:
                result.extend([' '.join(words[i:i+window_size]).rstrip('.') for i in range(0, len(words)-window_size+1, plus)])
        return result
    
# 전처리 딕셔너리 반환 함수
def get_preprocess_fuc_list(char_window_size : int, word_window_size : int):
    return {
        f"char-{char_window_size}-sentenceO-parenthesseO" : lambda text : sliding_window_char(text, char_window_size, sentence=True, remove_parenthesse=False),
        f"char-{char_window_size}-sentenceO-parenthesseX" : lambda text : sliding_window_char(text, char_window_size, sentence=True, remove_parenthesse=True),
        f"char-{char_window_size}-sentenceX-parenthesseO" : lambda text : sliding_window_char(text, char_window_size, sentence=False, remove_parenthesse=False),
        f"char-{char_window_size}-sentenceX-parenthesseX" : lambda text : sliding_window_char(text, char_window_size, sentence=False, remove_parenthesse=True),
        f"word-{word_window_size}-sentenceO-parenthesseO" : lambda text : sliding_window_word(text, word_window_size, sentence=True, remove_parenthesse=False),
        f"word-{word_window_size}-sentenceO-parenthesseX" : lambda text : sliding_window_word(text, word_window_size, sentence=True, remove_parenthesse=True),
        f"word-{word_window_size}-sentenceX-parenthesseX" : lambda text : sliding_window_word(text, word_window_size, sentence=False, remove_parenthesse=False),
        f"word-{word_window_size}-sentenceX-parenthesseO" : lambda text : sliding_window_word(text, word_window_size, sentence=False, remove_parenthesse=True),
    }

# 문서 전처리 자동화 함수
def autopreprocessing(data_path = r"./data", data_name = r"test_dataset", result_path = r"./result", char_window_size = 100, word_window_size = 10):
    result_path = f"{result_path}/{data_name}"
    os.makedirs(f"{result_path}/preprocess", exist_ok=True)
    text_file_list = [f for f in os.listdir(f"{data_path}/{data_name}") if f.endswith(".txt")]
    # 전처리 함수와 이름 정의
    preprocess_fuc_list = get_preprocess_fuc_list(char_window_size, word_window_size)

    # 각 실험 폴더 생성
    for filepath in preprocess_fuc_list.keys():
        os.makedirs(f"{result_path}/preprocess/{filepath}", exist_ok=True)
    
    # 전처리 데이터 저장
    for textfile in tqdm(text_file_list, desc="Preprocessing : ", ncols=100):
        with open(f"{data_path}/{data_name}/{textfile}", "r", encoding="utf-8") as f:
            text = f.read()
        for key, fucn in preprocess_fuc_list.items():
            text_preprocess = fucn(text)
            with open(f"{result_path}/preprocess/{key}/{textfile}.pkl", "wb") as f:
                pickle.dump(text_preprocess, f)
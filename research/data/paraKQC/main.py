import itertools
import pickle
import pandas as pd

# 데이터셋 불러오는 함수
def read_data(filename):
    with open(filename, "r", encoding="utf-8") as f:
        data = [line.split('\t') for line in f.read().splitlines()]
    return data

# Paraphrasing 데이터 쌍을 만드는 함수
def make_para(tuplet):
    res   = []
    pairs = [comb for comb in itertools.combinations(list(range(len(tuplet))), 2)]
    for i in range(len(pairs)):
        line = []
        line.append(4)
        line.append(tuplet[pairs[i][0]])
        line.append(tuplet[pairs[i][1]])
        res.append(line)
    return res

# 비Paraphrasing 데이터 쌍을 만드는 함수
def make_something(tuplet1,tuplet2,i1,i2,type):
    utt1 = tuplet1[i2%10][2]
    utt2 = tuplet2[i1%10][2]
    line = []
    line.append(type)
    line.append(utt1)
    line.append(utt2)
    return line

if __name__ == "__main__":
    para = read_data(r"./paraKQC_v1.txt")
    
    # 전체 데이터를 10개 단위로 분리
    tuples = []
    for i in range(1000):
        start = i*10
        end = (i+1)*10
        tuple = para[start:end]
        tuples.append(tuple)
    
    # Paraphrasing data 생성
    para_total = []
    for i in range(len(tuples)):
        tuplet = [z[2] for z in tuples[i]]
        para_set = make_para(tuplet)
        para_total = para_total + para_set

    # 비 Paraphrasing data 생성
    non_para_total = []
    tuple_pairs = [comb for comb in itertools.combinations(list(range(len(tuples))), 2)]
    for i in range(len(tuple_pairs)):
        if i%10000==0:
            print(i)
        type   = 0
        tuple1 = tuples[tuple_pairs[i][0]]
        tuple2 = tuples[tuple_pairs[i][1]]
        topic  = tuple1[0][0]==tuple2[0][0]
        intent = tuple1[0][1]==tuple2[0][1]
        if topic and intent:
            type = 3
        if topic and not intent:
            type = 2
        if not topic and intent:
            type = 1
        non_para_set = make_something(tuple1,tuple2,tuple_pairs[i][0],tuple_pairs[i][1],type)
        non_para_total.append(non_para_set)
    
    data_total = para_total + non_para_total

    # 데이터 pickle로 저장
    with open(r"./paraKQC.pkl", "wb") as f:
        pickle.dump(data_total, f)
    
    # 데이터 pandas로 저장
    df = pd.DataFrame(data_total, columns=["label", "1", "2"]) 
    df.to_csv(r"./paraKQC.csv", index_label='idx', encoding='utf-8')   


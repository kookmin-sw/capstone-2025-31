'''
convert_training_data.py : T5 모델을 학습시키기 위해 데이터를 변환하는 파일
- 최신화 : 2025.03.26
'''
import json, csv, os

def read_json(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)

def convert_klue_t5(json_path, out_csv="t5_train.csv", threshold=4.0):
    data = read_json(json_path)

    os.makedirs(f"./train_data", exist_ok=True)
    with open(f"./train_data/{out_csv}", 'w', encoding="utf-8", newline='') as wf:
        writer = csv.writer(wf)
        writer.writerow(["input_text", "target_text"])

        for item in data:
            s1 = item["sentence1"].strip()
            s2 = item["sentence2"].strip()
            score = float(item["labels"]["label"])
            label = "similar" if score >= threshold else "not similar"
            input_text = f"{s1} </s> {s2}"
            writer.writerow([input_text, label])

if __name__ == "__main__":
    convert_klue_t5("../fine-tuning-data/KLUE-sts/klue-sts-v1.1_dev.json", out_csv="t5_dev.csv", threshold=3.0)
    
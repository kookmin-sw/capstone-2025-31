'''
train_t5_model.py : T5 모델을 학습시키는 함수를 정의한 파일
- 최신화 : 2025.03.28
'''
from transformers import T5Tokenizer, T5ForConditionalGeneration, Trainer, TrainingArguments
from datasets import load_dataset, Dataset
from sklearn.model_selection import train_test_split
from tqdm import tqdm
import pandas as pd
import torch, os

def train_t5_model(csv_path, model_save_path, model_name, num_train_epochs):
    df = pd.read_csv(csv_path)
    df = df.drop(columns=[col for col in df.columns if '__index_level_0__' in col], errors='ignore')

    train_df, eval_df = train_test_split(df, test_size=0.1, random_state=42)
    train_df.to_csv(r"./train_data/train.csv")
    eval_df.to_csv(r"./train_data/eval.csv")

    dataset = Dataset.from_pandas(train_df)
    eval_dataset = Dataset.from_pandas(eval_df)

    tokenizer = T5Tokenizer.from_pretrained(model_name)
    model = T5ForConditionalGeneration.from_pretrained(model_name)
    model.to("cuda")

    def preprocess(example):
            input_enc = tokenizer(example["input_text"], truncation=True, padding="max_length", max_length=128)
            target_enc = tokenizer(example['target_text'], truncation=True, padding='max_length', max_length=16)
            input_enc['labels'] = target_enc['input_ids']
            return input_enc
    
    tokenizer_dataset = dataset.map(preprocess)
    tokenizer_eval_dataset = eval_dataset.map(preprocess)

    result_dir = os.path.abspath("./result")
    logs_dir = os.path.abspath("./logs")

    if os.path.exists(logs_dir) and not os.path.isdir(logs_dir):
        os.remove(logs_dir)
    os.makedirs(result_dir, exist_ok=True)
    os.makedirs(logs_dir, exist_ok=True)

    training_args = TrainingArguments(
        output_dir=result_dir,
        num_train_epochs=num_train_epochs,
        per_device_eval_batch_size=8,
        per_device_train_batch_size=8,
        save_steps=100,
        save_strategy="steps",
        save_total_limit=5,
        logging_dir=logs_dir,
        logging_steps=100,
        evaluation_strategy="steps",
        eval_steps=100,
        load_best_model_at_end=True,
        metric_for_best_model="loss",
        greater_is_better=False
    )

    trainer = Trainer(
          model=model,
          args=training_args,
          train_dataset=tokenizer_dataset,
          eval_dataset=tokenizer_eval_dataset
    )

    trainer.train()
    model.save_pretrained(model_save_path)
    tokenizer.save_pretrained(model_save_path)

def test_model(test_csv_path, model_path):
    df = pd.read_csv(test_csv_path)
    
    tokenizer = T5Tokenizer.from_pretrained(model_path)
    model = T5ForConditionalGeneration.from_pretrained(model_path)
    model.to("cuda")
    model.eval()

    predictions = []
    for input_text in tqdm(df["input_text"], desc="Predicting"):
        inputs = tokenizer(input_text, return_tensors="pt", truncation=True, padding=True, max_length=128).to("cuda")
        with torch.no_grad():
            outputs = model.generate(
                input_ids=inputs.input_ids,
                attention_mask=inputs.attention_mask,
                max_length=16
            )
        pred_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        predictions.append(pred_text)

    df["predict_text"] = predictions
    df["label"] = (df["target_text"].astype(str).str.strip() == df["predict_text"].astype(str).str.strip()).astype(int)
    return df

if __name__ == "__main__":
    #   train_t5_model(r"./train_data/t5_train.csv", r"./model/KLUE_model", "google-t5/t5-base", 10)
    df = test_model(r"./train_data/t5_dev.csv", r"google-t5/t5-base")
    df.to_csv("./model/original_result.csv", index=False)
    print("원본 결과 저장 완료")
    df = test_model(r"./train_data/t5_dev.csv", r"./model/KLUE_model")
    df.to_csv(f"./model/tuned_result.csv", index=False)
    print("파인튜닝 결과 저장 완료")
import pandas as pd

df_test = pd.read_csv(r"./kor_Pair_test.csv")
df_train = pd.read_csv(r"./kor_pair_train.csv")
df_total = pd.concat([df_test, df_train], ignore_index=True)
df_total = df_total[['question1', 'question2', 'is_duplicate']]
df_total.to_csv(r"./kor_pair_question.csv")

print(df_total.head(10))
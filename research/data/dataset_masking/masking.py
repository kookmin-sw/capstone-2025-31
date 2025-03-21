import os, re, random
from tqdm import tqdm

# 저장된 폴더의 txt 정보를 불러와 n% masking 수행 함수
def masking(input_folder, output_folder, mask_percent):
    txt_list = [f for f in os.listdir(input_folder) if f.endswith('.txt')]
    os.makedirs(f"{output_folder}/{mask_percent}", exist_ok=True)

    for title in tqdm(txt_list, ncols=100, desc="Masking"):
        with open(f"{input_folder}/{title}", "r", encoding="utf-8") as f:
            text = f.read()
        sentences = re.split(r'(?<=\.)\s+', text)
        sentences = [sentence.strip() for sentence in sentences]
        masked_sentences = []

        for sentence in sentences:
            words = sentence.split()
            num_to_mask = int(len(words) * mask_percent / 100)

            if num_to_mask > 0:
                mask_indices = random.sample(range(len(words)), num_to_mask)
                words = [word for i, word in enumerate(words) if i not in mask_indices]
            masked_sentences.append(" ".join(words))
        masked_text = "\n".join(masked_sentences)

        with open(f"{output_folder}/{mask_percent}/{title}", "w", encoding="utf-8") as f:
            f.write(masked_text)

if __name__ == "__main__":
    for i in range(10, 100, 10):
        masking("./ko-wiki", "./ko-wiki-masked", i)
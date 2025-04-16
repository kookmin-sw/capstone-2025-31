from datetime import datetime
from sentence_transformers import SentenceTransformer
import preprocessing as pre
import os, pickle, torch

default_options = {
    "sliding_window_size" : 35,
    "slide" : 1,
    "threshold1" : 0.85, # -1 ~ 1
    "threshold2" : 90, # %
}

def encode_confidential_file(model, confidential_file_path, enc_confidential_path, options=default_options):
    print("[encode_confidential_file] : Started") # DEBUG
    os.makedirs(enc_confidential_path, exist_ok=True)
    # Input - Confidential files & Preprocessing
    confidential_file_list = os.listdir(confidential_file_path)
    pre_confidential_files_dict = {}
    for file_name in confidential_file_list:
        file_path = f"{confidential_file_path}/{file_name}"
        with open(file_path, "r", encoding="utf-8") as f:
            confidential_file = f.read()
        pre_confidential_files_dict[file_name] = pre.word_sliding_window(confidential_file, window_size=options["sliding_window_size"], slide=options["slide"])
    
    # Encode - Confidential files & Encoding
    enc_confidential_files_dict = {}
    for file_name in confidential_file_list:
        confidential_embeddings = model.encode(pre_confidential_files_dict[file_name], convert_to_tensor=True, normalize_embeddings=True)
        enc_confidential_files_dict[file_name] = confidential_embeddings
    
    # Output - Save & Print
    with open(f"{enc_confidential_path}/enc_confidential_files_dict.pkl", "wb") as f:
        pickle.dump(enc_confidential_files_dict, f)
    print("[encode_confidential_file] : Complete") # DEBUG
    return 0

def pairwise_predict(enc_query_list, cal_result, threshold=0.85):
    print("[pairwise_predict] : Started") # DEBUG
    # Processing - Predict
    predict_result = {}
    for file_name, cosine_sim in cal_result.items():
        sim_cnt = (cosine_sim >= threshold).sum(dim=1).gt(0).sum().item()
        sim_ratio = round(sim_cnt / len(enc_query_list) * 100, 2)
        predict_result[file_name] = {"count" : sim_cnt, "ratio" : sim_ratio}
    
    # Output - Predict_Result
    print("[pairwise_predict] : Complete") # DEBUG
    return predict_result

def pairwise_check(model, confidential_file_path, enc_confidential_path, query_txt="", query_file_path="", is_query_file=True, options=default_options): # TODO: Modify SBERT Model when you fine-tuned
    print("[pairwise_check] : Started") # DEBUG
    output_dir = r"../output/pairwise_check/"; os.makedirs(output_dir, exist_ok=True)
    # Input - Query
    if is_query_file:
        with open(f"{query_file_path}", "r", encoding="utf-8") as f:
            query_file = f.read()
    else:
        query_file = query_txt
    
    # Processing - Confidential & Query
    if not os.path.exists(f"{enc_confidential_path}/enc_confidential_files_dict.pkl"):
        encode_confidential_file(model, confidential_file_path, enc_confidential_path, options)
    with open(f"{enc_confidential_path}/enc_confidential_files_dict.pkl", "rb") as f:
        enc_confidential_files_dict = pickle.load(f)
    pre_query_list = pre.word_sliding_window(query_file, window_size=options["sliding_window_size"], slide=options["slide"])
    enc_query_list = model.encode(pre_query_list, convert_to_tensor=True, normalize_embeddings=True)
    
    # Calculate Similarity - Cosine Similarity
    cal_result = {}
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    enc_query_list = enc_query_list.to(device)
    for file_name, confidential_embeddings in enc_confidential_files_dict.items():
        confidential_embeddings = confidential_embeddings.to(device)
        cosine_sim = torch.mm(enc_query_list, confidential_embeddings.T)
        cal_result[file_name] = cosine_sim.cpu()
    
    # Predict - 2 Threshold
    predict_result = pairwise_predict(enc_query_list, cal_result, options["threshold1"])

    # Output - .csv
    now = datetime.now()
    timestamp = now.strftime("%Y-%m-%d-%H-%M-%S.") + f"{now.microsecond // 1000:03d}"
    file_path = f"{output_dir}/{timestamp}.csv"
    with open(file_path, "w", encoding="utf-8") as f:
        f.write("file_name,sim_cnt,sim_ratio,result\n")
        for file_name, result in predict_result.items():
            label = 1 if result["ratio"] >= options["threshold2"] else 0
            count = result["count"]; ratio = result["ratio"]
            f.write(f"{file_name},{count},{ratio},{label}\n")
    print("[pairwise_check] : Complete") # DEBUG
    return file_path

# Main
if __name__ == '__main__':
    os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    model = SentenceTransformer("jhgan/ko-sbert-sts", trust_remote_code=True) # TODO: Modify SBERT Model when you fine-tuned
    result = pairwise_check(confidential_file_path="../data", enc_confidential_path="../output/enc_confidential", query_file_path="../data/고대-5.txt", is_query_file=True, model=model)
    print(result)
    os._exit(0) # TODO: Need to solve this issue
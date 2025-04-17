import os, argparse
from sentence_transformers import SentenceTransformer
from sbert import pairwise_check

def sbert_parse_arguments():
    parser = argparse.ArgumentParser(description="Pairwise Similarity Check using SBERT")
    parser.add_argument("--confidential_file_path", type=str, required=True)
    parser.add_argument("--enc_confidential_path", type=str, required=True)
    parser.add_argument("--query_file_path", type=str, required=True)
    parser.add_argument("--query_txt", type=str, required=True)
    parser.add_argument("--is_query_file", type=bool, required=True)
    return parser.parse_args()

if __name__ == '__main__':
    args = sbert_parse_arguments() # SBERT Parser
    model = SentenceTransformer("jhgan/ko-sbert-sts", trust_remote_code=True) # TODO: Modify SBERT Model when you fine-tuned
    result = pairwise_check(
        model=model,
        confidential_file_path=args.confidential_file_path,
        enc_confidential_path=args.enc_confidential_path,
        query_txt=args.query_txt or "",
        query_file_path=args.query_file_path or "",
        is_query_file=args.is_query_file
    )
    print(f"[SBERT] 결과 파일 : {result}") # DEBUG
    os._exit(0)
# flask_server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from chat import chain as chat_chain
from sbert import pairwise_check
from sentence_transformers import SentenceTransformer

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# 메시지를 LangChain 형식으로 파싱하는 함수
def parse_messages(messages_data):
    parsed = []
    for msg in messages_data:
        type_ = msg.get("type")
        content = msg.get("content")

        if type_ == "human":
            parsed.append(HumanMessage(content=content))
        elif type_ == "ai":
            parsed.append(AIMessage(content=content))
        elif type_ == "system":
            parsed.append(SystemMessage(content=content))
    return parsed


@app.route("/pairwise-check", methods=["POST"])
def pairwise_check_api():
    data = request.json
    query_text = data.get("query_text", "")

    if not query_text:
        return jsonify({"error": "query_text is required"}), 400

    # SBERT 모델 로드
    model = SentenceTransformer("jhgan/ko-sbert-sts", trust_remote_code=True)

    # pairwise_check 실행
    result_csv_path = pairwise_check(
        model=model,
        confidential_file_path="./data",  
        enc_confidential_path="../output/enc_confidential",  
        query_txt=query_text,
        is_query_file=False
    )

    return jsonify({"result_file": result_csv_path})



@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    messages_data = data.get("messages", [])
    parsed_messages = parse_messages(messages_data)

    result = chat_chain.invoke({"messages": parsed_messages})
    return jsonify({"response": result})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)
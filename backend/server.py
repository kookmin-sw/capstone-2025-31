# chat_server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from chat import chain as chat_chain
from vector_db import VectorSearchEngine, default_options
import os

# 전역 벡터 검색 엔진 객체 초기화
engine = VectorSearchEngine(
    index_path="output/index.bin",
    label_map_path="output/label_map.pkl",
    model_name="jhgan/ko-sbert-sts"
)


# 최초 실행 시 한 번만 수행
engine.encode_confidential_file("./data")
# Flask app init
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

    try:
        # 쿼리 검사 실행
        match_count, total_count = engine.query_confidential_file(
            query_text=query_text,
            top_k=1,
            sim_threshold=default_options["threshold1"]
        )

        match_ratio = match_count / total_count * 100
        is_flagged = match_ratio >= default_options["threshold2"]

        return jsonify({
            "match_count": int(match_count),
            "total_count": int(total_count),
             "flagged": bool(match_count > 0)  
        })

    except Exception as e:
        import traceback
        traceback.print_exc()  # 전체 에러 로그 출력
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500


@app.route("/chat", methods=["POST"])

def chat():
    data = request.json
    messages_data = data.get("messages", [])
    parsed_messages = parse_messages(messages_data)

    result = chat_chain.invoke({"messages": parsed_messages})
    return jsonify({"response": result})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)


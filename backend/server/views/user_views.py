from flask import Blueprint
from flask import Flask, request, jsonify, current_app
from flask_cors import CORS
from flasgger import swag_from

from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from ..chat import chain as chat_chain
from ..vector_db import default_options

from server import db
from server.models import Query, Detected, Confidential
import json

user_bp = Blueprint('user', __name__, url_prefix='/user')

CORS(user_bp, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

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

# /user/check
@user_bp.route("/check", methods=["POST"])
@swag_from({
    'tags': ['User'],
    'summary': '기밀 여부 검사',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'query_text': {
                        'type': 'string',
                        'example': '기밀 내용이 포함된 질문입니다.'
                    }
                },
                'required': ['query_text']
            }
        }
    ],
    'responses': {
        200: {
            'description': '기밀 여부 검사 결과',
            'examples': {
                'application/json': {
                    "match_count": 3,
                    "total_count": 5,
                    "flagged": True,
                    "similarity": 60.0
                }
            }
        },
        400: {
            'description': '입력 누락'
        },
        500: {
            'description': '서버 에러'
        }
    }
})
def check_api():
    data = request.json
    query_text = data.get("query_text", "")

    if not query_text:
        return jsonify({"error": "query_text is required"}), 400

    try:
        # 쿼리 검사 실행
        filename, positions, match_count, total_count = current_app.engine.query_confidential_file(
            query_text=query_text,
            top_k=1,
            sim_threshold=default_options["threshold1"]
        )

        match_ratio = match_count / total_count * 100
        is_flagged = match_ratio >= default_options["threshold2"]

        # 쿼리 저장
        q = Query(
            content=query_text,
            is_detected=is_flagged
        )

        # 기밀 detected에 포함
        if is_flagged:
            d = Detected(
                query=q,
                confidential_id= db.session.query(Confidential).filter_by(file_name=filename).first().id,
                similarity=match_ratio,
                position=json.dumps(positions),
                match_count=match_count,
                total_count=total_count
            )
            db.session.add(d)
        
        db.session.add(q)
        db.session.commit()

        return jsonify({
            "match_count": int(match_count),
            "total_count": int(total_count),
            "flagged": bool(is_flagged),
            "similarity": float(match_ratio),
        })

    except Exception as e:
        import traceback
        traceback.print_exc()  # 전체 에러 로그 출력
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500


@user_bp.route("/chat", methods=["POST"])
@swag_from({
    'tags': ['User'],
    'summary': 'AI 채팅 응답',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'messages': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'type': {
                                    'type': 'string',
                                    'enum': ['human', 'ai', 'system']
                                },
                                'content': {
                                    'type': 'string'
                                }
                            },
                            'required': ['type', 'content']
                        },
                        'example': [
                            {"type": "system", "content": "당신은 비서입니다."},
                            {"type": "human", "content": "오늘 일정 알려줘"}
                        ]
                    }
                },
                'required': ['messages']
            }
        }
    ],
    'responses': {
        200: {
            'description': 'AI 응답 결과',
            'examples': {
                'application/json': {
                    "response": "오늘은 회의가 2건 있습니다."
                }
            }
        },
        500: {
            'description': '서버 에러'
        }
    }
})
def chat():
    data = request.json
    messages_data = data.get("messages", [])
    parsed_messages = parse_messages(messages_data)

    result = chat_chain.invoke({"messages": parsed_messages})
    return jsonify({"response": result})


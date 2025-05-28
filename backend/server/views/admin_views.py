from flask import Blueprint, request, jsonify,current_app
from flask_cors import CORS
from flasgger import swag_from

from werkzeug.utils import secure_filename
import os

from server import db
from server.models import Confidential, Detected, Query
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo


admin_bp = Blueprint('admin', __name__, url_prefix='/admin')
KST = ZoneInfo("Asia/Seoul")

CORS(admin_bp, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'data')
ALLOWED_EXTENSIONS = {'txt'}

# 탐지 통계
@admin_bp.route('/statistics', methods=['GET'])
@swag_from({
    'tags': ['Admin'],
    'summary': '탐지 통계 조회',
    'responses': {
        200: {
            'description': '탐지 관련 통계 정보',
            'examples': {
                'application/json': {
                    "weekly_query_count": 50,
                    "daily_query_count": 10,
                    "detected_count": 30,
                    "confidential_count": 5
                }
            }
        }
    }
})
def get_statistics():
    now = datetime.now(KST)  # 한국 시간
    one_week_ago = now - timedelta(days=7)
    one_day_ago = now - timedelta(days=1)

    weekly_query_count = db.session.query(db.func.count(Query.id)).filter(
        Query.created_at >= one_week_ago
    ).scalar()
    daily_query_count = db.session.query(db.func.count(Query.id)).filter(
        Query.created_at >= one_day_ago
    ).scalar()
    detected_count = db.session.query(db.func.count(Query.id)).filter(
        Query.is_detected == True
    ).scalar()
    confidential_count = db.session.query(db.func.count(Confidential.id)).scalar()

    return jsonify({
        "weekly_query_count": weekly_query_count,
        "daily_query_count": daily_query_count,
        "detected_count": detected_count,
        "confidential_count": confidential_count
    }), 200

# 문서 목록 조회
@admin_bp.route('/files', methods=['GET'])
@swag_from({
    'tags': ['Admin'],
    'summary': '문서 목록 조회',
    'parameters': [
        {
            'name': 'query',
            'in': 'query',
            'type': 'string',
            'required': False,
            'description': '파일명 검색어'
        }
    ],
    'responses': {
        200: {
            'description': '문서 리스트',
            'examples': {
                'application/json': [
                    {'id': 1, 'file_name': 'doc.txt', 'uploaded_at': '2024-01-01T12:00:00'}
                ]
            }
        }
    }
})
def get_files():
    query = request.args.get('query', '', type=str)

    if query:
        files = Confidential.query.filter(Confidential.file_name.ilike(f"%{query}%")) \
                                  .order_by(Confidential.uploaded_at.desc()) \
                                  .all()
    else:
        files = Confidential.query.order_by(Confidential.uploaded_at.desc()).all()

    return jsonify([
        {
            'id': file.id,
            'file_name': file.file_name,
            'uploaded_at': file.uploaded_at.isoformat()
        } for file in files
    ]), 200



# 문서 내용 조회
@admin_bp.route('/files/<int:file_id>', methods=['GET'])
@swag_from({
    'tags': ['Admin'],
    'summary': '문서 상세 조회',
    'parameters': [
        {
            'name': 'file_id',
            'in': 'path',
            'type': 'integer',
            'required': True,
            'description': '문서 ID'
        }
    ],
    'responses': {
        200: {
            'description': '문서 상세 내용',
            'examples': {
                'application/json': {
                    'id': 1,
                    'file_name': 'doc.txt',
                    'uploaded_at': '2024-01-01T12:00:00',
                    'char_count': 1234,
                    'sentence_count': 20,
                    'chunk_count': 15,
                    'content': '문서 내용...'
                }
            }
        },
        404: {
            'description': '문서를 찾을 수 없음'
        }
    }
})
def get_file_detail(file_id):
    file = Confidential.query.get(file_id)
    if not file:
        return jsonify({'error': 'File not found'}), 404
    
    content = file.content
    char_count = len(content)
    sentence_count = content.count('. ') + content.count('! ') + content.count('? ')

    chunk_count = sum(
        1 for value in current_app.engine.label_map.values()
        if value.startswith(file.file_name + "_sent_")
    )
    
    status = "done" if current_app.IOinterrupt else "uploading"

    return jsonify({
        'id': file.id,
        'file_name': file.file_name,
        'uploaded_at': file.uploaded_at.isoformat(),
        'char_count': char_count,
        'sentence_count': sentence_count,
        'chunk_count': chunk_count,
        'content': file.content,
        'status' : status
    }), 200

@admin_bp.route('/live', methods=['GET'])
@swag_from({
    'tags': ['Admin'],
    'summary': '실시간 탐지 데이터',
    'responses': {
        200: {
            'description': 'Query-Confidential 매핑 정보',
            'examples': {
                'application/json': [
                    {
                        'query_id': 1,
                        'created_at': '2024-01-01T12:00:00',
                        'is_detected': True,
                        'file_name': 'secret.txt',
                        'similarity': 85,
                        'user': 'admin'
                    }
                ]
            }
        }
    }
})

def get_live():
    results = db.session.query(Query, Detected, Confidential)\
        .outerjoin(Detected, Query.id == Detected.query_id)\
        .outerjoin(Confidential, Detected.confidential_id == Confidential.id)\
        .order_by(Query.created_at.desc())\
        .limit(10).all()

    data = []
    for q, d, c in results:
        data.append({
            'query_id': q.id,
            'created_at': q.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            'is_detected': q.is_detected,
            'file_name': c.file_name if c else "-",        # 탐지 안 된 경우
            'similarity': d.similarity if d else "-",
            'user': "admin",  # 향후 로그인 연동 시 수정
        })

    return jsonify(data), 200


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# 문서 업로드   
@admin_bp.route('/files', methods=['POST'])
@swag_from({
    'tags': ['Admin'],
    'summary': '문서(txt) 업로드',
    'consumes': ['multipart/form-data'],
    'parameters': [
        {
            'name': 'file',
            'in': 'formData',
            'type': 'file',
            'required': True,
            'description': '업로드할 .txt 파일'
        }
    ],
    'responses': {
        201: {
            'description': '파일 업로드 성공',
            'examples': {
                'application/json': {
                    'message': 'File uploaded successfully',
                    'id': 1
                }
            }
        },
        400: {
            'description': '파일 누락 또는 확장자 오류'
        }
    }
})
def upload_txt_file():
    current_app.IOinterrupt = False

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Only .txt files are allowed'}), 400

    raw_filename = file.filename  # 원본 파일명 그대로 사용 (한글 포함)
    filename = secure_filename(raw_filename)  # 저장용으로만 처리

    save_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(save_path)

    # 파일 내용을 읽어서 DB에 저장
    with open(save_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_file = Confidential(
        file_name=filename,
        content=content,
        uploaded_at=datetime.now(KST)
    )

    current_app.engine.add_confidential_file(save_path)

    db.session.add(new_file)
    db.session.commit()
    
    current_app.IOinterrupt = True

    return jsonify({'message': 'File uploaded successfully', 'id': new_file.id}), 201

#false 불가능, true 가능
# 파일 업로드 가능 여부
@admin_bp.route('/IOinterrupt', methods=['GET'])
@swag_from({
    'tags': ['Admin'],
    'summary': '파일 업로드 가능 여부 조회',
    'responses': {
        200: {
            'description': '현재 업로드 가능 여부',
            'examples': {
                'application/json': {'IOinterrupt': True}
            }
        }
    }
})
def get_IOinterrupt():
    return jsonify({'IOinterrupt': current_app.IOinterrupt}), 200

# 문서 삭제
@admin_bp.route('/files/<int:file_id>', methods=['DELETE'])
@swag_from({
    'tags': ['Admin'],
    'summary': '문서 삭제',
    'parameters': [
        {
            'name': 'file_id',
            'in': 'path',
            'type': 'integer',
            'required': True,
            'description': '삭제할 문서 ID'
        }
    ],
    'responses': {
        200: {
            'description': '삭제 성공',
            'examples': {
                'application/json': {'message': 'File deleted successfully'}
            }
        },
        404: {
            'description': '문서를 찾을 수 없음'
        }
    }
})
def delete_file(file_id):
    file = Confidential.query.get(file_id)
    if not file:
        return jsonify({'error': 'File not found'}), 404

    db.session.delete(file)
    db.session.commit()
    return jsonify({'message': 'File deleted successfully'}), 200

@admin_bp.route('/detail', methods=['GET'])
@swag_from({
    'tags': ['Admin'],
    'summary': '탐지 상세 목록',
    'responses': {
        200: {
            'description': '탐지 리스트',
            'examples': {
                'application/json': [
                    {
                        'detected_id': 1,
                        'query_id': 2,
                        'created_at': '2024-01-01T12:00:00',
                        'user': 'admin'
                    }
                ]
            }
        }
    }
})
def get_detail():
    try:
        query = db.session.query(Detected, Query, Confidential) \
            .join(Query) \
            .join(Confidential) \
            .all()

        result = []
        for detected, query, confidential in query:
            result.append({
                'detected_id': detected.id,
                'query_id': query.id,
                'created_at': query.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                'user': "admin",
            })
        return jsonify(result), 200
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 

@admin_bp.route('/detail/<int:detected_id>', methods=['GET'])
@swag_from({
    'tags': ['Admin'],
    'summary': '탐지 상세 정보 조회',
    'parameters': [
        {
            'name': 'detected_id',
            'in': 'path',
            'type': 'integer',
            'required': True,
            'description': '탐지 ID'
        }
    ],
    'responses': {
        200: {
            'description': '탐지 상세 정보',
            'examples': {
                'application/json': {
                    'detected_id': 1,
                    'position': {"start": 10, "end": 50},
                    'similarity': 88,
                    'match_count': 5,
                    'total_count': 8,
                    'len': 200,
                    'row': 7
                }
            }
        },
        404: {
            'description': '탐지 정보 없음'
        }
    }
})
def get_detail_by_id(detected_id):
    result_tuple = db.session.query(Detected, Query, Confidential)\
        .join(Query).join(Confidential)\
        .filter(Detected.id == detected_id).first()

    if not result_tuple:
        return jsonify({'error': 'Detected not found'}), 404

    detected, query, confidential = result_tuple  # 튜플 언패킹

    row_count = query.content.count('. ') + query.content.count('! ') + query.content.count('? ')

    result = {
        'detected_id': detected.id,
        'position': detected.position,
        'similarity': detected.similarity,
        'match_count': detected.match_count,
        'total_count': detected.total_count,
        'len': len(query.content),
        'row': row_count,
        'query_text': query.content,             
        'file_content': confidential.content,    
        'file_name': confidential.file_name 
    }

    return jsonify(result), 200


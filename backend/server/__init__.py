from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flasgger import Swagger
import os
import config

# ORM 객체 생성 (중앙에서 정의)
db = SQLAlchemy()
migrate = Migrate()

def initial_file(confidential_file_path):
    from .models import Confidential  # import 여기에! (순환 방지)
    confidential_file_list = os.listdir(confidential_file_path)

    for file_name in confidential_file_list:
        file_path = os.path.join(confidential_file_path, file_name)
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        file = Confidential(content=content, file_name=file_name)
        db.session.add(file)

    db.session.commit()

def create_app():
    app = Flask(__name__)
    app.config.from_object(config)

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    db.init_app(app)
    migrate.init_app(app, db)

    from . import models  # 모델 import는 db 초기화 이후
    with app.app_context():
        if not models.Confidential.query.first():
            initial_file("./data")

    from .vector_db import VectorSearchEngine
    engine = VectorSearchEngine(
        index_path="output/index.bin",
        label_map_path="output/label_map.pkl",
        model_name="jhgan/ko-sbert-sts"
    )
    engine.encode_confidential_file("./data")

    app.engine = engine
    app.IOinterrupt = True

    Swagger(app)

    from .views import user_views, admin_views
    app.register_blueprint(user_views.user_bp)
    app.register_blueprint(admin_views.admin_bp)

    return app

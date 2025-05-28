from server import db
from datetime import datetime
from zoneinfo import ZoneInfo

KST = ZoneInfo("Asia/Seoul")

class Confidential(db.Model):
    __tablename__ = 'confidential'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    file_name = db.Column(db.String(45), nullable=False)
    uploaded_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(KST))

    # 관계 설정
    detected = db.relationship('Detected', back_populates='confidential', cascade="all, delete-orphan")


class Query(db.Model):
    __tablename__ = 'queries'

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(KST))
    is_detected = db.Column(db.Boolean, nullable=False, default=False)
    content = db.Column(db.Text, nullable=False)

    # 관계 설정
    detected = db.relationship('Detected', back_populates='query', cascade="all, delete-orphan")


class Detected(db.Model):
    __tablename__ = 'detected'

    id = db.Column(db.Integer, primary_key=True)
    query_id = db.Column(db.Integer, db.ForeignKey('queries.id'), nullable=False, index=True)
    confidential_id = db.Column(db.Integer, db.ForeignKey('confidential.id'), nullable=False, index=True)
    position = db.Column(db.JSON, nullable=True)
    similarity = db.Column(db.Integer, nullable=True)
    match_count = db.Column(db.Integer, nullable=True)
    total_count = db.Column(db.Integer, nullable=True)

    # 관계 설정
    query = db.relationship('Query', back_populates='detected')
    confidential = db.relationship('Confidential', back_populates='detected')

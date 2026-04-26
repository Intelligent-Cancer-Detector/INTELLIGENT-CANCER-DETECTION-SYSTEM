from flask_sqlalchemy import SQLAlchemy
import datetime

# 1. Initialize the database object HERE
db = SQLAlchemy()

# 2. Define your Models
class Hospital(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    # ... rest of your hospital fields

class User(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    email = db.Column(db.String(100), unique=True)
    password_hash = db.Column(db.String(255))
    name = db.Column(db.String(100))
    role = db.Column(db.String(50))
    hospital_id = db.Column(db.String(50), db.ForeignKey('hospital.id'))

class Assessment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_name = db.Column(db.String(100))
    symptoms = db.Column(db.Text)
    top_prediction = db.Column(db.String(50))
    confidence = db.Column(db.Float)
    hospital_id = db.Column(db.String(50), db.ForeignKey('hospital.id'))

class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(100))
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
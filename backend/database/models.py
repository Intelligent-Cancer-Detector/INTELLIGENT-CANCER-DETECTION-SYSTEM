from .db_config import db
from datetime import datetime

class Hospital(db.Model):
    id = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100))
    hospital_type = db.Column(db.String(50))
    address = db.Column(db.Text)
    verified = db.Column(db.Boolean, default=True)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class User(db.Model):
    id = db.Column(db.String(20), primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(100))
    role = db.Column(db.String(20), default='doctor') # super_admin, doctor
    hospital_id = db.Column(db.String(20), db.ForeignKey('hospital.id'))
    active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)

    def to_dict(self):
        d = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        if 'password_hash' in d: del d['password_hash']
        return d

class Patient(db.Model):
    id = db.Column(db.String(20), primary_key=True)
    hospital_id = db.Column(db.String(20), db.ForeignKey('hospital.id'))
    full_name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.Integer) # 1 for Male, 0 for Female (Matching our ML model)
    contact = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Assessment(db.Model):
    id = db.Column(db.String(20), primary_key=True)
    hospital_id = db.Column(db.String(20), db.ForeignKey('hospital.id'))
    patient_id = db.Column(db.String(20), db.ForeignKey('patient.id'))
    doctor_id = db.Column(db.String(20), db.ForeignKey('user.id'))
    
    # ML Outputs
    risk_level = db.Column(db.String(20)) # HIGH, MEDIUM, LOW
    confidence = db.Column(db.Float)     # Percentage
    cancer_type = db.Column(db.String(50)) 
    
    # Data Storage
    symptoms_json = db.Column(db.Text)   # Stores the input symptoms as a string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships to make dashboard queries easy
    doctor = db.relationship('User', backref='assessments')
    patient = db.relationship('Patient', backref='assessments')

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class OTPCode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(10), nullable=False)
    purpose = db.Column(db.String(20)) # registration, reg_data
    expires_at = db.Column(db.DateTime)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(20))
    hospital_id = db.Column(db.String(20))
    action = db.Column(db.String(50))
    resource = db.Column(db.String(50))
    resource_id = db.Column(db.String(50))
    details = db.Column(db.Text)
    ip_address = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
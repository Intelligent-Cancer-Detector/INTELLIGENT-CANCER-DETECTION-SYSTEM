import os
import sys
import hashlib
import datetime
import joblib

# ─── PATH FIX ────────────────────────────────────────────────────────
# This ensures that 'backend' is in the Python path so we can 
# find the 'database' folder and 'app.py' correctly.
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# ─── IMPORTS ─────────────────────────────────────────────────────────
from app import app
from database.db_config import db, Hospital, User, AuditLog, Assessment

def hash_password(password):
    """Simple SHA256 hashing for test users."""
    return hashlib.sha256(password.encode()).hexdigest()

def seed():
    with app.app_context():
        # Create the tables in the database (Supabase or SQLite)
        print("🛠️  Creating database tables...")
        db.create_all()

        # Check if already seeded to prevent duplicates
        if Hospital.query.filter_by(id="BBH001").first():
            print("ℹ️  Database already seeded — skipping.")
            return

        print("🌱 Seeding database with test data...")

        # 1. Create Hospital
        hospital = Hospital(
            id="BBH001",
            name="BBH NATIONAL HOSPITAL",
            email="info@bbhnational.org",
            hospital_type="private",
            license_number="BBH/LIC/2024/00123",
            year_established=1995,
            address="123 Healthcare Avenue",
            city="Nairobi",
            state="Nairobi County",
            postal_code="00100",
            country="Kenya",
            phone="+254 722 123456",
            emergency_phone="+254 733 123456",
            verified=True,
            active=True
        )
        db.session.add(hospital)

        # 2. Create Super Admin
        admin = User(
            id="USR001",
            email="wycliffr254@gmail.com",
            password_hash=hash_password("Test@123456"),
            name="Dr. Wycliff Nthiga",
            role="super_admin",
            department="Administration",
            designation="Medical Director",
            license_number="KMPDC/2024/0789",
            phone="+254 722 987654",
            hospital_id="BBH001",
            active=True
        )
        db.session.add(admin)

        # 3. Create Doctors
        doctors_data = [
            ("USR002", "d.kimani@bbh.org", "Dr. David Kimani", "doctor", "Oncology"),
            ("USR003", "l.achieng@bbh.org", "Dr. Lucy Achieng", "doctor", "Radiology"),
        ]
        for uid, email, name, role, dept in doctors_data:
            new_user = User(
                id=uid,
                email=email,
                password_hash=hash_password("Staff@123456"),
                name=name,
                role=role,
                department=dept,
                hospital_id="BBH001",
                active=True
            )
            db.session.add(new_user)

        # 4. Create Sample AI Assessment (Testing the Model)
        print("🧠 Generating sample AI assessment...")
        try:
            # Simulate symptoms for a test patient
            test_symptoms = [
                "persistent cough", "chest pain", "fatigue", "wheezing", "weight loss",
                "coughing blood", "hoarseness", "loss of appetite", "bone pain", "headache"
            ]
            
            # Use the actual model to generate the seed result
            model = joblib.load(os.path.join(project_root, "model.pkl"))
            vectorizer = joblib.load(os.path.join(project_root, "vectorizer.pkl"))
            le = joblib.load(os.path.join(project_root, "label_encoder.pkl"))

            text_input = [" ".join(test_symptoms)]
            X = vectorizer.transform(text_input)
            probs = model.predict_proba(X)[0]
            top_idx = probs.argmax()
            
            sample_assessment = Assessment(
                patient_name="John Doe",
                symptoms=", ".join(test_symptoms),
                top_prediction=le.classes_[top_idx],
                confidence=round(float(probs[top_idx]), 2),
                doctor_id="USR002",
                hospital_id="BBH001"
            )
            db.session.add(sample_assessment)
        except Exception as e:
            print(f"⚠️  Could not seed assessment (Model missing): {e}")

        # 5. Log the action
        log = AuditLog(
            user_id="USR001",
            hospital_id="BBH001",
            action="SYSTEM_SEEDED",
            resource="database",
            details="Initial seed with hospital, staff, and AI assessment complete."
        )
        db.session.add(log)

        # Commit everything to the DB
        db.session.commit()
        print("\n✅ SEEDING SUCCESSFUL!")
        print(f"Hospital ID : BBH001")
        print(f"Admin Login : wycliffr254@gmail.com / Test@123456")

if __name__ == "__main__":
    seed()
# Supabase with Raw SQL

"""
This is for initializing all tables!
"""

import json
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from database.config import get_db_connection
import random
import uuid
from datetime import datetime, timedelta

load_dotenv()


def initialize_database():
    """Create all necessary tables in Supabase"""
    conn = get_db_connection()
    cur = conn.cursor()

    print("Creating all tables if they dont exists....")

    # 1. Hospital Table
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS hospital (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT,
            license_number TEXT,
            hospital_type TEXT,
            address TEXT,
            city TEXT,
            state TEXT,
            postal_code TEXT,
            country TEXT,
            phone TEXT,
            verified BOOLEAN DEFAULT true,
            active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    """
    )
    print("✅ Hospital table created")

    # 2. User Table (Doctors & Admins)
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            hospital_id TEXT REFERENCES hospital(id) ON DELETE CASCADE,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'doctor',
            department TEXT,
            phone TEXT,
            active BOOLEAN DEFAULT true,
            last_login TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    """
    )
    print("✅ Users table created")

    # 3. Patient Table
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS patient (
            id TEXT PRIMARY KEY,
            hospital_id TEXT REFERENCES hospital(id),
            full_name TEXT NOT NULL,
            age INTEGER,
            gender TEXT,
            contact TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """
    )
    print("✅ Patient table created")

    # 4. Assessment Table (ML Prediction Results)
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS assessment (
            id TEXT PRIMARY KEY,
            hospital_id TEXT REFERENCES hospital(id),
            patient_id TEXT REFERENCES patient(id),
            doctor_id TEXT REFERENCES users(id),
            risk_level TEXT,
            symptoms_json TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """
    )
    print("✅ Assessment table created")

    # 5. PREDICTION TABLE
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS predictions (
            pr_id TEXT PRIMARY KEY,
            assessment_id TEXT UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,
            top_cancer_type TEXT,
            top_probability FLOAT,
            lung_cancer_prob FLOAT,
            breast_cancer_prob FLOAT,
            colorectal_cancer_prob FLOAT,
            prostate_cancer_prob FLOAT,
            liver_cancer_prob FLOAT,
            cervical_cancer_prob FLOAT,
            brain_cancer_prob FLOAT,
            skin_cancer_prob FLOAT,
            pancreatic_cancer_prob FLOAT,
            eye_cancer_prob FLOAT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """
    )
    print("✅ Predictions table created")

    # 6. OTPCode Table (Important for registration & login)
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS otp_code (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL,
            code TEXT NOT NULL,
            purpose TEXT,
            expires_at TIMESTAMPTZ NOT NULL,
            used BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """
    )
    print("✅ OTP Code table created")

    # 7. AuditLog Table (Optional but good for security)
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS audit_log (
            id SERIAL PRIMARY KEY,
            user_id TEXT,
            hospital_id TEXT,
            action TEXT,
            resource TEXT,
            resource_id TEXT,
            details TEXT,
            ip_address TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """
    )
    print("✅ Audit Log table created")

    # ============================================
    # HOSPITAL PROFILE TABLES (NEW)
    # ============================================

    # 8. Departments Table
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS departments (
            id SERIAL PRIMARY KEY,
            hospital_id TEXT REFERENCES hospital(id) ON DELETE CASCADE,
            name VARCHAR(200) NOT NULL,
            head VARCHAR(200),
            description TEXT,
            location VARCHAR(200),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    """
    )
    print("✅ Departments table created")

    # 9. User Departments Table (junction table - connects users to departments)
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS user_departments (
            id SERIAL PRIMARY KEY,
            user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
            department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
            position_in_dept VARCHAR(100),
            join_date DATE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """
    )
    print("✅ User Departments table created")

    # =========================
    # INDEXES (PERFORMANCE)
    # =========================

    cur.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_assessment_hospital 
        ON assessment(hospital_id);
    """
    )

    cur.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_assessment_created 
        ON assessment(created_at);
    """
    )

    cur.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_patient_hospital 
        ON patient(hospital_id);
    """
    )

    cur.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_assessment_hospital_created 
        ON assessment(hospital_id, created_at DESC);
    """
    )

    cur.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_predictions_assessment
        ON predictions(assessment_id);
    """
    )

    # New indexes for hospital profile
    cur.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_departments_hospital 
        ON departments(hospital_id);
    """
    )

    cur.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_user_departments_user 
        ON user_departments(user_id);
    """
    )

    cur.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_user_departments_dept 
        ON user_departments(department_id);
    """
    )

    conn.commit()
    cur.close()
    conn.close()

    print("✅ All Supabase tables created successfully!")


# function for db seeding
def seed_database():
    conn = get_db_connection()
    cur = conn.cursor()

    print("🌱 Seeding MASSIVE realistic dataset...")

    hospital_id = "hosp_1"

    # -------------------------
    # 1. HOSPITAL
    # -------------------------
    cur.execute(
        """
        INSERT INTO hospital (id, name, city, country, phone, email, address)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id) DO NOTHING;
    """,
        (hospital_id, "Nairobi General Hospital", "Nairobi", "Kenya", 
         "+254 700 123456", "contact@nairobiGeneral.com", "123 Hospital Road, Nairobi"),
    )

    # -------------------------
    # 2. DOCTORS
    # -------------------------
    doctors = []
    doctor_names = [
        "Dr. Sarah Johnson", "Dr. Michael Chen", "Dr. Emily Rodriguez", 
        "Dr. James Wilson", "Dr. Lisa Adams", "Dr. Robert Kim", 
        "Dr. Maria Garcia", "Dr. David Brown"
    ]
    
    for i in range(8):
        doc_id = f"doc_{i}"
        doctors.append(doc_id)

        cur.execute(
            """
            INSERT INTO users (id, hospital_id, full_name, email, password_hash, role, phone)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING;
        """,
            (
                doc_id,
                hospital_id,
                doctor_names[i],
                f"doc{i}@hospital.com",
                "hashedpass",
                "doctor",
                f"+254 700 {100000 + i}",
            ),
        )

    # -------------------------
    # 3. PATIENTS
    # -------------------------
    patients = []
    for i in range(100):
        patient_id = f"pat_{i}"
        patients.append(patient_id)

        cur.execute(
            """
            INSERT INTO patient (id, hospital_id, full_name, age, gender, contact)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING;
        """,
            (
                patient_id,
                hospital_id,
                f"Patient {i}",
                random.randint(18, 85),
                random.choice(["Male", "Female"]),
                f"07{random.randint(10000000, 99999999)}",
            ),
        )

    # -------------------------
    # 4. DEPARTMENTS
    # -------------------------
    departments_list = [
        ("Cardiology", "Dr. James Wilson", "Heart and cardiovascular care", "3rd Floor"),
        ("Oncology", "Dr. Sarah Johnson", "Cancer diagnosis and treatment", "2nd Floor"),
        ("Radiology", "Dr. Michael Chen", "Medical imaging and scans", "1st Floor"),
        ("Emergency", "Dr. Emily Rodriguez", "24/7 emergency care", "Ground Floor"),
        ("Pediatrics", "Dr. Lisa Adams", "Child healthcare", "2nd Floor"),
        ("Neurology", "Dr. Robert Kim", "Brain and nervous system", "4th Floor"),
        ("Orthopedics", "Dr. David Brown", "Bone and joint care", "3rd Floor"),
    ]
    
    for dept_name, dept_head, dept_desc, dept_loc in departments_list:
        cur.execute(
            """
            INSERT INTO departments (hospital_id, name, head, description, location)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """,
            (hospital_id, dept_name, dept_head, dept_desc, dept_loc),
        )
    
    # Get department IDs to assign to users
    cur.execute("SELECT id, name FROM departments WHERE hospital_id = %s", (hospital_id,))
    departments_data = cur.fetchall()
    dept_map = {dept['name']: dept['id'] for dept in departments_data}
    
    # -------------------------
    # 5. CONNECT USERS TO DEPARTMENTS
    # -------------------------
    for i, doc_id in enumerate(doctors):
        # Assign departments based on doctor index
        if i < len(departments_list):
            dept_name = departments_list[i][0]
            dept_id = dept_map.get(dept_name)
            if dept_id:
                cur.execute(
                    """
                    INSERT INTO user_departments (user_id, department_id, position_in_dept, join_date)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT DO NOTHING
                """,
                    (doc_id, dept_id, "Doctor", datetime.now().date()),
                )

    # -------------------------
    # 6. CANCER TYPES
    # -------------------------
    cancers = [
        "Lung Cancer",
        "Breast Cancer",
        "Colorectal Cancer",
        "Prostate Cancer",
        "Liver Cancer",
        "Cervical Cancer",
        "Brain Cancer",
        "Skin Cancer",
        "Pancreatic Cancer",
        "Eye Cancer",
    ]

    possible_symptoms = [
        "headache",
        "fatigue",
        "cough",
        "weight_loss",
        "fever",
        "chest_pain",
        "nausea",
    ]

    # -------------------------
    # 7. ASSESSMENTS + PREDICTIONS
    # -------------------------
    for i in range(500):
        selected = random.sample(possible_symptoms, k=random.randint(1, 4))
        symptoms = {s: True for s in selected}

        assess_id = f"assess_{uuid.uuid4().hex[:8]}"
        patient_id = random.choice(patients)
        doctor_id = random.choice(doctors)

        created_at = datetime.now() - timedelta(days=random.randint(0, 365))

        # Insert assessment
        cur.execute(
            """
            INSERT INTO assessment (
                id, hospital_id, patient_id, doctor_id,
                risk_level, symptoms_json, created_at
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (id) DO NOTHING;
        """,
            (
                assess_id,
                hospital_id,
                patient_id,
                doctor_id,
                random.choice(["LOW", "MEDIUM", "HIGH"]),
                json.dumps(symptoms),
                created_at,
            ),
        )

        # Generate prediction
        probs = [random.random() for _ in range(len(cancers))]
        total = sum(probs)
        probs = [p / total for p in probs]

        top_index = probs.index(max(probs))
        top_cancer = cancers[top_index]
        top_prob = round(max(probs), 2)

        # Insert prediction
        cur.execute(
            """
            INSERT INTO predictions (
                pr_id, assessment_id,
                top_cancer_type, top_probability,
                lung_cancer_prob, breast_cancer_prob,
                colorectal_cancer_prob, prostate_cancer_prob,
                liver_cancer_prob, cervical_cancer_prob,
                brain_cancer_prob, skin_cancer_prob,
                pancreatic_cancer_prob, eye_cancer_prob
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (assessment_id) DO NOTHING;
        """,
            (str(uuid.uuid4()), assess_id, top_cancer, top_prob, *probs),
        )

    conn.commit()
    cur.close()
    conn.close()

    print("🔥 MASSIVE DATA INSERTED SUCCESSFULLY!")


# function to drop all tables
def reset_database():
    conn = get_db_connection()
    cur = conn.cursor()

    print("⚠️ Dropping all tables...")

    cur.execute("DROP TABLE IF EXISTS user_departments CASCADE;")
    cur.execute("DROP TABLE IF EXISTS departments CASCADE;")
    cur.execute("DROP TABLE IF EXISTS predictions CASCADE;")
    cur.execute("DROP TABLE IF EXISTS assessment CASCADE;")
    cur.execute("DROP TABLE IF EXISTS patient CASCADE;")
    cur.execute("DROP TABLE IF EXISTS users CASCADE;")
    cur.execute("DROP TABLE IF EXISTS hospital CASCADE;")
    cur.execute("DROP TABLE IF EXISTS otp_code CASCADE;")
    cur.execute("DROP TABLE IF EXISTS audit_log CASCADE;")

    conn.commit()
    cur.close()
    conn.close()

    print("✅ All tables dropped!")


# ADD THIS AT THE VERY BOTTOM:
if __name__ == "__main__":
    try:
        initialize_database()
        seed_database()
        print("🚀 Database initialization and seeding complete!")
    except Exception as e:
        print(f"❌ An error occurred: {e}")
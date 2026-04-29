# Supabase with Raw SQL


"""
This is for initializing all tables!
"""


from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from datetime import datetime
from database.config import get_db_connection

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

    # 3. Patient Table
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS patient (
            id TEXT PRIMARY KEY,
            hospital_id TEXT REFERENCES hospital(id),
            full_name TEXT NOT NULL,
            age INTEGER,
            gender TEXT,           -- 1 = Male, 0 = Female
            contact TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """
    )

    # 4. Assessment Table (ML Prediction Results)
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS assessment (
            id TEXT PRIMARY KEY,
            hospital_id TEXT REFERENCES hospital(id),
            patient_id TEXT REFERENCES patient(id),
            doctor_id TEXT REFERENCES users(id),
            risk_level TEXT,          -- HIGH, MEDIUM, LOW
            confidence FLOAT,
            cancer_type TEXT,
            symptoms_json TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """
    )

    # 5. OTPCode Table (Important for registration & login)
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS otp_code (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL,
            code TEXT NOT NULL,
            purpose TEXT,                    -- 'registration', 'login', 'reset_password'
            expires_at TIMESTAMPTZ NOT NULL,
            used BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """
    )

    # 6. AuditLog Table (Optional but good for security)
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

    conn.commit()
    cur.close()
    conn.close()

    print("✅ All Supabase tables created successfully!")


# function for db seeding
def seed_database():
    conn = get_db_connection()
    cur = conn.cursor()

    print("🌱 Seeding database...")

    # =========================
    # 1. HOSPITAL
    # =========================
    cur.execute(
        """
        INSERT INTO hospital (id, name, email, hospital_type, city, country, phone)
        VALUES 
        ('hosp_1', 'Nairobi General Hospital', 'info@nairobigh.com', 'public', 'Nairobi', 'Kenya', '0712345678')
        ON CONFLICT (id) DO NOTHING;
    """
    )

    # =========================
    # 2. USERS (DOCTORS)
    # =========================
    cur.execute(
        """
        INSERT INTO users (id, hospital_id, full_name, email, password_hash, role, department)
        VALUES
        ('doc_1', 'hosp_1', 'Dr. John Smith', 'john@hospital.com', 'hashedpass', 'doctor', 'Oncology'),
        ('doc_2', 'hosp_1', 'Dr. Alice Wanjiku', 'alice@hospital.com', 'hashedpass', 'doctor', 'Radiology')
        ON CONFLICT (id) DO NOTHING;
    """
    )

    # =========================
    # 3. PATIENTS
    # =========================
    cur.execute(
        """
        INSERT INTO patient (id, hospital_id, full_name, age, gender, contact)
        VALUES
        ('pat_1', 'hosp_1', 'Peter Mwangi', 45, 'Male', '0700000001'),
        ('pat_2', 'hosp_1', 'Mary Atieno', 38, 'Female', '0700000002'),
        ('pat_3', 'hosp_1', 'James Otieno', 60, 'Male', '0700000003'),
        ('pat_4', 'hosp_1', 'Faith Njeri', 29, 'Female', '0700000004')
        ON CONFLICT (id) DO NOTHING;
    """
    )

    # =========================
    # 4. ASSESSMENTS
    # =========================
    cur.execute(
        """
        INSERT INTO assessment (
            id, hospital_id, patient_id, doctor_id,
            risk_level, confidence, cancer_type, symptoms_json
        )
        VALUES
        ('assess_1', 'hosp_1', 'pat_1', 'doc_1', 'HIGH', 0.92, 'Lung Cancer', '{"cough": true, "chest_pain": true}'),
        ('assess_2', 'hosp_1', 'pat_2', 'doc_2', 'LOW', 0.30, NULL, '{"fatigue": true}'),
        ('assess_3', 'hosp_1', 'pat_3', 'doc_1', 'MEDIUM', 0.65, 'Colon Cancer', '{"weight_loss": true}'),
        ('assess_4', 'hosp_1', 'pat_4', 'doc_2', 'HIGH', 0.88, 'Breast Cancer', '{"lump": true}'),
        ('assess_5', 'hosp_1', 'pat_1', 'doc_2', 'LOW', 0.20, NULL, '{"headache": true}')
        ON CONFLICT (id) DO NOTHING;
    """
    )

    conn.commit()
    cur.close()
    conn.close()

    print("✅ Seed data inserted successfully!")


# function to drop all tables
def reset_database():
    conn = get_db_connection()
    cur = conn.cursor()

    print("⚠️ Dropping all tables...")

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
    # ... (all your existing functions like initialize_database and seed_database)

# ADD THIS AT THE VERY BOTTOM:
if __name__ == "__main__":
    try:
        initialize_database()
        seed_database()
        print("🚀 Database initialization and seeding complete!")
    except Exception as e:
        print(f"❌ An error occurred: {e}")

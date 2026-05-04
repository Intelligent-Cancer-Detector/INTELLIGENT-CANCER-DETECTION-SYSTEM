# Supabase with Raw SQL

"""
This is for initializing all tables!
"""

import json
import random
import uuid
from datetime import datetime, timedelta

from database.config import get_db_connection
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor

load_dotenv()


def initialize_database():
    """Create all necessary tables in Supabase"""
    conn = get_db_connection()
    cur = conn.cursor()

    print("Creating all tables if they dont exists....")

    # 1. Hospital Table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS hospital (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            hospital_logo TEXT,
            license_number TEXT,
            hospital_type TEXT,
            address TEXT,
            city TEXT,
            state TEXT,
            postal_code TEXT,
            country TEXT,
            phone TEXT,
            description TEXT,
            verified BOOLEAN DEFAULT true,
            active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    print("✅ Hospital table created")

    # 2. User Table (Doctors & Admins)
    cur.execute("""
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
    """)
    print("✅ Users table created")

    # 3. Patient Table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS patient (
            id TEXT PRIMARY KEY,
            hospital_id TEXT REFERENCES hospital(id),
            full_name TEXT NOT NULL,
            age INTEGER,
            gender TEXT,
            contact TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    print("✅ Patient table created")

    # 4. Assessment Table (ML Prediction Results)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS assessment (
            id TEXT PRIMARY KEY,
            hospital_id TEXT REFERENCES hospital(id),
            patient_id TEXT REFERENCES patient(id),
            doctor_id TEXT REFERENCES users(id),
            risk_level TEXT,
            symptoms_json TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    print("✅ Assessment table created")

    # 5. PREDICTION TABLE
    cur.execute("""
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
    """)
    print("✅ Predictions table created")

    # 6. OTPCode Table (Important for registration & login)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS otp_code (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL,
            code TEXT NOT NULL,
            purpose TEXT,
            expires_at TIMESTAMPTZ NOT NULL,
            used BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    print("✅ OTP Code table created")

    # 7. AuditLog Table (Optional but good for security)
    cur.execute("""
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
    """)
    print("✅ Audit Log table created")

    # ============================================
    # HOSPITAL PROFILE TABLES
    # ============================================

    # 8. Departments Table
    cur.execute("""
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
    """)
    print("✅ Departments table created")

    # 9. User Departments Table (junction table - connects users to departments)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS user_departments (
            id SERIAL PRIMARY KEY,
            user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
            department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
            position_in_dept VARCHAR(100),
            join_date DATE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    print("✅ User Departments table created")

    # =========================
    # INDEXES (PERFORMANCE)
    # =========================

    cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_assessment_hospital 
        ON assessment(hospital_id);
    """)

    cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_assessment_created 
        ON assessment(created_at);
    """)

    cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_patient_hospital 
        ON patient(hospital_id);
    """)

    cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_assessment_hospital_created 
        ON assessment(hospital_id, created_at DESC);
    """)

    cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_predictions_assessment
        ON predictions(assessment_id);
    """)

    # New indexes for hospital profile
    cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_departments_hospital 
        ON departments(hospital_id);
    """)

    cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_user_departments_user 
        ON user_departments(user_id);
    """)

    cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_user_departments_dept 
        ON user_departments(department_id);
    """)

    conn.commit()
    cur.close()
    conn.close()

    print("✅ All Supabase tables created successfully!")


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

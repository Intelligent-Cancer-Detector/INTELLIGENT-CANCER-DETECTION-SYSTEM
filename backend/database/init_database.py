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

    conn.commit()
    cur.close()
    conn.close()

    print("✅ All Supabase tables created successfully!")

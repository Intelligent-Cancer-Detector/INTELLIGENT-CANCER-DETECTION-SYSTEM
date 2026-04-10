"""
ICDS - Database Seeder
Creates the test hospital and admin user on first run.
Run: python database/seed.py
"""

import os, sys, datetime
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from database.db_config import db
from database.models import Hospital, User, AuditLog
import hashlib

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def seed():
    with app.app_context():
        db.create_all()

        # Check if already seeded
        if Hospital.query.first():
            print("  ℹ  Database already seeded — skipping")
            return

        print()
        print("  Seeding database with test data...")

        # ── Create BBH National Hospital ──────────────────────────────────────
        hospital = Hospital(
            id               = "BBH001",
            name             = "BBH NATIONAL HOSPITAL",
            email            = "info@bbhnational.org",
            hospital_type    = "private",
            license_number   = "BBH/LIC/2024/00123",
            year_established = 1995,
            address          = "123 Healthcare Avenue",
            city             = "Nairobi",
            state            = "Nairobi County",
            postal_code      = "00100",
            country          = "Kenya",
            phone            = "+254 722 123456",
            emergency_phone  = "+254 733 123456",
            verified         = True,
            active           = True,
        )
        db.session.add(hospital)

        # ── Create Super Admin ────────────────────────────────────────────────
        admin = User(
            id             = "USR001",
            email          = "wycliffr254@gmail.com",
            password_hash  = hash_password("Test@123456"),
            name           = "Dr. Wycliff Nthiga",
            role           = "super_admin",
            department     = "Administration",
            designation    = "Medical Director",
            license_number = "KMPDC/2024/0789",
            phone          = "+254 722 987654",
            hospital_id    = "BBH001",
            active         = True,
        )
        db.session.add(admin)

        # ── Create sample doctors ─────────────────────────────────────────────
        doctors = [
            ("USR002", "d.kimani@bbh.org",   "Dr. David Kimani",  "doctor", "Oncology"),
            ("USR003", "l.achieng@bbh.org",  "Dr. Lucy Achieng",  "doctor", "Radiology"),
            ("USR004", "j.otieno@bbh.org",   "Dr. James Otieno",  "doctor", "Surgery"),
            ("USR005", "a.njeri@bbh.org",    "Alice Njeri",        "nurse",  "Oncology Ward"),
        ]
        for uid, email, name, role, dept in doctors:
            user = User(
                id            = uid,
                email         = email,
                password_hash = hash_password("Staff@123456"),
                name          = name,
                role          = role,
                department    = dept,
                hospital_id   = "BBH001",
                active        = True,
            )
            db.session.add(user)

        # ── Audit log ─────────────────────────────────────────────────────────
        log = AuditLog(
            user_id     = "USR001",
            hospital_id = "BBH001",
            action      = "SYSTEM_SEEDED",
            resource    = "database",
            details     = "Initial database seed completed",
        )
        db.session.add(log)

        db.session.commit()

        print("  ✅ Hospital created  : BBH NATIONAL HOSPITAL")
        print("  ✅ Admin created     : wycliffr254@gmail.com / Test@123456")
        print("  ✅ Staff created     : 4 doctors/nurses")
        print("  ✅ Audit log created")
        print()
        print("  Database file : backend/icds.db")
        print()

if __name__ == "__main__":
    print()
    print("╔══════════════════════════════════════════════════════════╗")
    print("║         ICDS — Database Seeder                          ║")
    print("╚══════════════════════════════════════════════════════════╝")
    seed()
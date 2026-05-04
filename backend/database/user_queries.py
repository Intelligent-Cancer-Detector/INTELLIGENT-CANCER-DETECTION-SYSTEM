import datetime
import hashlib

from database.config import query

# ====================== USER QUERIES ======================


def create_user(
    user_id,
    full_name,
    email,
    password_hash,
    hospital_id,
    role="super_admin",
    department=None,
    phone=None,
):
    """Create new user"""
    sql = """
        INSERT INTO users (id , hospital_id, full_name, email, password_hash, role, department, phone, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id, full_name, email, role, hospital_id, created_at
    """
    result = query(
        sql,
        [
            user_id,
            hospital_id,
            full_name,
            email,
            password_hash,
            role,
            department,
            phone,
            datetime.datetime.utcnow().isoformat(),
        ],
    )
    return result[0] if result else None


def get_user_by_email(email):
    """Find user by email"""
    sql = "SELECT * FROM users WHERE email = %s"
    result = query(sql, [email])
    return result[0] if result else None


def get_user_by_id(user_id):
    """Find user by ID"""
    sql = """
        SELECT id, full_name, email, role, hospital_id, department, phone, created_at 
        FROM users WHERE id = %s
    """
    result = query(sql, [user_id])
    return result[0] if result else None


def update_last_login(user_id):
    """Update last login time"""
    sql = "UPDATE users SET last_login = %s WHERE id = %s"
    query(sql, [datetime.datetime.utcnow().isoformat(), user_id])


def update_password(user_id, new_password_hash):
    """Update user password"""
    sql = "UPDATE users SET password_hash = %s, updated_at = %s WHERE id = %s"
    query(sql, [new_password_hash, datetime.datetime.utcnow().isoformat(), user_id])

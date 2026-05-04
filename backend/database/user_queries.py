from datetime import datetime, timezone

from database.config import query

# ====================== CREATE ======================


def create_user(
    user_id,
    full_name,
    email,
    password_hash,
    hospital_id,
    role,
    phone=None,
):
    """
    Universal user creator
    Used by:
    - Register (super_admin)
    - Staff creation (doctor, nurse, admin, etc.)
    """

    sql = """
        INSERT INTO users (
            id,
            hospital_id,
            full_name,
            email,
            password_hash,
            role,
            phone,
            active,
            created_at,
            updated_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id, full_name, email, role, hospital_id, phone, created_at
    """

    now = datetime.now(timezone.utc)

    result = query(
        sql,
        [
            user_id,
            hospital_id,
            full_name,
            email,
            password_hash,
            role,
            phone,
            True,
            now,
            now,
        ],
    )

    return result[0] if result else None


# ====================== DEPARTMENT ======================


def assign_user_to_department(
    user_id,
    department_id,
    position,
    join_date=None,
):
    """
    Link a user to a department
    """

    sql = """
        INSERT INTO user_departments (
            user_id,
            department_id,
            position_in_dept,
            join_date
        )
        VALUES (%s, %s, %s, %s)
    """

    query(sql, [user_id, department_id, position, join_date])


def get_user_departments(user_id):
    """
    Get all departments for a user
    """

    sql = """
        SELECT d.id, d.name, ud.position_in_dept, ud.join_date
        FROM user_departments ud
        JOIN departments d ON d.id = ud.department_id
        WHERE ud.user_id = %s
    """

    return query(sql, [user_id])


# ====================== READ ======================


def get_user_by_email(email):
    """Find user by email"""
    sql = "SELECT * FROM users WHERE email = %s AND active = true"
    result = query(sql, [email])
    return result[0] if result else None


def get_user_by_id(user_id):
    """Find user by ID"""
    sql = """
        SELECT id, full_name, email, role, hospital_id, phone, created_at
        FROM users
        WHERE id = %s AND active = true
    """
    result = query(sql, [user_id])
    return result[0] if result else None


def get_users_by_hospital(hospital_id):
    """Get all users in a hospital"""
    sql = """
        SELECT id, full_name, email, role, phone, created_at
        FROM users
        WHERE hospital_id = %s AND active = true
        ORDER BY created_at DESC
    """
    return query(sql, [hospital_id])


# ====================== UPDATE ======================


def update_user(
    user_id,
    full_name=None,
    email=None,
    phone=None,
    role=None,
):
    """
    Update user details (partial update)
    """

    sql = """
        UPDATE users SET
            full_name = COALESCE(%s, full_name),
            email = COALESCE(%s, email),
            phone = COALESCE(%s, phone),
            role = COALESCE(%s, role),
            updated_at = %s
        WHERE id = %s
        RETURNING id, full_name, email, role, hospital_id, phone, updated_at
    """

    now = datetime.now(timezone.utc)

    result = query(
        sql,
        [
            full_name,
            email,
            phone,
            role,
            now,
            user_id,
        ],
    )

    return result[0] if result else None


def update_password(user_id, new_password_hash):
    """
    Update user password
    """

    sql = """
        UPDATE users
        SET password_hash = %s, updated_at = %s
        WHERE id = %s
    """

    query(sql, [new_password_hash, datetime.now(timezone.utc), user_id])


def update_last_login(user_id):
    """
    Update last login timestamp
    """

    sql = """
        UPDATE users
        SET last_login = %s
        WHERE id = %s
    """

    query(sql, [datetime.now(timezone.utc), user_id])


# ====================== DELETE (SOFT DELETE) ======================


def deactivate_user(user_id):
    """
    Soft delete (disable user)
    """

    sql = """
        UPDATE users
        SET active = false, updated_at = %s
        WHERE id = %s
        RETURNING id, full_name, email
    """

    result = query(sql, [datetime.now(timezone.utc), user_id])
    return result[0] if result else None

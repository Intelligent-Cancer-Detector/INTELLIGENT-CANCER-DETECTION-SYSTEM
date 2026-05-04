from datetime import datetime, timezone

from database.config import query


# ======================
# CREATE HOSPITAL
# ======================
def create_hospital(
    hospital_id,
    name,
    email,
    phone,
    address,
    city,
    state,
    postal_code,
    country,
    hospital_type,
    license_number=None,
    hospital_logo=None,
    description=None,
    verified=True,
    active=True,
):
    sql = """
        INSERT INTO hospital (
            id,
            name,
            email,
            hospital_logo,
            license_number,
            hospital_type,
            address,
            city,
            state,
            postal_code,
            country,
            phone,
            description,
            verified,
            active,
            created_at,
            updated_at
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        RETURNING *
    """

    now = datetime.now(timezone.utc)

    result = query(
        sql,
        [
            hospital_id,
            name,
            email,
            hospital_logo,
            license_number,
            hospital_type,
            address,
            city,
            state,
            postal_code,
            country,
            phone,
            description,
            verified,
            active,
            now,
            now,
        ],
    )

    return result[0] if result else None


# ======================
# GET ALL HOSPITALS
# ======================
def get_all_hospitals():
    sql = """
        SELECT * FROM hospital 
        WHERE active = true 
        ORDER BY created_at DESC"""
    return query(sql)


# ======================
# GET HOSPITAL BY ID
# ======================
def get_hospital_by_id(hospital_id):
    sql = "SELECT * FROM hospital WHERE id = %s AND active = true"
    result = query(sql, [hospital_id])
    return result[0] if result else None


# ======================
# GET HOSPITAL BY EMAIL
# ======================
def get_hospital_by_email(email):
    sql = "SELECT * FROM hospital WHERE email = %s"
    result = query(sql, [email])
    return result[0] if result else None


# ======================
# UPDATE HOSPITAL
# ======================
def update_hospital(
    hospital_id,
    name=None,
    email=None,
    hospital_logo=None,
    license_number=None,
    hospital_type=None,
    address=None,
    city=None,
    state=None,
    postal_code=None,
    country=None,
    phone=None,
    description=None,
    verified=None,
    active=None,
):
    sql = """
        UPDATE hospital SET
            name = COALESCE(%s, name),
            email = COALESCE(%s, email),
            hospital_logo = COALESCE(%s, hospital_logo),
            license_number = COALESCE(%s, license_number),
            hospital_type = COALESCE(%s, hospital_type),
            address = COALESCE(%s, address),
            city = COALESCE(%s, city),
            state = COALESCE(%s, state),
            postal_code = COALESCE(%s, postal_code),
            country = COALESCE(%s, country),
            phone = COALESCE(%s, phone),
            description = COALESCE(%s, description),
            verified = COALESCE(%s, verified),
            active = COALESCE(%s, active),
            updated_at = %s
        WHERE id = %s
        RETURNING *
    """

    result = query(
        sql,
        [
            name,
            email,
            hospital_logo,
            license_number,
            hospital_type,
            address,
            city,
            state,
            postal_code,
            country,
            phone,
            description,
            verified,
            active,
            datetime.now(timezone.utc),
            hospital_id,
        ],
    )

    return result[0] if result else None


# ======================
# DELETE HOSPITAL
# ======================
def delete_hospital(hospital_id):
    sql = """
        UPDATE hospital
        SET active = false, updated_at = %s
        WHERE id = %s
        RETURNING *
    """
    result = query(sql, [datetime.now(timezone.utc), hospital_id])
    return result[0] if result else None


# ======================
# GET HOSPITAL STATS
# ======================
def get_all_hospital_stats(hospital_id):
    sql = """
        SELECT
            (SELECT COUNT(*) FROM users WHERE hospital_id = %s AND active = true) AS total_staff,
            (SELECT COUNT(*) FROM patient WHERE hospital_id = %s) AS total_patients,
            (SELECT COUNT(*) FROM departments WHERE hospital_id = %s AND active = true) AS total_departments,
            (SELECT COUNT(*) FROM assessment WHERE hospital_id = %s) AS total_assessments
    """

    result = query(sql, [hospital_id, hospital_id, hospital_id, hospital_id])
    return result[0] if result else None

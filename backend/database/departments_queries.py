from datetime import datetime, timezone

from database.config import query

# ======================
# CREATE DEPARTMENT
# ======================


def create_department(
    hospital_id,
    name,
    head=None,
    description=None,
    location=None,
):
    """
    Create a new department inside a hospital
    """

    sql = """
        INSERT INTO departments (
            hospital_id,
            name,
            head,
            description,
            location,
            created_at,
            updated_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING *
    """

    now = datetime.now(timezone.utc)

    result = query(
        sql,
        [hospital_id, name, head, description, location, now, now],
    )

    return result[0] if result else None


# ======================
# CHECK DUPLICATE NAME
# ======================


def department_exists(hospital_id, name):
    """
    Check if department already exists in same hospital
    """

    sql = """
        SELECT id FROM departments
        WHERE hospital_id = %s
        AND LOWER(name) = LOWER(%s)
        AND active = true
    """

    result = query(sql, [hospital_id, name])
    return True if result else False


# ======================
# GET ALL DEPARTMENTS
# ======================


def get_departments_by_hospital(hospital_id):
    """
    Get all departments for a hospital
    """

    sql = """
        SELECT *
        FROM departments
        WHERE hospital_id = %s
        AND active = true
        ORDER BY created_at DESC
    """

    return query(sql, [hospital_id])


# ======================
# GET SINGLE DEPARTMENT
# ======================


def get_department_by_id(department_id):
    """
    Get a single department
    """

    sql = """
        SELECT *
        FROM departments
        WHERE id = %s
    """

    result = query(sql, [department_id])
    return result[0] if result else None


# ======================
# UPDATE DEPARTMENT
# ======================


def update_department(
    department_id,
    name=None,
    head=None,
    description=None,
    location=None,
):
    """
    Update department details (partial update)
    """

    sql = """
        UPDATE departments SET
            name = COALESCE(%s, name),
            head = COALESCE(%s, head),
            description = COALESCE(%s, description),
            location = COALESCE(%s, location),
            updated_at = %s
        WHERE id = %s
        RETURNING *
    """

    result = query(
        sql,
        [
            name,
            head,
            description,
            location,
            datetime.now(timezone.utc),
            department_id,
        ],
    )

    return result[0] if result else None


# ======================
# DELETE DEPARTMENT (SOFT DELETE)
# ======================


def delete_department(department_id):
    sql = """
        UPDATE departments
        SET active = false, updated_at = %s
        WHERE id = %s
        RETURNING *
    """
    return query(sql, [datetime.now(timezone.utc), department_id])


# ======================
# DELETE DEPARTMENT (HARD DELETE)
# ======================


def delete_department(department_id):
    """
    Permanently delete a department
    """

    sql = """
        DELETE FROM departments
        WHERE id = %s
        RETURNING *
    """

    result = query(sql, [department_id])
    return result[0] if result else None

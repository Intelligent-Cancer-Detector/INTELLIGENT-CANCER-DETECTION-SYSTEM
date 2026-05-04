from datetime import datetime, timezone

from database.config import query


def insert_staff(
    user_id,
    hospital_id,
    name,
    email,
    phone,
    position,
    department_id=None,
    join_date=None,
):
    now = datetime.now(timezone.utc)

    # 🔥 Insert into USERS (not staff)
    sql = """
        INSERT INTO users (
            id,
            hospital_id,
            full_name,
            email,
            phone,
            role,
            password_hash,
            active,
            created_at,
            updated_at
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        RETURNING *
    """

    result = query(
        sql,
        [
            user_id,
            hospital_id,
            name,
            email,
            phone,
            position,
            "pending_hash",
            True,
            now,
            now,
        ],
    )

    # 🔥 Insert department (optional)
    if department_id:
        dept_sql = """
            INSERT INTO user_departments (
                user_id,
                department_id,
                position_in_dept,
                join_date
            )
            VALUES (%s, %s, %s, %s)
        """

        query(dept_sql, [user_id, department_id, position, join_date])

    return result[0] if result else None

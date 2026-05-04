# database/department_queries.py

from datetime import datetime, timezone

from database.config import query


def insert_department(
    department_id, hospital_id, name, head=None, description=None, location=None
):
    sql = """
        INSERT INTO departments (
            id,
            hospital_id,
            name,
            head,
            description,
            location,
            active,
            created_at,
            updated_at
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        RETURNING *
    """

    now = datetime.now(timezone.utc)

    result = query(
        sql,
        [department_id, hospital_id, name, head, description, location, True, now, now],
    )

    return result[0] if result else None

from database.config import query
from datetime import datetime, timezone


def get_patient_by_id(patient_id):
    sql = "SELECT * FROM patient WHERE id = %s"
    result = query(sql, [patient_id])
    return result[0] if result else None


def create_patient(
    patient_id,
    hospital_id,
    name,
    age=None,
    gender=None,
    contact=None,
):
    sql = """
        INSERT INTO patient (
            id,
            hospital_id,
            full_name,
            age,
            gender,
            contact,
            created_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING *
    """

    result = query(
        sql,
        [
            patient_id,
            hospital_id,
            name,
            age,
            gender,
            contact,
            datetime.now(timezone.utc),
        ],
    )

    return result[0] if result else None


def get_patients_by_hospital(hospital_id):
    sql = """
        SELECT * FROM patient
        WHERE hospital_id = %s
        ORDER BY created_at DESC
    """
    return query(sql, [hospital_id])


def update_patient(
    patient_id,
    name=None,
    age=None,
    gender=None,
    contact=None,
):
    sql = """
        UPDATE patient SET
            full_name = COALESCE(%s, full_name),
            age = COALESCE(%s, age),
            gender = COALESCE(%s, gender),
            contact = COALESCE(%s, contact)
        WHERE id = %s
        RETURNING *
    """

    result = query(
        sql,
        [name, age, gender, contact, patient_id],
    )

    return result[0] if result else None


def delete_patient(patient_id):
    sql = "DELETE FROM patient WHERE id = %s RETURNING *"
    result = query(sql, [patient_id])
    return result[0] if result else None

# database/analytics_data/analytics_queries.py

from database.config import query


# ======================
# GET ANALYTICS DATA
# ======================
def get_analytics_data(hospital_id):
    # Patients
    patients_sql = """
        SELECT * FROM patient
        WHERE hospital_id = %s
    """
    patients = query(patients_sql, [hospital_id])

    # Assessments with joins
    assessments_sql = """
        SELECT 
            a.id,
            a.created_at,
            a.risk_level,
            a.symptoms_json,

            p.full_name,
            p.age,
            p.gender,

            u.full_name AS doctor_name,

            pr.top_cancer_type,
            pr.top_probability

        FROM assessment a
        JOIN patient p ON a.patient_id = p.id
        JOIN users u ON a.doctor_id = u.id
        JOIN predictions pr ON pr.assessment_id = a.id

        WHERE a.hospital_id = %s
        ORDER BY a.created_at DESC
    """
    assessments = query(assessments_sql, [hospital_id])

    # Doctors
    doctors_sql = """
        SELECT id, full_name, email
        FROM users
        WHERE hospital_id = %s AND active = TRUE
    """
    doctors = query(doctors_sql, [hospital_id])

    return {
        "patients": patients or [],
        "assessments": assessments or [],
        "doctors": doctors or [],
    }
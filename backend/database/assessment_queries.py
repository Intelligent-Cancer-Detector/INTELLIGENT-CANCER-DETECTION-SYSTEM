import json
import uuid

# from flask import json

from database.config import query


def save_assessment_with_prediction(data):
    # Generate IDS
    assessment_id = f"ass_{uuid.uuid4().hex[:8]}"
    prediction_id = f"pred_{uuid.uuid4().hex[:8]}"

    # insert assessment
    assessment_sql = """
                    INSERT INTO assessment(
                     id, hospital_id, patient_id, doctor_id, risk_level, symptoms_json
                     )
                     VALUES(%s, %s, %s, %s, %s, %s)
                     RETURNING *

                    """

    assessment = query(
        assessment_sql,
        [
            assessment_id,
            data["hospital_id"],
            data["patient_id"],
            data["doctor_id"],
            data["risk_level"],
            json.dumps(data["symptoms_summary"]),
        ],
    )

    # 2. Insert Prediction
    prediction_sql = """
        INSERT INTO predictions (
            pr_id,
            assessment_id,
            top_cancer_type,
            top_probability
        )
        VALUES (%s, %s, %s, %s)
        RETURNING * 
    """

    prediction = query(
        prediction_sql,
        [
            prediction_id,
            assessment_id,
            data["cancer_type"],
            data["confidence"],
        ],
    )

    return {
        "assessment": assessment[0],
        "prediction": prediction[0],
    }

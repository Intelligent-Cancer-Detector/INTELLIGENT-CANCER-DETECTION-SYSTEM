import uuid
from flask import Blueprint, request, jsonify
from database.config import get_db_connection

assessment_bp = Blueprint('assessment', __name__)

@assessment_bp.route('/save', methods=['POST'])
def save_assessment():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # 1. Register/Update Patient
        # We use the 6-digit ID from your JS as the Primary Key
        cur.execute("""
            INSERT INTO patient (id, hospital_id, full_name, age, gender)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET 
                full_name = EXCLUDED.full_name,
                age = EXCLUDED.age;
        """, (
            data.get('patient_id'),
            data.get('hospital_id', 'hosp_1'), # Defaults to Nairobi General
            data.get('patient_name'),
            data.get('age'),
            data.get('gender')
        ))

        # 2. Save Assessment Results
        # Generate a unique ID for the assessment record itself
        assessment_uuid = f"AS-{uuid.uuid4().hex[:6].upper()}"
        
        cur.execute("""
            INSERT INTO assessment (id, hospital_id, patient_id, risk_level, confidence, cancer_type, symptoms_json)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            assessment_uuid,
            data.get('hospital_id', 'hosp_1'),
            data.get('patient_id'),
            data.get('risk_level'),
            data.get('confidence'),
            data.get('cancer_type'),
            data.get('symptoms_summary')
        ))

        conn.commit()
        return jsonify({
            "success": True, 
            "message": "Clinical data archived successfully",
            "assessment_id": assessment_uuid
        }), 201

    except Exception as e:
        conn.rollback()
        print(f"Database Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        cur.close()
        conn.close()
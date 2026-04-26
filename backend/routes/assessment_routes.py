from flask import Blueprint, request, jsonify
from database.config import get_db_connection
from services.ml_service import predict_cancer # Your trained model logic
import uuid
import json

assessment_bp = Blueprint('assessment', __name__)

@assessment_bp.route('/predict', list=['POST'])
def predict():
    data = request.json
    symptoms = data.get('symptoms', [])
    
    # Call your ML model
    prediction_result = predict_cancer(symptoms) 
    
    # If confidence is too low, override to "None/No Cancer"
    if prediction_result['confidence'] < 30.0:
        prediction_result['top_prediction'] = "None"
        prediction_result['risk_level'] = "LOW"

    return jsonify(prediction_result)

@assessment_bp.route('/save', methods=['POST'])
def save_assessment():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        assessment_id = f"AS-{uuid.uuid4().hex[:6].upper()}"
        
        cur.execute("""
            INSERT INTO assessment (
                id, hospital_id, patient_id, doctor_id, 
                risk_level, confidence, cancer_type, symptoms_json
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            assessment_id,
            data['hospital_id'],
            data['patient_id'],
            data['doctor_id'],
            data['risk_level'].upper(),
            data['confidence'],
            data['cancer_type'],
            json.dumps(data['symptoms'])
        ))
        
        conn.commit()
        return jsonify({"status": "success", "id": assessment_id})
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()
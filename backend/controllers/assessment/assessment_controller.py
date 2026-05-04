# =============================
# SAVE PATIENT ASSESSMENT DATA
# =============================
from flask import jsonify, request

from database.hospital_queries import get_hospital_by_id
from database.patient_queries import create_patient, get_patient_by_id
from database.user_queries import get_user_by_id
from database.assessment_queries import save_assessment_with_prediction


def save_patient_assessment(hospital_id):
    try:
        data = request.get_json()
        print("📦 Incoming data:", data)

        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400

        # Inject hospital_id from URL

        data["hospital_id"] = hospital_id

        required_fields = [
            "patient_id",
            "patient_name",
            "doctor_id",
            "risk_level",
            "cancer_type",
            "confidence",
        ]
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "error": f"{field} is required"}), 400

        # =====================
        # VALIDATE HOSPITAL
        # =====================
        hospital = get_hospital_by_id(hospital_id)
        if not hospital:
            return jsonify({"success": False, "error": "Invalid hospital_id"}), 400

        # =====================
        # VALIDATE / CREATE PATIENT
        # =====================
        patient = get_patient_by_id(data["patient_id"])

        if not patient:
            print("🆕 Creating new patient...")

            create_patient(
                patient_id=data["patient_id"],
                hospital_id=hospital_id,
                name=data.get("patient_name"),
                age=data.get("age"),
                gender=data.get("gender"),
                contact=data.get("contact"),
            )

        # =====================
        # VALIDATE DOCTOR
        # =====================
        doctor = get_user_by_id(data["doctor_id"])

        if not doctor:
            return jsonify({"success": False, "error": "Invalid doctor_id"}), 400

        # =====================
        # SAVE ASSESSMENT
        # =====================

        result = save_assessment_with_prediction(data)
        return (
            jsonify(
                {
                    "success": True,
                    "message": "Assessment saved successfully",
                    "data": result,
                }
            ),
            201,
        )

    except Exception as e:
        return jsonify({"success": "False", "error": str(e)})

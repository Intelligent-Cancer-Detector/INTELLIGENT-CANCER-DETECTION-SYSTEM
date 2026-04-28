from flask import Blueprint

from routes.dashboard_routes import recent_assessments


patient_assessment_bp = Blueprint("patient_assessment", __name__)


@patient_assessment_bp.route("/patient-history/<hospital_id>", methods=["GET"])
def patient_assessment(hospital_id):
    return recent_assessments(hospital_id)

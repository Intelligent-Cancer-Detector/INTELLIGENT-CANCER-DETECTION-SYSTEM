from flask import Blueprint
from routes.dashboard_routes import recent_assessments

patient_assessment_history_bp = Blueprint("patient_assessment", __name__)


@patient_assessment_history_bp.route("/<hospital_id>", methods=["GET"])
def patient_assessment_history(hospital_id):
    return recent_assessments(hospital_id)

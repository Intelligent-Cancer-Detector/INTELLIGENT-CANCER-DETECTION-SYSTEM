from flask import Blueprint

from controllers.assessment.assessment_controller import save_patient_assessment

assessment_bp = Blueprint("assessment", __name__)


@assessment_bp.route("/<hospital_id>/save-patient-assessment", methods=["POST"])
def save_assessment(hospital_id):
    return save_patient_assessment(hospital_id)

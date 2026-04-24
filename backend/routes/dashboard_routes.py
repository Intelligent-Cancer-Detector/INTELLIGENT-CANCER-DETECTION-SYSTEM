from flask import Blueprint

from controllers.dashboard.dashboard_controller import (
    alert_handler,
    dashboard_data_handler,
    recent_assement_handler,
)


dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/<hospital_id>", methods=["GET"])
def dashboard(hospital_id):
    return dashboard_data_handler(hospital_id)


@dashboard_bp.route("/<hospital_id>/recent-assessments", methods=["GET"])
def recent_assessments(hospital_id):
    return recent_assement_handler(hospital_id)


@dashboard_bp.route("/<hospital_id>/alerts", methods=["GET"])
def alerts(hospital_id):
    return alert_handler(hospital_id)

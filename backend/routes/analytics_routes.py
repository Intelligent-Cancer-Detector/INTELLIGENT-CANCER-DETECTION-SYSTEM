from flask import Blueprint
from controllers.analytics.analytics_controller import analytics_handler

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/<hospital_id>", methods=["GET"])
def analytics(hospital_id):
    return analytics_handler(hospital_id)
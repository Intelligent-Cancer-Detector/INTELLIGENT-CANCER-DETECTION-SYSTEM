from flask import Blueprint, request, jsonify
from services.ml_service import predict

ml_bp = Blueprint("ml", __name__)


@ml_bp.route("/predict", methods=["POST"])
def ml_predict():
    data = request.get_json()
    return predict(data)

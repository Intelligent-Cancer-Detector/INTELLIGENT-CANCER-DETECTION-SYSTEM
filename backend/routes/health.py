"""
This is a Health Check Endpoint.
It's a small API route that tells whether the backend server is alive and running.

"""

import datetime

from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health():
    return (
        jsonify(
            {"status": "running", "timestamp": datetime.datetime.now().isoformat()}
        ),
        200,
    )

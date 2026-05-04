from flask import jsonify
from database.analytics_queries import get_analytics_data


def analytics_handler(hospital_id):
    try:
        data = get_analytics_data(hospital_id)

        return jsonify({
            "status": "success",
            "data": data
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
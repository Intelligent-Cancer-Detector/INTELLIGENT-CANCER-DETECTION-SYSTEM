from database.dashboard_data.dashboard_queries import (
    get_alerts,
    get_dashboard_stats,
    get_recent_assessments,
)


def recent_assement_handler(hospital_id):
    # Get latest assessments for dashboard
    try:
        data = get_recent_assessments(hospital_id)

        return {"status": "success", "data": data}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def dashboard_data_handler(hospital_id):
    # This is the main dashboard endpoint
    """
    total patients
    total assessments
    high risk count
    """

    print("Hospital ID received:", hospital_id)

    stats = get_dashboard_stats(hospital_id)

    return {"status": "success", "stats": stats}


def alert_handler(hospital_id):
    # Show important alerts (e.g., HIGH risk patients)
    try:
        alerts = get_alerts(hospital_id)
        return {"status": "success", "alerts": alerts}

    except Exception as e:
        return {"status": "error", "message": str(e)}

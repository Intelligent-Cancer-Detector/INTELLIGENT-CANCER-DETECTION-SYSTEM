from .auth_routes import auth_bp
from .dashboard_routes import dashboard_bp
from .health import health_bp
from .hospital2 import hospital_info_bp
from .ml import ml_bp
from .patient_history_routes import patient_assessment_history_bp
from .assessment_routes import assessment_bp
from .analytics_routes import analytics_bp

# Blueprint = Router in Express


def register_routes(app):
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(
        patient_assessment_history_bp,
        url_prefix="/api/patient-assessment/patient-history",
    )
    app.register_blueprint(ml_bp, url_prefix="/api/ml")

    # hospital routes
    app.register_blueprint(hospital_info_bp, url_prefix="/api/hospital")
    app.register_blueprint(assessment_bp, url_prefix="/api/new-patient-assessment")

    app.register_blueprint(analytics_bp,url_prefix="/api/analytics")

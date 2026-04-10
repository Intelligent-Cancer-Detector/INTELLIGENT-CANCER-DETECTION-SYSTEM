"""
ICDS - Database Configuration
SQLite for development (zero installation).
Swap DATABASE_URL in .env for PostgreSQL in production.
"""

import os
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    base_dir     = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sqlite_path  = os.path.join(base_dir, "icds.db")
    database_url = os.environ.get("DATABASE_URL", f"sqlite:///{sqlite_path}")

    app.config["SQLALCHEMY_DATABASE_URI"]        = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    with app.app_context():
        db.create_all()
        print(f"  ✅ Database ready → {database_url}")
    return db
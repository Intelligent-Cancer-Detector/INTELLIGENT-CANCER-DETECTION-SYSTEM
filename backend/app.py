"""
ICDS - Backend with Supabase PostgreSQL
"""



import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from database.init_database import initialize_database, reset_database, seed_database
from routes import register_routes

load_dotenv()

app = Flask(__name__)

# ======================
# CORS Configuration (Very Important!)
# ======================
CORS(
    app,
    origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
    ],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    supports_credentials=True,
)


# ======================
# Initialize Database
# ======================
# if os.getenv("RESET_DB","").lower() == "true":

# print("running inside")
# reset_database()
# initialize_database()
# seed_database()


# ======================
# Register Blueprints (routes)
# ======================
if os.getenv("RESET_DB") == "true":
    reset_database()
    initialize_database()
    seed_database()


register_routes(app)
# same as app.use("/api/auth", authRouter)


if __name__ == "__main__":

    print("\n" + "=" * 60)
    print("🚀 ICDS Backend Server Starting...")
    print("=" * 60)
    print("\n" + "=" * 60)

    app.run(debug=True, host="0.0.0.0", port=5000)

"""
ICDS - Backend with Supabase PostgreSQL
"""

import os, sys, datetime, hashlib, time, warnings
warnings.filterwarnings("ignore")

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from supabase import create_client, Client
import joblib
import numpy as np

# Directory Setup - FIXED PATHS
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(BASE_DIR)

# Try different possible frontend folder names
possible_frontend_folders = ["fronted", "frontend", "Frontend", "Fronted", "front-end", "Front-end"]
FRONT_DIR = None

for folder in possible_frontend_folders:
    test_path = os.path.join(PARENT_DIR, folder)
    if os.path.exists(test_path) and os.path.isdir(test_path):
        FRONT_DIR = test_path
        break

if not FRONT_DIR:
    # If not found, use the parent directory itself
    FRONT_DIR = PARENT_DIR

MODELS_DIR = os.path.join(BASE_DIR, "models")

print(f"📍 Frontend directory: {FRONT_DIR}")
print(f"📍 Models directory: {MODELS_DIR}")

app = Flask(__name__, static_folder=FRONT_DIR, static_url_path='')
app.config["SECRET_KEY"] = "icds_secret_key_2026_bbh_national"
CORS(app)

# ============================================
# SUPABASE CONNECTION
# ============================================
SUPABASE_URL = "https://tgrrmzusqjzzvhevmmbt.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRncnJtenVzcWp6enZoZXZtbWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyOTg4NDUsImV4cCI6MjA5MDg3NDg0NX0.nmD117ohEA-pMV4YnNluPxJGT4N-HFJxPaRRyGFyyks"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# ============================================
# LOAD ML MODEL
# ============================================
MODEL = None
LABEL_ENCODER = None
FEATURES = []
CANCER_TYPES = []

def load_model():
    global MODEL, LABEL_ENCODER, FEATURES, CANCER_TYPES
    try:
        MODEL = joblib.load(os.path.join(MODELS_DIR, "cancer_model.pkl"))
        LABEL_ENCODER = joblib.load(os.path.join(MODELS_DIR, "label_encoder.pkl"))
        FEATURES = joblib.load(os.path.join(MODELS_DIR, "symptom_list.pkl"))
        
        classes_path = os.path.join(MODELS_DIR, "cancer_classes.txt")
        if os.path.exists(classes_path):
            with open(classes_path, "r") as f:
                for line in f:
                    parts = line.strip().split(',')
                    if len(parts) == 2 and parts[1] != 'none':
                        CANCER_TYPES.append(parts[1].capitalize() + (' Cancer' if parts[1] not in ['skin', 'brain', 'eye'] else ' Cancer'))
        
        print(f"   ✅ ML Model loaded — {len(FEATURES)} features")
        print(f"   ✅ Cancer types: {CANCER_TYPES}")
    except Exception as e:
        print(f"   ❌ Model load failed: {e}")

# ============================================
# ROUTES
# ============================================

@app.route('/')
def index():
    """Serve the main index page"""
    # Try to find index.html in frontend folder
    index_path = os.path.join(FRONT_DIR, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(FRONT_DIR, 'index.html')
    else:
        return jsonify({
            "error": "Frontend files not found",
            "message": f"Looking for index.html in: {FRONT_DIR}",
            "solution": "Make sure your HTML files are in the correct folder"
        }), 404

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve any static file from frontend folder"""
    file_path = os.path.join(FRONT_DIR, filename)
    if os.path.exists(file_path):
        return send_from_directory(FRONT_DIR, filename)
    else:
        return jsonify({"error": f"File not found: {filename}"}), 404

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "running",
        "model_loaded": MODEL is not None,
        "database": "Supabase PostgreSQL",
        "frontend_path": FRONT_DIR,
        "cancer_types": CANCER_TYPES,
        "timestamp": datetime.datetime.now().isoformat()
    }), 200

# ============================================
# ML PREDICTION ROUTE
# ============================================

@app.route("/api/ml/predict", methods=["POST"])
def ml_predict():
    if MODEL is None:
        return jsonify({"success": False, "error": "ML model not loaded"}), 503
    
    try:
        data = request.get_json()
        symptoms = data.get("symptoms", [])
        
        feature_vector = []
        for feature in FEATURES:
            matched = 0
            for symptom in symptoms:
                symptom_lower = symptom.lower()
                feature_lower = feature.lower()
                if symptom_lower in feature_lower or feature_lower in symptom_lower:
                    matched = 1
                    break
            feature_vector.append(matched)
        
        X = np.array([feature_vector])
        probabilities = MODEL.predict_proba(X)[0]
        
        results = {}
        for i, prob in enumerate(probabilities):
            cancer_name = LABEL_ENCODER.inverse_transform([i])[0]
            if cancer_name != 'none':
                display_name = cancer_name.capitalize() + (' Cancer' if cancer_name not in ['skin', 'brain', 'eye'] else ' Cancer')
                results[display_name] = round(prob * 100, 2)
        
        sorted_results = dict(sorted(results.items(), key=lambda x: x[1], reverse=True))
        
        return jsonify({
            "success": True,
            "predictions": sorted_results,
            "top_cancer": list(sorted_results.keys())[0] if sorted_results else "None",
            "top_probability": list(sorted_results.values())[0] if sorted_results else 0
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ============================================
# AUTH ROUTES
# ============================================

@app.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        
        hashed_input = hashlib.sha256(password.encode()).hexdigest()
        
        response = supabase.table("users").select("*, hospitals(name, id)").eq("email", email).execute()
        
        if not response.data:
            return jsonify({"success": False, "error": "Invalid email or password"}), 401
        
        user = response.data[0]
        
        if user["password_hash"] != hashed_input:
            return jsonify({"success": False, "error": "Invalid email or password"}), 401
        
        return jsonify({
            "success": True,
            "user": {
                "id": user["id"],
                "name": user["full_name"],
                "email": user["email"],
                "role": user["role"],
                "hospital_id": user["hospital_id"],
                "hospital_name": user["hospitals"]["name"]
            }
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ============================================
# MAIN
# ============================================
if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 ICDS Backend Starting")
    print("="*60)
    print(f"📂 Frontend path: {FRONT_DIR}")
    print(f"📂 Models path: {MODELS_DIR}")
    print("\n🔧 Loading ML Model...")
    load_model()
    print("\n📍 Test URLs:")
    print(f"   http://localhost:5000/           - Frontend (index.html)")
    print(f"   http://localhost:5000/api/health - API Health Check")
    print("\n" + "="*60)
    app.run(debug=True, host="0.0.0.0", port=5000)
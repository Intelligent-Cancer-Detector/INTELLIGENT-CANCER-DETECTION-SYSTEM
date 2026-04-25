import joblib
import numpy as np
import os
from flask import jsonify

# 1. SETUP DIRECTORIES
# Points to the root of the 'backend' folder to find the 'models' directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# 2. LOAD MODELS GLOBALLY
# We load these once when the server starts to keep the API fast
try:
    MODEL = joblib.load(os.path.join(MODELS_DIR, "cancer_model.pkl"))
    ENCODER = joblib.load(os.path.join(MODELS_DIR, "label_encoder.pkl"))
    FEATURES = joblib.load(os.path.join(MODELS_DIR, "symptom_list.pkl"))
    print("✅ ML Models loaded successfully in Service Layer")
except Exception as e:
    print(f"❌ Error loading ML models: {e}")

def predict(data):
    """
    Processes symptoms and returns JSON-safe prediction results.
    """
    try:
        # Get symptoms from the incoming JSON request
        symptoms = data.get("symptoms", [])
        if not symptoms:
            return jsonify({"success": False, "error": "No symptoms provided"}), 400

        # 3. FEATURE MATCHING
        # Create a 1/0 vector by matching input symptoms to the master symptom list
        vector = []
        for f in FEATURES:
            # Check if any user-provided symptom is part of this feature
            matched = 1 if any(s.lower().strip() in f.lower() for s in symptoms if s) else 0
            vector.append(matched)

        # 4. RUN PREDICTION
        X = np.array([vector])
        probs = MODEL.predict_proba(X)[0]

        # 5. DATA CLEANING (The "JSON Fix")
        # NumPy types (float64, int64, bool_) must be cast to standard Python types
        top_idx = int(np.argmax(probs))
        top_prob = float(probs[top_idx])
        
        # Identify 'none' class for safety logic
        class_list = list(ENCODER.classes_)
        none_idx = class_list.index('none') if 'none' in class_list else -1

        # Build the final predictions dictionary
        results = {}
        for i, p in enumerate(probs):
            label = str(ENCODER.inverse_transform([i])[0])
            if label != "none":
                results[label] = round(float(p) * 100, 2)

        # Sort results (Highest probability first)
        sorted_results = dict(sorted(results.items(), key=lambda item: item[1], reverse=True))

        # 6. SAFETY & THRESHOLD LOGIC
        # Standardize as a Python boolean to avoid "bool_ is not JSON serializable"
        is_cancer_likely = bool((top_idx != none_idx) and (top_prob > 0.35))

        # 7. FINAL RESPONSE
        return jsonify({
            "success": True, 
            "predictions": sorted_results,
            "top_prediction": str(ENCODER.classes_[top_idx]) if is_cancer_likely else "none",
            "is_flagged": is_cancer_likely,
            "confidence": round(top_prob * 100, 2)
        }), 200

    except Exception as e:
        print(f"Prediction Error Trace: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500
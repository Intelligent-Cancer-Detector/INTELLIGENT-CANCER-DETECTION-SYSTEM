# ml_api.py - Simple API for your trained model
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # Allow frontend to call this API

# Get the backend directory path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BACKEND_DIR, 'models')

print("📂 Loading model files...")

# Load your trained model
try:
    MODEL = joblib.load(os.path.join(MODELS_DIR, 'cancer_model.pkl'))
    LABEL_ENCODER = joblib.load(os.path.join(MODELS_DIR, 'label_encoder.pkl'))
    FEATURE_NAMES = joblib.load(os.path.join(MODELS_DIR, 'symptom_list.pkl'))
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    MODEL = None
    LABEL_ENCODER = None
    FEATURE_NAMES = []

# Load cancer classes
CANCER_CLASSES = []
try:
    with open(os.path.join(MODELS_DIR, 'cancer_classes.txt'), 'r') as f:
        for line in f:
            parts = line.strip().split(',')
            if len(parts) == 2:
                CANCER_CLASSES.append(parts[1])
    print(f"✅ Loaded {len(CANCER_CLASSES)} cancer types")
except:
    print("⚠️ Could not load cancer_classes.txt")

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "ICDS ML API is running!",
        "endpoints": {
            "/api/predict": "POST - Send symptoms to get cancer predictions",
            "/api/health": "GET - Check API health"
        },
        "cancer_types": [c for c in CANCER_CLASSES if c != 'none']
    })

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": MODEL is not None,
        "cancer_types": [c for c in CANCER_CLASSES if c != 'none'],
        "features_count": len(FEATURE_NAMES)
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict cancer from symptoms"""
    if MODEL is None:
        return jsonify({"success": False, "error": "Model not loaded"}), 503
    
    try:
        data = request.get_json()
        print(f"📥 Received: {data}")
        
        symptoms = data.get('symptoms', [])
        age = data.get('age', 50)
        gender = data.get('gender', 'male')
        
        print(f"🩺 Symptoms: {symptoms}")
        
        # Create feature vector (48 features)
        feature_vector = []
        for feature in FEATURE_NAMES:
            # Check if symptom matches feature
            matched = 0
            for symptom in symptoms:
                symptom_lower = symptom.lower()
                feature_lower = feature.lower()
                if symptom_lower in feature_lower or feature_lower in symptom_lower:
                    matched = 1
                    break
            feature_vector.append(matched)
        
        # Add age and gender as additional features (if your model expects them)
        # Note: Your model has 48 features, so we need to match exactly
        # If your model expects 48 features, don't add age/gender here
        
        print(f"📊 Feature vector length: {len(feature_vector)}")
        
        # Make prediction
        X = np.array([feature_vector])
        probabilities = MODEL.predict_proba(X)[0]
        
        # Format results
        results = {}
        for i, prob in enumerate(probabilities):
            cancer_name = LABEL_ENCODER.inverse_transform([i])[0]
            if cancer_name != 'none':  # Filter out 'none' for frontend
                results[cancer_name] = round(prob * 100, 2)
        
        # Sort by probability
        sorted_results = dict(sorted(results.items(), key=lambda x: x[1], reverse=True))
        
        print(f"✅ Prediction: {list(sorted_results.keys())[:3]}")
        
        return jsonify({
            "success": True,
            "predictions": sorted_results,
            "top_cancer": list(sorted_results.keys())[0] if sorted_results else "None",
            "top_probability": list(sorted_results.values())[0] if sorted_results else 0
        })
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 ICDS ML API Starting...")
    print("="*50)
    print(f"📂 Models directory: {MODELS_DIR}")
    print(f"🔬 Model loaded: {MODEL is not None}")
    print("\n📍 Available endpoints:")
    print("   http://localhost:5001/           - API Info")
    print("   http://localhost:5001/api/health - Health check")
    print("   http://localhost:5001/api/predict - POST predictions")
    print("\n" + "="*50)
    app.run(debug=True, host='0.0.0.0', port=5001)
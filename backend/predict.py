import joblib

# Load the trained assets
model = joblib.load("model.pkl")
vectorizer = joblib.load("vectorizer.pkl")
le = joblib.load("label_encoder.pkl")

def predict(symptoms_list):
    # Ensure we handle exactly 10 inputs or pad them if the doctor provides fewer
    text = " ".join(symptoms_list)
    X = vectorizer.transform([text])

    # Get probability percentages
    probs = model.predict_proba(X)[0]

    # Map results to cancer names
    results = {
        le.classes_[i]: round(float(probs[i]), 4)
        for i in range(len(probs))
    }

    # Identify the top prediction
    top_label = max(results, key=results.get)
    confidence = results[top_label]

    # LOGIC CHECK: 
    # 1. If the top class is actually the 'none' class you trained
    # 2. OR if the confidence is too low (doctor gave vague symptoms)
    is_not_cancer = (top_label == "none") or (confidence < 0.30)

    return {
        "all_probabilities": results,
        "recommended_diagnosis": "None/Healthy" if is_not_cancer else top_label,
        "confidence_score": confidence,
        "is_cancer_likely": not is_not_cancer
    }

# Test run with 10 symptoms (matching your new assessment page)
if __name__ == "__main__":
    test_symptoms = [
        "persistent cough", "chest pain", "fatigue", "wheezing", "weight loss",
        "coughing blood", "hoarseness", "loss of appetite", "bone pain", "headache"
    ]
    print(predict(test_symptoms))
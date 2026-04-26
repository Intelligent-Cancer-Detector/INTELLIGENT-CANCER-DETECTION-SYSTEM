import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.ensemble import RandomForestClassifier
import joblib

# 1. Load the upgraded dataset
try:
    df = pd.read_csv("train_data.csv")
except FileNotFoundError:
    print("❌ Error: train_data.csv not found. Run your dataset script first!")
    exit()

# 2. Combine ALL 10 symptoms into one string
# This makes the model "position-independent" (it doesn't matter which field has the symptom)
symptom_cols = [f"symptom_{i}" for i in range(1, 11)]
df["text"] = df[symptom_cols].apply(lambda x: " ".join(x.astype(str)), axis=1)

# 3. Encode labels (This maps 'lung', 'none', etc., to numbers 0-10)
le = LabelEncoder()
y = le.fit_transform(df["cancer_type"])

# 4. Text → Vector (The 'Vocabulary' of symptoms)
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(df["text"])

# 5. Train model with Probability enabled
# We use n_estimators=100 to make the 'percentage' predictions more stable
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# 6. Save everything
# We save the LabelEncoder so we can turn '0' back into 'Lung Cancer' later
joblib.dump(model, "model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")
joblib.dump(le, "label_encoder.pkl")

print("✅ Model trained and saved successfully!")
print(f"Total symptoms learned: {len(vectorizer.get_feature_names_out())}")
print(f"Classes identified: {list(le.classes_)}")
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from imblearn.over_sampling import SMOTE
import joblib
import os

def train_brain():
    # 1. Load the data you just downloaded
    data_path = 'data/cancer_data.csv'
    if not os.path.exists(data_path):
        print("Error: cancer_data.csv not found in data folder!")
        return

    df = pd.read_csv(data_path)

    # 2. Cleaning: Drop columns that aren't symptoms (Index and Patient Id)
    # These don't help the AI detect cancer
    X = df.drop(['index', 'Patient Id', 'Level'], axis=1)
    y = df['Level']

    # 3. Encode the target (Convert Low/Medium/High to numbers 0, 1, 2)
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    # 4. Handle Objective 5: SMOTE (Balance the data)
    print("Applying SMOTE to balance classes...")
    smote = SMOTE(random_state=42)
    X_res, y_res = smote.fit_resample(X, y_encoded)

    # 5. Split data (80% for training, 20% for testing)
    X_train, X_test, y_train, y_test = train_test_split(X_res, y_res, test_size=0.2, random_state=42)

    # 6. Train the Model (Random Forest)
    print("Training the Intelligent Cancer Detection Model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # 7. Save the "Brain" and the Encoder
    if not os.path.exists('models'):
        os.makedirs('models')
    
    joblib.dump(model, 'models/cancer_model.pkl')
    joblib.dump(le, 'models/label_encoder.pkl')
    
    # Save the feature names so the backend knows the order of symptoms
    joblib.dump(X.columns.tolist(), 'models/symptom_list.pkl')

    print("-" * 30)
    print("SUCCESS: AI Model trained and saved in 'models/' folder!")
    print(f"Accuracy on test data: {model.score(X_test, y_test) * 100:.2f}%")

if __name__ == "__main__":
    train_brain()
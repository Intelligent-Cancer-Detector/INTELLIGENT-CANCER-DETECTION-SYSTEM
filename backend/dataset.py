import random
import pandas as pd
import os

# 1. 10 Cancer types + "none" for healthy patients
CANCER_TYPES = [
    "lung", "colorectal", "breast", "prostate", "pancreatic",
    "brain", "eye", "skin", "ovarian", "bladder", "none"
]

# 2. Expanded symptoms (10 per type) to support a 10-field assessment
SYMPTOMS = {
    "lung": ["persistent cough", "chest pain", "shortness of breath", "wheezing", "fatigue", "coughing blood", "hoarseness", "loss of appetite", "weight loss", "bone pain"],
    "colorectal": ["blood in stool", "abdominal pain", "diarrhea", "constipation", "weight loss", "narrow stool", "rectal bleeding", "cramping", "bloating", "weakness"],
    "breast": ["breast lump", "nipple discharge", "skin dimpling", "breast pain", "inverted nipple", "redness of skin", "swelling", "lymph node changes", "skin peeling", "thickening"],
    "prostate": ["frequent urination", "weak urine flow", "pelvic discomfort", "blood in urine", "painful ejaculation", "nocturia", "difficulty starting urination", "bone pain", "weight loss", "erectile dysfunction"],
    "pancreatic": ["jaundice", "abdominal pain", "weight loss", "loss of appetite", "dark urine", "itchy skin", "back pain", "nausea", "blood clots", "new-onset diabetes"],
    "brain": ["headache", "seizures", "vision problems", "balance issues", "nausea", "personality changes", "speech difficulties", "hearing problems", "memory loss", "weakness in limbs"],
    "eye": ["vision loss", "eye pain", "blurred vision", "light sensitivity", "floaters", "redness", "squinting", "flashing lights", "shadows", "burning sensation"],
    "skin": ["skin lesion", "changing mole", "itching", "bleeding skin", "crusting", "dark spots", "non-healing sore", "pearly bump", "scaly patch", "red firm nodule"],
    "ovarian": ["bloating", "pelvic pain", "frequent urination", "loss of appetite", "indigestion", "back pain", "constipation", "menstrual changes", "fatigue", "pain during intercourse"],
    "bladder": ["blood in urine", "painful urination", "frequent urination", "lower back pain", "pelvic pain", "inability to urinate", "weak stream", "urgent urination", "swollen feet", "bone pain"],
    "none": ["headache", "mild cough", "sneeze", "runny nose", "sore throat", "minor bruise", "stomach ache", "tiredness", "dry skin", "muscle ache"]
}

def generate_patient():
    cancer = random.choice(CANCER_TYPES)
    
    if cancer == "none":
        # Healthy patients get symptoms from the 'none' pool
        symptoms = random.sample(SYMPTOMS["none"], 10)
    else:
        # Sick patients get 7 core symptoms and 3 'noise' symptoms from other categories
        core = random.sample(SYMPTOMS[cancer], 7)
        other_pool = []
        for c, s in SYMPTOMS.items():
            if c != cancer:
                other_pool.extend(s)
        noise = random.sample(other_pool, 3)
        symptoms = core + noise

    random.shuffle(symptoms)

    # Create 10 symptom fields
    data = {f"symptom_{i+1}": symptoms[i] for i in range(10)}
    data["cancer_type"] = cancer
    return data

def create_and_save_data(n=3000):
    # Generate data
    raw_data = [generate_patient() for _ in range(n)]
    df = pd.DataFrame(raw_data)
    
    # Shuffle
    df = df.sample(frac=1).reset_index(drop=True)

    # Split (80% train, 20% test)
    split = int(len(df) * 0.8)
    train_df = df[:split]
    test_df = df[split:]

    # Save to CSV
    train_df.to_csv("train_data.csv", index=False)
    test_df.to_csv("test_data.csv", index=False)

    print("-" * 30)
    print("DATASET IS READY")
    print(f"Total Records: {len(df)}")
    print(f"Train saved:  {len(train_df)} rows")
    print(f"Test saved:   {len(test_df)} rows")
    print("-" * 30)

if __name__ == "__main__":
    create_and_save_data()
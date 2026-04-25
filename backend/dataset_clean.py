import random
import pandas as pd

CANCER_TYPES = [
"lung", "colorectal", "breast", "prostate", "pancreatic",
"brain", "eye", "skin", "ovarian", "bladder"
]

SYMPTOMS = {
"lung": ["persistent cough", "chest pain", "shortness of breath", "wheezing", "fatigue"],
"colorectal": ["blood in stool", "abdominal pain", "diarrhea", "constipation", "weight loss"],
"breast": ["breast lump", "nipple discharge", "skin dimpling", "breast pain"],
"prostate": ["frequent urination", "weak urine flow", "pelvic discomfort", "blood in urine"],
"pancreatic": ["jaundice", "abdominal pain", "weight loss", "loss of appetite"],
"brain": ["headache", "seizures", "vision problems", "balance issues"],
"eye": ["vision loss", "eye pain", "blurred vision", "light sensitivity"],
"skin": ["skin lesion", "changing mole", "itching", "bleeding skin"],
"ovarian": ["bloating", "pelvic pain", "frequent urination", "loss of appetite"],
"bladder": ["blood in urine", "painful urination", "frequent urination", "lower back pain"]
}

def generate_patient():
cancer = random.choice(CANCER_TYPES)

```
core = random.sample(SYMPTOMS[cancer], 3)
other = random.choice([c for c in CANCER_TYPES if c != cancer])
noise = random.sample(SYMPTOMS[other], 2)

symptoms = core + noise
random.shuffle(symptoms)

return {
    "symptom_1": symptoms[0],
    "symptom_2": symptoms[1],
    "symptom_3": symptoms[2],
    "symptom_4": symptoms[3],
    "symptom_5": symptoms[4],
    "cancer_type": cancer
}
```

def generate_dataset(n=2000):
data = []
for _ in range(n):
data.append(generate_patient())
return pd.DataFrame(data)

def split_and_save():
df = generate_dataset()
df = df.sample(frac=1).reset_index(drop=True)

```
split = int(len(df) * 0.8)
train = df[:split]
test = df[split:]

train.to_csv("train_data.csv", index=False)
test.to_csv("test_data.csv", index=False)

print("✅ Dataset ready!")
```

if **name** == "**main**":
split_and_save()
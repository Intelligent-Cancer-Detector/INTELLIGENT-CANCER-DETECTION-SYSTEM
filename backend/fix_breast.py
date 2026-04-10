"""
ICDS - Fix Breast Cancer Class
The breast_cancer_wdbc.csv uses clinical measurements (radius, texture etc)
NOT symptoms - so the model can't learn symptom patterns from it.
We override it with a proper symptom-based breast cancer dataset.

Run: python fix_breast.py
Then: python build_dataset.py
Then: python train_model.py
"""

import csv, random, os
random.seed(77)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR   = os.path.join(SCRIPT_DIR, "data")

COLUMNS = [
    "age", "gender",
    "fatigue", "weight_loss", "loss_of_appetite", "night_sweats", "fever",
    "cough", "hemoptysis", "shortness_of_breath", "chest_pain", "hoarseness",
    "wheezing",
    "headache", "seizures", "vision_changes", "memory_problems",
    "balance_issues", "personality_change", "speech_difficulty",
    "abdominal_pain", "nausea", "jaundice", "blood_in_stool",
    "bowel_changes", "rectal_bleeding",
    "blood_in_urine", "urinary_frequency", "urinary_pain", "back_pain",
    "pelvic_pain", "bloating", "vaginal_bleeding",
    "breast_lump", "skin_changes", "mole_changes",
    "eye_pain", "eye_redness", "floaters", "pupil_changes",
    "swollen_lymph_nodes", "bone_pain",
    "smoking_history", "family_history", "alcohol_use",
    "duration_weeks", "severity",
    "cancer_type"
]

def blank():
    return {c: 0 for c in COLUMNS}

def rnd(p):
    return 1 if random.random() < p else 0

def gen_breast_cancer():
    r = blank()
    r["age"]                 = random.randint(30, 75)
    r["gender"]              = 0          # female
    # HIGHLY DISTINCTIVE — breast-specific symptoms
    r["breast_lump"]         = rnd(0.95)  # hallmark symptom
    r["skin_changes"]        = rnd(0.60)  # skin dimpling
    r["swollen_lymph_nodes"] = rnd(0.65)  # axillary nodes
    r["chest_pain"]          = rnd(0.45)  # breast pain
    r["vaginal_bleeding"]    = rnd(0.30)  # nipple discharge
    # General cancer symptoms
    r["fatigue"]             = rnd(0.60)
    r["weight_loss"]         = rnd(0.40)
    r["loss_of_appetite"]    = rnd(0.35)
    r["bone_pain"]           = rnd(0.25)  # metastatic
    r["back_pain"]           = rnd(0.20)
    r["nausea"]              = rnd(0.25)
    # Risk factors
    r["family_history"]      = rnd(0.35)
    r["alcohol_use"]         = rnd(0.20)
    r["smoking_history"]     = rnd(0.15)
    r["duration_weeks"]      = random.randint(2, 24)
    r["severity"]            = random.choice([1, 2, 2, 3])
    r["cancer_type"]         = "breast"
    return r

def gen_none():
    r = blank()
    r["age"]              = random.randint(18, 70)
    r["gender"]           = random.choice([0, 1])
    r["fatigue"]          = rnd(0.30)
    r["headache"]         = rnd(0.25)
    r["nausea"]           = rnd(0.20)
    r["back_pain"]        = rnd(0.20)
    r["fever"]            = rnd(0.20)
    r["smoking_history"]  = rnd(0.15)
    r["family_history"]   = rnd(0.08)
    r["duration_weeks"]   = random.randint(1, 3)
    r["severity"]         = 1
    r["cancer_type"]      = "none"
    return r

# Generate rows
rows = []
for _ in range(600):
    rows.append(gen_breast_cancer())
for _ in range(200):
    rows.append(gen_none())
random.shuffle(rows)

# Delete old breast files that confuse the model
breast_dir = os.path.join(DATA_DIR, "breast")
for fname in os.listdir(breast_dir):
    fpath = os.path.join(breast_dir, fname)
    os.remove(fpath)
    print(f"  🗑  Removed old: breast/{fname}")

# Save new clean file
out = os.path.join(breast_dir, "breast_cancer_symptoms.csv")
with open(out, "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=COLUMNS)
    writer.writeheader()
    writer.writerows(rows)

print()
print("╔══════════════════════════════════════════════════════════╗")
print("║     ICDS — Breast Cancer Fix                            ║")
print("╚══════════════════════════════════════════════════════════╝")
print()
print(f"  ✅ data/breast/breast_cancer_symptoms.csv")
print(f"     600 breast cancer + 200 non-cancer = {len(rows)} rows")
print(f"     Key features: breast_lump=95%, swollen_lymph_nodes=65%")
print(f"     Gender: 100% female (gender=0)")
print()
print("  Now run:")
print("    python build_dataset.py")
print("    python train_model.py")
print()
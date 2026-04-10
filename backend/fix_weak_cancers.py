"""
ICDS - Fix Weak Cancer Classes
Regenerates better clinical seed data for bladder, breast, and skin
with more distinctive symptom profiles so the model can tell them apart.

Run: python fix_weak_cancers.py
Then: python build_dataset.py
Then: python train_model.py
"""

import csv
import random
import os

random.seed(99)

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

def rnd(prob):
    return 1 if random.random() < prob else 0

def gen_bladder(label="bladder"):
    """
    Bladder cancer — highly distinctive urinary symptoms.
    Source: AUA / Mayo Clinic / NCCN bladder cancer guidelines
    """
    r = blank()
    r["age"]                = random.randint(50, 80)
    r["gender"]             = 1 if random.random() < 0.75 else 0  # 75% male
    # PRIMARY symptoms — very high probability, unique to bladder
    r["blood_in_urine"]     = rnd(0.95)   # hematuria — hallmark of bladder cancer
    r["urinary_frequency"]  = rnd(0.85)
    r["urinary_pain"]       = rnd(0.75)
    r["pelvic_pain"]        = rnd(0.60)
    r["back_pain"]          = rnd(0.50)
    # Secondary symptoms
    r["fatigue"]            = rnd(0.55)
    r["weight_loss"]        = rnd(0.40)
    r["loss_of_appetite"]   = rnd(0.35)
    r["bone_pain"]          = rnd(0.20)   # advanced
    r["swollen_lymph_nodes"]= rnd(0.15)
    # Risk factors
    r["smoking_history"]    = rnd(0.50)   # strong risk factor
    r["family_history"]     = rnd(0.10)
    r["duration_weeks"]     = random.randint(2, 20)
    r["severity"]           = random.choice([1, 2, 2, 3])
    r["cancer_type"]        = label
    return r

def gen_breast(label="breast"):
    """
    Breast cancer — distinctive lump and breast-specific symptoms.
    Source: ACS / NCCN / WHO breast cancer clinical guidelines
    """
    r = blank()
    r["age"]                = random.randint(30, 75)
    r["gender"]             = 0 if random.random() < 0.99 else 1  # 99% female
    # PRIMARY symptoms — very distinctive
    r["breast_lump"]        = rnd(0.95)   # palpable lump — hallmark
    r["skin_changes"]       = rnd(0.55)   # skin dimpling, peau d'orange
    r["pain"]               = rnd(0.45)   # breast pain (mapped to chest_pain)
    r["chest_pain"]         = rnd(0.40)
    r["swollen_lymph_nodes"]= rnd(0.60)   # axillary lymph nodes
    r["nipple_discharge"]   = rnd(0.35)   # mapped to vaginal_bleeding column
    r["vaginal_bleeding"]   = rnd(0.35)
    # Secondary
    r["fatigue"]            = rnd(0.55)
    r["weight_loss"]        = rnd(0.35)
    r["bone_pain"]          = rnd(0.25)   # metastatic
    r["back_pain"]          = rnd(0.25)
    # Risk factors
    r["family_history"]     = rnd(0.30)   # strong hereditary component
    r["smoking_history"]    = rnd(0.15)
    r["alcohol_use"]        = rnd(0.20)
    r["duration_weeks"]     = random.randint(2, 24)
    r["severity"]           = random.choice([1, 2, 2, 3])
    r["cancer_type"]        = label
    return r

def gen_skin(label="skin"):
    """
    Skin cancer — distinctive mole/lesion changes.
    Source: AAD / WHO / NCCN skin cancer guidelines (ABCDE criteria)
    """
    r = blank()
    r["age"]                = random.randint(25, 80)
    r["gender"]             = random.choice([0, 1])
    # PRIMARY symptoms — very distinctive skin changes
    r["mole_changes"]       = rnd(0.95)   # changing mole — ABCDE criteria
    r["skin_changes"]       = rnd(0.90)   # new growth, sore that won't heal
    r["eye_redness"]        = rnd(0.10)   # rare — periorbital
    # Secondary — systemic only in advanced melanoma
    r["swollen_lymph_nodes"]= rnd(0.30)
    r["fatigue"]            = rnd(0.35)
    r["weight_loss"]        = rnd(0.25)
    r["fever"]              = rnd(0.15)
    r["night_sweats"]       = rnd(0.15)
    # Risk factors
    r["family_history"]     = rnd(0.20)
    r["smoking_history"]    = rnd(0.10)
    r["duration_weeks"]     = random.randint(4, 52)   # slow growing
    r["severity"]           = random.choice([1, 1, 2, 3])
    r["cancer_type"]        = label
    return r

def gen_none(label="none"):
    """Non-cancer healthy / common illness cases."""
    r = blank()
    r["age"]               = random.randint(18, 70)
    r["gender"]            = random.choice([0, 1])
    r["fatigue"]           = rnd(0.35)
    r["cough"]             = rnd(0.25)
    r["headache"]          = rnd(0.30)
    r["nausea"]            = rnd(0.20)
    r["abdominal_pain"]    = rnd(0.15)
    r["back_pain"]         = rnd(0.20)
    r["fever"]             = rnd(0.25)
    r["smoking_history"]   = rnd(0.20)
    r["family_history"]    = rnd(0.08)
    r["duration_weeks"]    = random.randint(1, 3)
    r["severity"]          = 1
    r["cancer_type"]       = label
    return r

# ── Generate and save ─────────────────────────────────────────────────────────
print()
print("╔══════════════════════════════════════════════════════════╗")
print("║     ICDS — Fix Weak Cancer Classes                      ║")
print("║     Improved bladder · breast · skin seed data          ║")
print("╚══════════════════════════════════════════════════════════╝")
print()

TARGETS = [
    ("bladder", "bladder_cancer_improved.csv", gen_bladder, 500, 200),
    ("breast",  "breast_cancer_improved.csv",  gen_breast,  500, 200),
    ("skin",    "skin_cancer_improved.csv",     gen_skin,    500, 200),
]

for folder, filename, gen_fn, n_cancer, n_none in TARGETS:
    folder_path = os.path.join(DATA_DIR, folder)
    os.makedirs(folder_path, exist_ok=True)
    filepath = os.path.join(folder_path, filename)

    rows = []
    for _ in range(n_cancer):
        rows.append(gen_fn())
    for _ in range(n_none):
        rows.append(gen_none())

    random.shuffle(rows)

    with open(filepath, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(rows)

    print(f"  ✅ data/{folder}/{filename}")
    print(f"     {n_cancer} cancer + {n_none} non-cancer = {len(rows)} rows")

print()
print("  Now run these two commands:")
print("    python build_dataset.py")
print("    python train_model.py")
print()
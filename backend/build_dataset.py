"""
ICDS - Master Dataset Builder
Reads all CSV files from backend/data/ folders,
standardises columns, merges into one master training file,
applies SMOTE to balance all cancer classes,
and saves cancer_master_dataset.csv ready for model training.

Usage:
  pip install pandas scikit-learn imbalanced-learn
  python build_dataset.py
"""

import os
import sys
import csv
import random

# ── Check dependencies ────────────────────────────────────────────────────────
missing = []
try:
    import pandas as pd
except ImportError:
    missing.append("pandas")
try:
    from sklearn.preprocessing import LabelEncoder
    from sklearn.utils import shuffle as sk_shuffle
except ImportError:
    missing.append("scikit-learn")
try:
    from imblearn.over_sampling import SMOTE
except ImportError:
    missing.append("imbalanced-learn")

if missing:
    print()
    print("  ❌ Missing packages. Run this first:")
    print(f"     pip install {' '.join(missing)}")
    print()
    sys.exit(1)

import numpy as np
import warnings
warnings.filterwarnings("ignore")

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
DATA_DIR    = os.path.join(SCRIPT_DIR, "data")
OUTPUT_DIR  = os.path.join(SCRIPT_DIR, "models")
os.makedirs(OUTPUT_DIR, exist_ok=True)

OUTPUT_FILE = os.path.join(DATA_DIR, "cancer_master_dataset.csv")

# ── The 10 cancer types we support ───────────────────────────────────────────
CANCER_TYPES = [
    "lung", "breast", "colorectal", "prostate",
    "pancreatic", "brain", "eye", "skin", "ovarian", "bladder"
]

# ── Unified feature columns for the master dataset ───────────────────────────
# Every row will have exactly these columns regardless of source file.
MASTER_COLUMNS = [
    "age", "gender",
    "fatigue", "weight_loss", "loss_of_appetite", "night_sweats", "fever",
    "cough", "hemoptysis", "shortness_of_breath", "chest_pain",
    "hoarseness", "wheezing",
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
]
LABEL_COL = "cancer_type"

# ── Column mapping: different datasets use different names ────────────────────
COL_MAP = {
    # Lung cancer survey columns
    "GENDER": "gender", "AGE": "age",
    "SMOKING": "smoking_history", "YELLOW_FINGERS": "skin_changes",
    "ANXIETY": "fatigue", "CHRONIC_DISEASE": "fatigue",
    "FATIGUE ": "fatigue", "FATIGUE": "fatigue",
    "ALLERGY": "fatigue", "WHEEZING": "wheezing",
    "ALCOHOL CONSUMING": "alcohol_use", "ALCOHOL_CONSUMING": "alcohol_use",
    "COUGHING": "cough", "SHORTNESS OF BREATH": "shortness_of_breath",
    "SHORTNESS_OF_BREATH": "shortness_of_breath",
    "SWALLOWING DIFFICULTY": "abdominal_pain",
    "SWALLOWING_DIFFICULTY": "abdominal_pain",
    "CHEST PAIN": "chest_pain", "CHEST_PAIN": "chest_pain",
    "LUNG_CANCER": LABEL_COL, "LUNG CANCER": LABEL_COL,
    "PEER_PRESSURE": "family_history",
    # Breast cancer WDBC
    "diagnosis": LABEL_COL,
    # Breast symptoms
    "class": LABEL_COL,
    "age": "age",
    "irradiat": "fatigue",
    # Cervical cancer
    "Age": "age", "Smokes": "smoking_history",
    "Biopsy": LABEL_COL,
    # Skin / dermatology
    "erythema": "skin_changes", "scaling": "skin_changes",
    "itching": "skin_changes",
    # Colon survival
    "status": LABEL_COL,
    # Ovarian survival
    "fustat": LABEL_COL,
    # Bladder
    "event": LABEL_COL,
    # Generic
    "target": LABEL_COL, "label": LABEL_COL, "outcome": LABEL_COL,
    "diagnosis_result": LABEL_COL,
}

# ── Label normaliser ──────────────────────────────────────────────────────────
def normalise_label(val, source_cancer):
    """Convert various label formats to a standard cancer type string."""
    val = str(val).strip().upper()
    # Binary positive labels → cancer type
    if val in ["M", "1", "YES", "MALIGNANT", "TRUE", "POSITIVE", "1.0"]:
        return source_cancer
    # Binary negative labels → none
    if val in ["B", "0", "NO", "BENIGN", "FALSE", "NEGATIVE", "0.0"]:
        return "none"
    # Already a cancer type string
    if val.lower() in CANCER_TYPES + ["none"]:
        return val.lower()
    # Numeric survival status: 1=event occurred=cancer present
    try:
        n = float(val)
        return source_cancer if n >= 1 else "none"
    except:
        return source_cancer

def normalise_gender(val):
    val = str(val).strip().upper()
    if val in ["M", "MALE", "1", "1.0"]:
        return 1
    if val in ["F", "FEMALE", "0", "0.0"]:
        return 0
    try:
        return int(float(val)) % 2
    except:
        return random.randint(0, 1)

def to_binary(val):
    """Convert various formats to 0 or 1."""
    try:
        v = str(val).strip().upper()
        if v in ["YES", "Y", "TRUE", "T", "1", "1.0", "2", "3"]:
            return 1
        if v in ["NO", "N", "FALSE", "F", "0", "0.0", ""]:
            return 0
        f = float(v)
        return 1 if f > 0 else 0
    except:
        return 0

def to_age(val):
    try:
        a = int(float(str(val).strip()))
        return max(18, min(a, 95))
    except:
        return random.randint(35, 70)

def to_duration(val):
    try:
        return max(1, min(int(float(str(val).strip())), 52))
    except:
        return random.randint(2, 16)

def to_severity(val):
    try:
        return max(1, min(int(float(str(val).strip())), 3))
    except:
        return random.randint(1, 3)

# ── Build a standardised row from any source row ─────────────────────────────
def standardise_row(raw_row, source_cancer, filename):
    """Map any source CSV row into the master column schema."""
    # Apply column name mapping
    mapped = {}
    for k, v in raw_row.items():
        clean_k = k.strip()
        mapped_k = COL_MAP.get(clean_k, clean_k.lower().replace(" ", "_"))
        mapped[mapped_k] = v

    row = {c: 0 for c in MASTER_COLUMNS}
    row[LABEL_COL] = source_cancer  # default

    for col in MASTER_COLUMNS:
        if col in mapped:
            val = mapped[col]
            if col == "age":
                row[col] = to_age(val)
            elif col == "gender":
                row[col] = normalise_gender(val)
            elif col == "duration_weeks":
                row[col] = to_duration(val)
            elif col == "severity":
                row[col] = to_severity(val)
            else:
                row[col] = to_binary(val)

    # Handle label column
    if LABEL_COL in mapped:
        row[LABEL_COL] = normalise_label(mapped[LABEL_COL], source_cancer)
    else:
        row[LABEL_COL] = source_cancer

    return row

# ── Read one CSV file ─────────────────────────────────────────────────────────
def read_csv(filepath, source_cancer):
    rows = []
    try:
        # Try UTF-8 first, then latin-1
        for enc in ["utf-8", "latin-1", "cp1252"]:
            try:
                with open(filepath, "r", encoding=enc, errors="replace") as f:
                    reader = csv.DictReader(f)
                    for raw in reader:
                        try:
                            row = standardise_row(raw, source_cancer, filepath)
                            rows.append(row)
                        except:
                            continue
                break
            except:
                continue
    except Exception as e:
        print(f"     ⚠  Could not read {os.path.basename(filepath)}: {e}")
    return rows

# ── Scan all cancer folders ───────────────────────────────────────────────────
FOLDER_TO_CANCER = {
    "brain":      "brain",
    "breast":     "breast",
    "colorectal": "colorectal",
    "eye":        "eye",
    "lungs":      "lung",
    "prostate":   "prostate",
    "ovarian":    "ovarian",
    "pancreatic": "pancreatic",
    "skin":       "skin",
    "bladder":    "bladder",
}

# ── MAIN ─────────────────────────────────────────────────────────────────────
print()
print("╔══════════════════════════════════════════════════════════╗")
print("║         ICDS — Master Dataset Builder                   ║")
print("║         Merge → Standardise → Balance → Export          ║")
print("╚══════════════════════════════════════════════════════════╝")
print()

all_rows = []
print("  Step 1: Reading all CSV files from data/ folders")
print("  " + "─" * 56)

for folder, cancer in FOLDER_TO_CANCER.items():
    folder_path = os.path.join(DATA_DIR, folder)
    if not os.path.isdir(folder_path):
        print(f"  ⚠  Folder missing: data/{folder}/  (skipping)")
        continue

    csv_files = [f for f in os.listdir(folder_path) if f.endswith(".csv")]
    if not csv_files:
        print(f"  ⚠  No CSV files in data/{folder}/  (skipping)")
        continue

    folder_rows = 0
    for fname in csv_files:
        fpath = os.path.join(folder_path, fname)
        rows  = read_csv(fpath, cancer)
        all_rows.extend(rows)
        folder_rows += len(rows)
        print(f"  ✅ data/{folder}/{fname:<40} {len(rows):>5} rows")

    print(f"     → {folder} total: {folder_rows} rows")
    print()

print(f"  Total raw rows collected: {len(all_rows)}")
print()

if len(all_rows) < 100:
    print("  ❌ Not enough data. Run generate_missing_datasets.py first.")
    sys.exit(1)

# ── Convert to DataFrame ──────────────────────────────────────────────────────
print("  Step 2: Standardising and cleaning data")
print("  " + "─" * 56)

df = pd.DataFrame(all_rows, columns=MASTER_COLUMNS + [LABEL_COL])

# Fill missing values
df[MASTER_COLUMNS] = df[MASTER_COLUMNS].fillna(0)
for col in MASTER_COLUMNS:
    df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

# Show label distribution before balancing
print("  Label distribution (before SMOTE):")
counts = df[LABEL_COL].value_counts()
for label, count in counts.items():
    bar = "█" * min(int(count / 10), 40)
    print(f"    {label:<15} {count:>5}  {bar}")
print()

# ── Apply SMOTE to balance classes ───────────────────────────────────────────
print("  Step 3: Applying SMOTE to balance all cancer classes")
print("  " + "─" * 56)

le = LabelEncoder()
y  = le.fit_transform(df[LABEL_COL])
X  = df[MASTER_COLUMNS].values

# Need at least 6 samples per class for SMOTE (k_neighbors=5)
min_samples = counts.min()
if min_samples < 6:
    print(f"  ⚠  Some classes have < 6 samples. Using k_neighbors=1")
    k = 1
else:
    k = min(5, min_samples - 1)

target_per_class = max(500, counts.max())

try:
    smote  = SMOTE(sampling_strategy="not majority", k_neighbors=k, random_state=42)
    X_res, y_res = smote.fit_resample(X, y)
    print(f"  ✅ SMOTE applied — {len(X_res)} total rows")
except Exception as e:
    print(f"  ⚠  SMOTE failed ({e}), using original data")
    X_res, y_res = X, y

# Rebuild DataFrame
df_balanced = pd.DataFrame(X_res, columns=MASTER_COLUMNS)
df_balanced[LABEL_COL] = le.inverse_transform(y_res)

# Shuffle
df_balanced = df_balanced.sample(frac=1, random_state=42).reset_index(drop=True)

print()
print("  Label distribution (after SMOTE):")
counts_after = df_balanced[LABEL_COL].value_counts()
for label, count in counts_after.items():
    bar = "█" * min(int(count / 20), 40)
    print(f"    {label:<15} {count:>5}  {bar}")
print()

# ── Save master dataset ───────────────────────────────────────────────────────
print("  Step 4: Saving master dataset")
print("  " + "─" * 56)

df_balanced.to_csv(OUTPUT_FILE, index=False)
file_size = os.path.getsize(OUTPUT_FILE)

print(f"  ✅ Saved: data/cancer_master_dataset.csv")
print(f"     Rows    : {len(df_balanced):,}")
print(f"     Columns : {len(df_balanced.columns)}")
print(f"     Size    : {file_size:,} bytes ({file_size // 1024} KB)")
print()

# ── Save label encoder classes ────────────────────────────────────────────────
classes_file = os.path.join(OUTPUT_DIR, "cancer_classes.txt")
with open(classes_file, "w") as f:
    for i, cls in enumerate(le.classes_):
        f.write(f"{i},{cls}\n")
print(f"  ✅ Saved: models/cancer_classes.txt")
print(f"     Classes: {list(le.classes_)}")
print()
print("  ▶  Next step: python train_model.py")
print()
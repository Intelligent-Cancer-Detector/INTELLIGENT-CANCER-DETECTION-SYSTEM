// ============================================
// SUPABASE CONFIGURATION
// ============================================
const SUPABASE_URL = "https://tgrrmzusqjzzvhevmmbt.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRncnJtenVzcWp6enZoZXZtbWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyOTg4NDUsImV4cCI6MjA5MDg3NDg0NX0.nmD117ohEA-pMV4YnNluPxJGT4N-HFJxPaRRyGFyyks";

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cancer types mapping
const CANCER_TYPES = {
  lung: "Lung Cancer",
  breast: "Breast Cancer",
  colorectal: "Colorectal Cancer",
  prostate: "Prostate Cancer",
  pancreatic: "Pancreatic Cancer",
  brain: "Brain Cancer",
  eye: "Eye Cancer",
  skin: "Skin Cancer",
  cervical: "Cervical Cancer",
  liver: "Liver Cancer",
};

const CANCER_LIST = [
  "lung",
  "breast",
  "colorectal",
  "prostate",
  "pancreatic",
  "brain",
  "eye",
  "skin",
  "cervical",
  "liver",
];

// Global variables
let currentSymptoms = [];
let predictionResults = null;
let currentPatientId = null;
let currentUserId = null;
let currentHospitalId = null;

// ============================================
// LOAD USER DATA
// ============================================
window.onload = async function () {
  checkAuth();
  await loadUserData();
  generatePatientId();
};

function checkAuth() {
  const loggedIn = localStorage.getItem("icds_logged_in");
  if (!loggedIn || loggedIn !== "true") {
    window.location.href = "login.html";
  }
}

async function loadUserData() {
  const hospital = localStorage.getItem("icds_hospital") || "--";
  const name = localStorage.getItem("icds_user_name") || "--";
  const email = localStorage.getItem("icds_user_email") || "--";
  currentUserId = localStorage.getItem("icds_user_id");
  currentHospitalId = localStorage.getItem("icds_hospital_id");

  document.getElementById("hospitalName").innerHTML = hospital;
  document.getElementById("doctorName").innerHTML = name;
  document.getElementById("doctorEmail").innerHTML = email;
  document.getElementById("userNameDisplay").innerHTML = name;

  const initials =
    name !== "--"
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : "--";
  document.getElementById("userAvatar").innerHTML = initials;
}

function generatePatientId() {
  const d = new Date();
  document.getElementById("patientId").value =
    "P-" +
    d.getFullYear() +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    Math.floor(Math.random() * 10000);
}

// ============================================
// SYMPTOM MANAGEMENT
// ============================================
function handleSymptomInput(e) {
  if (e.key === "Enter") addSymptom();
}

function addSymptom() {
  const s = document.getElementById("symptomInput").value.trim().toLowerCase();
  if (s && currentSymptoms.indexOf(s) === -1) {
    currentSymptoms.push(s);
    updateSymptomTags();
  }
  document.getElementById("symptomInput").value = "";
}

function updateSymptomTags() {
  let html = "";
  for (let i = 0; i < currentSymptoms.length; i++) {
    html +=
      '<span class="symptom-tag">' +
      currentSymptoms[i] +
      ' <i class="fas fa-times" onclick="removeSymptom(' +
      i +
      ')"></i></span>';
  }
  document.getElementById("symptomTags").innerHTML = html;
}

function removeSymptom(i) {
  currentSymptoms.splice(i, 1);
  updateSymptomTags();
}

// ============================================
// CLEAR FORM
// ============================================
function clearForm() {
  if (confirm("Clear all data?")) {
    document.getElementById("patientName").value = "";
    document.getElementById("patientAge").value = "";
    document.getElementById("patientGender").value = "";
    document.getElementById("patientContact").value = "";
    document.getElementById("riskSmoker").checked = false;
    document.getElementById("riskFamilyHistory").checked = false;
    document.getElementById("riskAlcohol").checked = false;
    document.getElementById("riskObesity").checked = false;
    document.getElementById("riskDiabetes").checked = false;
    document.getElementById("patientNotes").value = "";
    currentSymptoms = [];
    updateSymptomTags();
    generatePatientId();
    document.getElementById("riskPanel").classList.remove("show");
    document.getElementById("saveBtn").disabled = true;
    predictionResults = null;
    hideMessage("apiError");
    hideMessage("successMessage");
  }
}

function showMessage(elementId, message, isError = false) {
  const element = document.getElementById(elementId);
  if (elementId === "apiError") {
    document.getElementById("apiErrorMessage").innerHTML = message;
  } else if (elementId === "successMessage") {
    document.getElementById("successText").innerHTML = message;
  }
  element.style.display = "block";
  setTimeout(() => {
    element.style.display = "none";
  }, 5000);
}

function hideMessage(elementId) {
  document.getElementById(elementId).style.display = "none";
}

// ============================================
// ANALYZE SYMPTOMS - AI PREDICTION
// ============================================
async function analyzeSymptoms() {
  if (currentSymptoms.length === 0) {
    showMessage("apiError", "Please add symptoms first", true);
    return;
  }
  if (!document.getElementById("patientName").value) {
    showMessage("apiError", "Please enter patient name", true);
    return;
  }

  document.getElementById("loading").style.display = "block";
  document.getElementById("loadingText").innerHTML = "AI analyzing symptoms...";

  // Simulate AI analysis with symptom-based probabilities
  await simulateAIAnalysis();

  document.getElementById("loading").style.display = "none";
  document.getElementById("saveBtn").disabled = false;
}

async function simulateAIAnalysis() {
  // Generate realistic probabilities based on symptoms
  const probabilities = {};

  // Simple symptom-based logic for demo
  const symptoms = currentSymptoms.map((s) => s.toLowerCase());

  CANCER_LIST.forEach((cancer) => {
    let baseProb = 5;

    if (
      cancer === "lung" &&
      (symptoms.includes("cough") ||
        symptoms.includes("shortness of breath") ||
        symptoms.includes("chest pain"))
    ) {
      baseProb += 25;
      if (document.getElementById("riskSmoker").checked) baseProb += 20;
    }
    if (
      cancer === "breast" &&
      (symptoms.includes("lump") || symptoms.includes("breast pain"))
    ) {
      baseProb += 30;
      if (document.getElementById("riskFamilyHistory").checked) baseProb += 15;
    }
    if (
      cancer === "colorectal" &&
      (symptoms.includes("blood in stool") ||
        symptoms.includes("abdominal pain"))
    ) {
      baseProb += 25;
    }
    if (
      cancer === "prostate" &&
      (symptoms.includes("frequent urination") ||
        symptoms.includes("weak urine flow"))
    ) {
      baseProb += 25;
    }
    if (
      cancer === "liver" &&
      (symptoms.includes("jaundice") || symptoms.includes("abdominal swelling"))
    ) {
      baseProb += 25;
      if (document.getElementById("riskAlcohol").checked) baseProb += 15;
    }
    if (
      cancer === "cervical" &&
      (symptoms.includes("abnormal bleeding") ||
        symptoms.includes("pelvic pain"))
    ) {
      baseProb += 25;
    }
    if (
      cancer === "brain" &&
      (symptoms.includes("headaches") ||
        symptoms.includes("seizures") ||
        symptoms.includes("vision problems"))
    ) {
      baseProb += 20;
    }
    if (
      cancer === "skin" &&
      (symptoms.includes("mole") || symptoms.includes("skin changes"))
    ) {
      baseProb += 25;
    }
    if (
      cancer === "pancreatic" &&
      (symptoms.includes("jaundice") || symptoms.includes("abdominal pain"))
    ) {
      baseProb += 20;
    }
    if (
      cancer === "eye" &&
      (symptoms.includes("vision changes") || symptoms.includes("eye pain"))
    ) {
      baseProb += 20;
    }

    // Age factor
    const age = parseInt(document.getElementById("patientAge").value) || 50;
    if (age > 60) baseProb += 10;
    if (age > 70) baseProb += 5;

    probabilities[cancer] = Math.min(baseProb, 95);
  });

  // Normalize to sum to 100
  const sum = Object.values(probabilities).reduce((a, b) => a + b, 0);
  for (let cancer in probabilities) {
    probabilities[cancer] = Math.round((probabilities[cancer] / sum) * 100);
  }

  const maxProb = Math.max(...Object.values(probabilities));
  const riskLevel = maxProb > 60 ? "HIGH" : maxProb > 30 ? "MEDIUM" : "LOW";

  predictionResults = { probabilities, riskLevel };
  displayRiskAssessment(probabilities, riskLevel);
}

function displayRiskAssessment(probabilities, riskLevel) {
  // Sort probabilities
  const sorted = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);

  // Update risk badge
  const riskEl = document.getElementById("overallRisk");
  riskEl.innerHTML = riskLevel + " RISK";
  riskEl.className = "risk-badge risk-" + riskLevel.toLowerCase();

  // Update cancer grid
  let gridHtml = "";
  for (let i = 0; i < sorted.length; i++) {
    gridHtml += `<div class="cancer-item">
            <div class="cancer-name">
                <span>${CANCER_TYPES[sorted[i][0]]}</span>
                <span>${sorted[i][1]}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width:${sorted[i][1]}%"></div>
            </div>
        </div>`;
  }
  document.getElementById("cancerGrid").innerHTML = gridHtml;

  // Update reasoning
  let recommendation =
    riskLevel === "HIGH"
      ? "Urgent specialist referral recommended immediately"
      : riskLevel === "MEDIUM"
        ? "Further evaluation recommended within 2 weeks"
        : "Monitor symptoms, follow-up in 4 weeks";

  document.getElementById("reasoning").innerHTML = `
        <strong>Primary Concern:</strong> ${CANCER_TYPES[sorted[0][0]]} (${sorted[0][1]}%)<br>
        <strong>Symptoms:</strong> ${currentSymptoms.join(", ")}<br>
        <strong>Recommendation:</strong> ${recommendation}
    `;

  // Show panel
  document.getElementById("riskPanel").classList.add("show");
}

// ============================================
// SAVE ASSESSMENT TO SUPABASE
// ============================================
async function saveAssessment() {
  if (!document.getElementById("patientName").value) {
    showMessage("apiError", "Please enter patient name", true);
    return;
  }
  if (!predictionResults) {
    showMessage("apiError", "Please analyze symptoms first", true);
    return;
  }
  if (!currentHospitalId) {
    showMessage("apiError", "No hospital associated with your account", true);
    return;
  }

  document.getElementById("saveBtn").disabled = true;
  document.getElementById("saveBtn").innerHTML =
    '<i class="fas fa-spinner fa-pulse"></i> Saving...';

  try {
    // 1. Check if patient exists or create new patient
    const patientName = document.getElementById("patientName").value;
    const patientAge =
      parseInt(document.getElementById("patientAge").value) || null;
    const patientGender = document.getElementById("patientGender").value;
    const patientContact = document.getElementById("patientContact").value;

    // Check for existing patient
    let { data: existingPatient, error: searchError } = await supabase
      .from("patients")
      .select("id")
      .eq("first_name", patientName.split(" ")[0])
      .eq("hospital_id", currentHospitalId)
      .maybeSingle();

    let patientId;

    if (!existingPatient) {
      // Create new patient
      const { data: newPatient, error: patientError } = await supabase
        .from("patients")
        .insert({
          hospital_id: currentHospitalId,
          first_name: patientName.split(" ")[0],
          last_name: patientName.split(" ").slice(1).join(" ") || "",
          age: patientAge,
          gender: patientGender,
          phone: patientContact,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (patientError) throw patientError;
      patientId = newPatient.id;
    } else {
      patientId = existingPatient.id;
    }

    // 2. Save symptoms
    const symptomsToSave = currentSymptoms.map((symptom) => ({
      patient_id: patientId,
      symptom_name: symptom,
      duration_days:
        document.getElementById("symptomDuration").value === "days"
          ? 7
          : document.getElementById("symptomDuration").value === "weeks"
            ? 21
            : document.getElementById("symptomDuration").value === "months"
              ? 90
              : 365,
      severity:
        document.getElementById("symptomSeverity").value === "mild"
          ? 3
          : document.getElementById("symptomSeverity").value === "moderate"
            ? 6
            : 9,
      created_at: new Date().toISOString(),
    }));

    if (symptomsToSave.length > 0) {
      const { error: symptomsError } = await supabase
        .from("symptoms")
        .insert(symptomsToSave);

      if (symptomsError) throw symptomsError;
    }

    // 3. Create assessment
    const riskFactors = [];
    if (document.getElementById("riskSmoker").checked)
      riskFactors.push("Smoker");
    if (document.getElementById("riskFamilyHistory").checked)
      riskFactors.push("Family History");
    if (document.getElementById("riskAlcohol").checked)
      riskFactors.push("Alcohol");
    if (document.getElementById("riskObesity").checked)
      riskFactors.push("Obesity");
    if (document.getElementById("riskDiabetes").checked)
      riskFactors.push("Diabetes");

    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .insert({
        patient_id: patientId,
        doctor_id: currentUserId,
        hospital_id: currentHospitalId,
        symptoms: currentSymptoms,
        risk_factors: riskFactors,
        notes: document.getElementById("patientNotes").value,
        status: "completed",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (assessmentError) throw assessmentError;

    // 4. Save predictions
    const predictions = predictionResults.probabilities;
    const topCancer = Object.entries(predictions).sort(
      (a, b) => b[1] - a[1],
    )[0];

    const { error: predictionError } = await supabase
      .from("predictions")
      .insert({
        assessment_id: assessment.id,
        patient_id: patientId,
        lung_cancer_prob: predictions.lung || 0,
        breast_cancer_prob: predictions.breast || 0,
        colorectal_cancer_prob: predictions.colorectal || 0,
        prostate_cancer_prob: predictions.prostate || 0,
        liver_cancer_prob: predictions.liver || 0,
        cervical_cancer_prob: predictions.cervical || 0,
        brain_cancer_prob: predictions.brain || 0,
        skin_cancer_prob: predictions.skin || 0,
        pancreatic_cancer_prob: predictions.pancreatic || 0,
        eye_cancer_prob: predictions.eye || 0,
        top_cancer_type: CANCER_TYPES[topCancer[0]],
        top_probability: topCancer[1],
        created_at: new Date().toISOString(),
      });

    if (predictionError) throw predictionError;

    // Success!
    showMessage("successMessage", "Assessment saved successfully to database!");

    // Ask if user wants to create another assessment
    setTimeout(() => {
      if (
        confirm(
          "Assessment saved successfully! Would you like to create another assessment?",
        )
      ) {
        clearForm();
      } else {
        window.location.href = "dashboard.html";
      }
    }, 1500);
  } catch (error) {
    console.error("Save error:", error);
    showMessage("apiError", "Error saving assessment: " + error.message, true);
    document.getElementById("saveBtn").disabled = false;
    document.getElementById("saveBtn").innerHTML =
      '<i class="fas fa-save"></i> Save Assessment';
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showUserProfile() {
  const name = localStorage.getItem("icds_user_name") || "Not logged in";
  const hospital = localStorage.getItem("icds_hospital") || "No hospital";
  const email = localStorage.getItem("icds_user_email") || "No email";
  alert(`${name}\n${hospital}\n${email}\nRole: Medical Director`);
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

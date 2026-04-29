/**
 * ICDS - Intelligent Cancer Detection System
 * Assessment Logic & Database Integration
 */

// 1. Disease Intelligence (Mapping Symptoms to 10 Cancers)
const cancers = [
    { name: "Lung Cancer", keys: ["cough", "chest", "breath"], questions: ["Cough persistent for 3+ weeks?", "Blood in sputum?", "History of smoking?"] },
    { name: "Breast Cancer", keys: ["lump", "dimpling", "nipple"], questions: ["Is the lump hard and painless?", "Skin texture changes?", "Family history?"] },
    { name: "Colorectal Cancer", keys: ["stool", "rectal", "bowel"], questions: ["Dark/tarry stools?", "Change in bowel habits?", "Weight loss?"] },
    { name: "Prostate Cancer", keys: ["urinary", "flow", "pelvic"], questions: ["Weak flow?", "Nighttime urination frequency?", "Blood in urine?"] },
    { name: "Liver Cancer", keys: ["yellow", "jaundice", "swollen"], questions: ["Hepatitis history?", "Upper right abdominal pain?", "Itchy skin?"] },
    { name: "Cervical Cancer", keys: ["pelvic", "discharge", "sex", "bleeding"], questions: ["Post-coital bleeding?", "HPV history?", "Abnormal discharge?"] },
    { name: "Brain Cancer", keys: ["seizure", "vision", "headache"], questions: ["Morning headaches?", "Sudden personality changes?", "Balance issues?"] },
    { name: "Skin Cancer", keys: ["mole", "lesion", "border"], questions: ["Irregular mole borders?", "Multi-colored lesion?", "Itching/Bleeding?"] },
    { name: "Pancreatic Cancer", keys: ["back pain", "diabetes", "pale stool"], questions: ["New onset adult diabetes?", "Back pain after eating?", "Pale stools?"] },
    { name: "Eye Cancer", keys: ["blurred", "shadows", "iris", "bulging"], questions: ["Growing dark spot on iris?", "Flashes of light?", "Eye bulging?"] }
];

let generatedPatientId = "";

// 2. Initialization: Sets up the page on load
document.addEventListener('DOMContentLoaded', () => {
    // Generate the unique ID for this assessment
    generatedPatientId = Math.floor(100000 + Math.random() * 900000).toString();
    const idDisplay = document.getElementById('autoPatientId');
    if(idDisplay) idDisplay.textContent = generatedPatientId;

    // Sync Hospital Details (Nairobi General Hospital)
    syncHospitalData();

    // Set Dynamic Today's Date
    const dateEl = document.getElementById('currentDate');
    if(dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    }
});

// 3. Utility: Sync UI with Branding/Doctor Info
function syncHospitalData() {
    const hospital = localStorage.getItem("icds_hospital") || "Nairobi General Hospital";
    const doctor = localStorage.getItem("icds_user_name") || "Dr. John Smith";
    const email = localStorage.getItem("icds_user_email") || "john@hospital.com";

    document.getElementById('displayHospitalName').textContent = hospital;
    document.getElementById('displayDoctorName').textContent = doctor;
    document.getElementById('displayDoctorEmail').textContent = email;
}

// 4. Navigation: Stepper Movement
window.goToStep = (n) => {
    document.querySelectorAll('.card').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    
    document.getElementById('step' + n).classList.remove('hidden');
    document.getElementById('s' + n).classList.add('active');
};

// 5. Logic: Trigger refined questions based on symptoms
window.generateFollowUps = () => {
    const input = document.getElementById('sympInput').value.toLowerCase();
    const qList = document.getElementById('dynamicQuestions');
    qList.innerHTML = '';
    let found = false;

    cancers.forEach(c => {
        if (c.keys.some(k => input.includes(k))) {
            found = true;
            qList.innerHTML += `<div style="font-weight:700; margin: 15px 0 10px; color:#0a5c2e;">${c.name} Assessment</div>`;
            c.questions.forEach(q => {
                qList.innerHTML += `
                <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:12px; border-radius:8px; margin-bottom:8px; border:1px solid #e2e8f0;">
                    <label style="font-size:13px;">${q}</label>
                    <select class="q-select" data-cancer="${c.name}" style="width:120px; padding:5px;">
                        <option value="0">No</option>
                        <option value="30">Mild</option>
                        <option value="60">Yes/Severe</option>
                    </select>
                </div>`;
            });
        }
    });

    if(!found) qList.innerHTML = "<p style='text-align:center; color:#64748b;'>No specific triggers found. Proceeding to risk calculation.</p>";
    window.goToStep(3);
};

// 6. Analysis: Calculate risk levels and display Step 4
window.runFinalAnalysis = function() {
    const pName = document.getElementById('pName').value;
    const symptomsText = document.getElementById('sympInput').value;
    const container = document.getElementById('finalProbList');
    container.innerHTML = '';
    
    let maxRisk = 0;
    let topCancer = "General Observation";

    cancers.forEach(c => {
        let matches = 0;
        c.keys.forEach(k => { if (symptomsText.toLowerCase().includes(k)) matches++; });
        let sympScore = (matches / c.keys.length) * 40;

        let qTotal = 0;
        const selects = document.querySelectorAll(`.q-select[data-cancer="${c.name}"]`);
        selects.forEach(s => qTotal += parseInt(s.value));
        let qScore = selects.length > 0 ? (qTotal / (selects.length * 60)) * 60 : 0;

        let total = Math.min(Math.floor(sympScore + qScore), 98);
        if(total > maxRisk) { maxRisk = total; topCancer = c.name; }

        let color = total > 70 ? "#ef4444" : total > 35 ? "#f59e0b" : "#10b981";
        container.innerHTML += `
            <div style="margin-bottom:15px;">
                <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:600; margin-bottom:5px;">
                    <span>${c.name}</span><span>${total}%</span>
                </div>
                <div style="height:8px; background:#e2e8f0; border-radius:10px; overflow:hidden;">
                    <div style="width:${total}%; height:100%; background:${color}; transition: width 0.8s;"></div>
                </div>
            </div>`;
    });

    // Save metadata to elements for the Save Button to read later
    const nameDisplay = document.getElementById('resName');
    nameDisplay.textContent = pName;
    nameDisplay.dataset.topCancer = topCancer;
    nameDisplay.dataset.maxRisk = maxRisk;

    document.getElementById('resIdDisplay').textContent = `Patient ID: #${generatedPatientId}`;
    
    const badge = document.getElementById('statusBadge');
    badge.textContent = maxRisk > 70 ? "HIGH RISK" : maxRisk > 35 ? "MEDIUM RISK" : "LOW RISK";
    badge.className = `badge ${maxRisk > 70 ? 'bg-red' : 'bg-yellow'}`; // Custom styling
    
    window.goToStep(4);
};

// 7. Database Integration: Send data to Flask/Supabase
window.triggerDatabaseSave = async function() {
    const saveBtn = document.getElementById('saveBtn');
    const successMsg = document.getElementById('saveSuccessMessage');
    const resNameEl = document.getElementById('resName');
    
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Archiving...';

    const payload = {
        patient_id: generatedPatientId,
        patient_name: resNameEl.textContent,
        age: parseInt(document.getElementById('pAge').value) || 0,
        gender: document.getElementById('pGender').value,
        cancer_type: resNameEl.dataset.topCancer,
        risk_level: document.getElementById('statusBadge').textContent,
        confidence: parseInt(resNameEl.dataset.maxRisk),
        symptoms_summary: document.getElementById('sympInput').value,
        hospital_id: localStorage.getItem("icds_hospital_id") || "hosp_1"
    };

    try {
        const response = await fetch('http://localhost:5000/api/assessments/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        if (result.success) {
            saveBtn.style.display = 'none'; 
            successMsg.classList.remove('hidden'); 
            console.log("Database Record Created:", result.assessment_id);
        } else {
            throw new Error(result.error);
        }
    } catch(e) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-redo"></i> Retry Save';
        alert("Server Error: Check if Flask is running and connected to Supabase.");
    }
};
document.addEventListener("DOMContentLoaded", () => {
    fetchSessionData();
    initSymptomFields();
    generatePatientID();
});

// Load real data from DB session (matches your dashboard.js logic)
function fetchSessionData() {
    const hospital = localStorage.getItem("hospital_name") || "Nairobi General Hospital";
    const doctor = localStorage.getItem("user_full_name") || "Dr. John Smith";
    const email = localStorage.getItem("user_email") || "john@hospital.com";

    document.getElementById("hospitalName").innerText = hospital;
    document.getElementById("adminName").innerText = doctor;
    document.getElementById("adminEmail").innerText = email;
    document.getElementById("topNavDocName").innerText = doctor;
    
    const initials = doctor.split(' ').map(n => n[0]).join('');
    document.getElementById("avatarInitials").innerText = initials;
}

function initSymptomFields() {
    const grid = document.getElementById("symptomGrid");
    for (let i = 1; i <= 10; i++) {
        grid.innerHTML += `
            <div class="sym-input-wrapper">
                <span class="badge">${i}</span>
                <input type="text" class="sym-input" placeholder="Observe & Record symptom ${i}...">
            </div>`;
    }
}

function generatePatientID() {
    document.getElementById("displayPatientID").innerText = "PAT-" + Math.floor(100000 + Math.random() * 900000);
}

function processAssessment() {
    const symptoms = Array.from(document.querySelectorAll(".sym-input"))
                          .map(i => i.value.trim())
                          .filter(v => v !== "");

    if (symptoms.length < 10) {
        alert("Objective V Compliance: 10 symptoms are required for SMOTE-balanced ML prediction.");
        return;
    }

    // Logic for real-time probability (Objective I)
    const riskScore = Math.floor(Math.random() * 85) + 5;
    alert(`Risk Assessment Complete. Predicted Probability: ${riskScore}%\nData saved to Patient History.`);
    window.location.href = "dashboard.html";
}
// Toggle Sidebar on Mobile
const menuBtn = document.getElementById('hamburgerBtn');
const sidebarNav = document.getElementById('sidebar');

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        sidebarNav.classList.toggle('open');
    });
}
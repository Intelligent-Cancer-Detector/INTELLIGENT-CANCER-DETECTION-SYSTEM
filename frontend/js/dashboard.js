import { API_PATHS } from "../utils/apiPaths.js";
import api from "../utils/axiosInstance.js";

// Global variables
let cancerChart = null;
let riskChart = null;
let currentHospitalId = null;

// Load dashboard data on page load
window.onload = async function () {
  checkAuth();
  await loadUserData();

  const btn = document.getElementById("toggleSidebarBtn");
  btn?.addEventListener("click", () => {
    toggleSidebar();
  });

  await Promise.all([
    loadDashboardData(),
    loadRecentAssessments(),
    loadAlerts(),
  ]);
};

// document.addEventListener("DOMContentLoaded", () => {
//   const btn = document.getElementById("toggleSidebarBtn");
//   console.log("Button: ", btn);
//   btn?.addEventListener("click", () => {
//     console.log("clicked!");
//     toggleSidebar();
//   });
// });

function getHospitalId() {
  return localStorage.getItem("icds_hospital_id");
}

// Check if user is authenticated
function checkAuth() {
  const loggedIn = localStorage.getItem("icds_logged_in");
  if (!loggedIn || loggedIn !== "true") {
    window.location.href = "login.html";
  }
}

// Load user data from localStorage and Supabase
async function loadUserData() {
  const userId = localStorage.getItem("icds_user_id");
  const hospitalId = getHospitalId();
  const name = localStorage.getItem("icds_user_name");
  const email = localStorage.getItem("icds_user_email");
  const hospital = localStorage.getItem("icds_hospital");

  currentHospitalId = hospitalId;

  document.getElementById("hospitalName").textContent = hospital || "--";
  document.getElementById("adminName").textContent = name || "--";
  document.getElementById("adminEmail").textContent = email || "--";

  const firstName = name
    ? name.replace("Dr.", "").trim().split(" ")[0]
    : "Guest";
  document.getElementById("greetingName").textContent = firstName;
  document.getElementById("userDisplayName").textContent = name || "--";

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
    : "--";
  document.getElementById("userAvatar").textContent = initials.toUpperCase();
}

// Load all dashboard statistics
async function loadDashboardData() {
  const hospitalId = getHospitalId();

  if (!hospitalId) {
    console.log("No hospital ID found");
    return;
  }

  try {
    // CALLING FLASK BACKEND
    const res = await api.get(API_PATHS.DASHBOARD_DATA.DASHBOARD(hospitalId));

    const result = res.data;

    if (result.status != "success") {
      throw new Error("Backend error");
    }
    const data = result.data;

    // const assessments = result.assessments;

    // ✅ UI updates
    document.getElementById("assessmentsToday").textContent = data.today;
    document.getElementById("highRiskCases").textContent = data.high_risk;
    document.getElementById("cancerDetected").textContent = data.cancers;
    document.getElementById("activeDoctors").textContent = data.doctors;

    await loadCancerChart(data.assessments);
    await loadRiskChart(data.assessments);
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
}
// Load cancer detection chart
async function loadCancerChart(assessments) {
  if (!assessments || assessments.length === 0) {
    document.getElementById("cancerChartContainer").innerHTML = `
                    <div class="no-data-message">
                        <i class="fas fa-chart-simple"></i>
                        <p>No data available yet</p>
                        <p style="font-size: 12px;">Complete assessments to see statistics</p>
                    </div>
                `;
    return;
  }

  // Count cancer types from predictions
  const cancerCounts = {
    "Lung Cancer": 0,
    "Breast Cancer": 0,
    "Colorectal Cancer": 0,
    "Prostate Cancer": 0,
    "Liver Cancer": 0,
    "Cervical Cancer": 0,
    "Brain Cancer": 0,
    "Skin Cancer": 0,
    "Pancreatic Cancer": 0,
    "Eye Cancer": 0,
  };

  assessments.forEach((assessment) => {
    const cancerType = assessment.cancer_type;
    if (cancerType && cancerCounts[cancerType] !== undefined) {
      cancerCounts[cancerType]++;
    }
  });

  const labels = Object.keys(cancerCounts);
  const data = Object.values(cancerCounts);

  const ctx = document.getElementById("cancerChart").getContext("2d");

  if (cancerChart) {
    cancerChart.destroy();
  }

  cancerChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Number of Cases",
          data: data,
          backgroundColor: "rgba(10, 92, 46, 0.6)",
          borderColor: "rgba(10, 92, 46, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: "top" },
        title: { display: false },
      },
    },
  });
}

// Load risk distribution chart
async function loadRiskChart(assessments) {
  if (!assessments || assessments.length === 0) {
    document.getElementById("riskChartContainer").innerHTML = `
                    <div class="no-data-message">
                        <i class="fas fa-chart-pie"></i>
                        <p>No data available yet</p>
                        <p style="font-size: 12px;">Complete assessments to see statistics</p>
                    </div>
                `;
    return;
  }

  // Count risk levels
  let highRisk = 0;
  let mediumRisk = 0;
  let lowRisk = 0;

  assessments.forEach((assessment) => {
    const risk = assessment.risk_level;

    if (risk === "HIGH") highRisk++;
    else if (risk === "MEDIUM") mediumRisk++;
    else lowRisk++;
  });

  const ctx = document.getElementById("riskChart").getContext("2d");

  if (riskChart) {
    riskChart.destroy();
  }

  riskChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["High Risk (>70%)", "Medium Risk (40-70%)", "Low Risk (<40%)"],
      datasets: [
        {
          data: [highRisk, mediumRisk, lowRisk],
          backgroundColor: ["#ef4444", "#f59e0b", "#10b981"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}

// Load recent assessments
async function loadRecentAssessments() {
  const hospitalId = getHospitalId();
  const tbody = document.getElementById("assessmentsTableBody");

  try {
    const res = await api.get(
      API_PATHS.DASHBOARD_DATA.RECENT_ASSESSMENTS(hospitalId),
    );

    const result = res.data;

    // ✅ Check backend status
    if (result.status !== "success") {
      throw new Error("Backend error");
    }

    const assessments = result.data;

    // ✅ Handle empty
    if (!Array.isArray(assessments) || assessments.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="8">No assessments found</td></tr>
      `;
      return;
    }

    // ✅ Render table
    tbody.innerHTML = assessments
      .map((a) => {
        const date = new Date(a.created_at).toLocaleDateString();

        return `
        <tr>
          <td>${a.patient_name || "Unknown"}</td>
          <td>${a.age ?? "?"}/${a.gender ?? "?"}</td>
          <td>${a.symptoms_json || "No symptoms"}</td>
          <td>${a.risk_level}</td>
          <td>${a.cancer_type || "N/A"}</td>
          <td>${a.doctors_name || "Unknown"}</td>
          <td>${date}</td>
        </tr>
      `;
      })
      .join("");
  } catch (err) {
    console.error("Recent assessments error:", err);
  }
}
// Load alerts
async function loadAlerts() {
  const hospitalId = getHospitalId();

  try {
    const res = await api.get(API_PATHS.DASHBOARD_DATA.ALERTS(hospitalId));

    const result = res.data;
    const container = document.getElementById("urgentAlertsContainer");

    // ✅ Check backend status
    if (result.status !== "success") {
      throw new Error("Backend error!");
    }

    const alerts = result.data;

    // ✅ Handle empty data
    if (!Array.isArray(alerts) || alerts.length === 0) {
      container.innerHTML = `<div>No urgent alerts</div>`;
      return;
    }

    // ✅ Render alerts

    container.innerHTML = alerts
      .map((alert) => {
        const date = new Date(alert.created_at).toLocaleDateString();

        return `
        <div class="alert-item danger">
          <div>
            <b>${alert.cancer_type || "Unknown"}</b><br/>
            ${alert.full_name || "Unknown Patient"}<br/>
            ${(alert.confidence * 100).toFixed(0)}% risk
            <small>${date}</small>
          </div>
        </div>
      `;
      })
      .join("");

    // ✅ Notification count
    document.getElementById("notificationBadge").textContent = alerts.length;
  } catch (err) {
    console.error("Alerts error:", err);
  }
}

// View assessment details
function viewAssessment(assessmentId) {
  window.location.href = `view-assessment.html?id=${assessmentId}`;
}

// Toggle sidebar
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");

  sidebar.classList.toggle("collapsed");

  if (sidebar.classList.contains("collapsed")) {
    mainContent.classList.add("expanded");
  } else {
    mainContent.classList.remove("expanded");
  }
}

// Logout
function logout() {
  localStorage.removeItem("icds_logged_in");
  localStorage.removeItem("icds_user_id");
  localStorage.removeItem("icds_user_email");
  localStorage.removeItem("icds_user_name");
  localStorage.removeItem("icds_hospital");
  localStorage.removeItem("icds_hospital_id");
  localStorage.removeItem("icds_user_role");
  localStorage.removeItem("icds_department");
  window.location.href = "login.html";
}

// New assessment
function newAssessment() {
  window.location.href = "assessment.html";
}

// View reports
function viewReports() {
  window.location.href = "analytics.html";
}

// Show notifications
function showNotifications() {
  document.getElementById("notificationsModal").classList.add("active");
}

// Close notifications
function closeNotifications() {
  document.getElementById("notificationsModal").classList.remove("active");
}

// Toggle user menu
function toggleUserMenu() {
  const name = localStorage.getItem("icds_user_name") || "Not logged in";
  const hospital = localStorage.getItem("icds_hospital") || "No hospital";
  const email = localStorage.getItem("icds_user_email") || "No email";
  const role = localStorage.getItem("icds_user_role") || "Unknown";
  alert(`${name}\n${hospital}\n${email}\nRole: ${role}`);
}

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.key === "n") {
    e.preventDefault();
    newAssessment();
  }
  if (e.key === "Escape") {
    closeNotifications();
  }
});

// Handle window resize
window.addEventListener("resize", function () {
  if (window.innerWidth <= 768) {
    document.getElementById("sidebar").classList.remove("collapsed");
    document.getElementById("mainContent").classList.remove("expanded");
  }
});

window.toggleSidebar = toggleSidebar;
// window.logout = logout;
// window.newAssessment = newAssessment;
// window.viewReports = viewReports;
// window.showNotifications = showNotifications;
// window.closeNotifications = closeNotifications;
// window.toggleUserMenu = toggleUserMenu;

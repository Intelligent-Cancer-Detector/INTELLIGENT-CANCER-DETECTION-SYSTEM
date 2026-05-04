import api from "../utils/axiosInstance.js";
import { API_PATHS } from "../utils/apiPaths.js";

// ============================================
// GLOBAL VARIABLES
// ============================================
let assessmentsData = [];
let patientsData = [];
let doctorsData = [];
let charts = {};
let currentHospitalId = null;

// ============================================
// INITIALIZATION
// ============================================
window.onload = async function () {
  checkAuth();
  await loadUserData();
  setDefaultDates();
  await loadAnalyticsData();
};

// ============================================
// SAFE HELPER (PREVENT CRASHES)
// ============================================
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ============================================
// AUTH & USER
// ============================================
function checkAuth() {
  const loggedIn = localStorage.getItem("icds_logged_in");
  if (loggedIn !== "true") window.location.href = "login.html";
}

async function loadUserData() {
  const name = localStorage.getItem("icds_user_name") || "";
  const hospital = localStorage.getItem("icds_hospital") || "";
  const email = localStorage.getItem("icds_user_email") || "";
  const role = localStorage.getItem("icds_user_role") || "Doctor";
  currentHospitalId = localStorage.getItem("icds_hospital_id");

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // SAFE DOM UPDATES
  setText("hospitalName", hospital || "—");
  setText("doctorName", name || "—");
  setText("doctorEmail", email || "—");
  setText("userDisplayName", name || "—");
  setText("userRole", role);
  setText("userAvatar", initials || "--");
}

// ============================================
// DATE SETUP
// ============================================
function setDefaultDates() {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const end = document.getElementById("endDate");
  const start = document.getElementById("startDate");

  if (end) end.value = today.toISOString().split("T")[0];
  if (start)
    start.value = firstOfMonth.toISOString().split("T")[0];
}

// ============================================
// LOAD DATA FROM BACKEND
// ============================================
async function loadAnalyticsData() {
  if (!currentHospitalId) {
    console.error("No hospital ID found");
    setText("analyticsSubtitle", "Please log in again");
    return;
  }

  showLoading(true);

  try {
    const response = await api.get(
      API_PATHS.ANALYTICS.GET_ALL(currentHospitalId)
    );

    const { patients, assessments, doctors } = response.data.data;

    patientsData = patients || [];
    assessmentsData = assessments || [];
    doctorsData = doctors || [];

    processAnalyticsData();
    renderKPIs();
    renderCharts();
    renderInsights();
    renderMonthlyTable();

    setText(
      "analyticsSubtitle",
      `Based on ${assessmentsData.length} assessment${
        assessmentsData.length !== 1 ? "s" : ""
      }`
    );
  } catch (error) {
    console.error("Error loading analytics:", error);
    setText(
      "analyticsSubtitle",
      "Error loading data. Please refresh."
    );
    showEmptyStates();
  } finally {
    showLoading(false);
  }
}

// ============================================
// PROCESS DATA
// ============================================
function processAnalyticsData() {
  assessmentsData.forEach((assessment) => {
    assessment.processedData = {
      patientName: `${assessment.first_name || ""} ${
        assessment.last_name || ""
      }`,
      patientAge: assessment.age || "?",
      patientGender: assessment.gender || "?",
      doctorName: assessment.full_name || "Unknown",
      date: assessment.created_at,
      cancerType: assessment.top_cancer_type || "None",
      probability: assessment.top_probability || 0,
      riskLevel: getRiskLevel(assessment.top_probability || 0),
      symptoms: assessment.symptoms || [],
      riskFactors: assessment.risk_factors || [],
    };
  });
}

function getRiskLevel(prob) {
  if (prob > 70) return "HIGH";
  if (prob > 40) return "MEDIUM";
  return "LOW";
}

// ============================================
// UI HELPERS
// ============================================
function showLoading(show) {
  const overlay = document.getElementById("loadingOverlay");
  if (!overlay) return;
  show ? overlay.classList.add("active") : overlay.classList.remove("active");
}

function showEmptyStates() {
  setText("topCancers", "No data available");
  setText("riskBreakdown", "No data available");
  setText("topDoctors", "No data available");
}

// ============================================
// KPI RENDER
// ============================================
function renderKPIs() {
  const total = assessmentsData.length;

  const detected = assessmentsData.filter(
    (a) => a.processedData.cancerType !== "None"
  ).length;

  const highRisk = assessmentsData.filter(
    (a) => a.processedData.riskLevel === "HIGH"
  ).length;

  const now = new Date();

  const thisMonth = assessmentsData.filter((a) => {
    const d = new Date(a.created_at);
    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).length;

  const activeDoctors = [
    ...new Set(assessmentsData.map((a) => a.doctor_id)),
  ].length;

  const rate =
    total > 0 ? ((detected / total) * 100).toFixed(1) : 0;

  setText("kpiTotal", total);
  setText("kpiDetected", detected);
  setText("kpiHighRisk", highRisk);
  setText("kpiThisMonth", thisMonth);
  setText("kpiDoctors", activeDoctors);
  setText("kpiRate", rate + "%");
}

// ============================================
// CHARTS
// ============================================
function renderCharts() {
  if (!assessmentsData || assessmentsData.length === 0) return;

  Object.values(charts).forEach((c) => c?.destroy());
  charts = {};

  // ===============================
  // 1. LINE CHART (trendChart) ✅
  // ===============================
  const trendCanvas = document.getElementById("trendChart");

  if (trendCanvas) {
    const labels = assessmentsData.map((a) =>
      new Date(a.created_at).toLocaleDateString()
    );

    const values = assessmentsData.map(
      (a) => a.processedData?.probability || 0
    );

    charts.trend = new Chart(trendCanvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Cancer Probability",
            data: values,
          },
        ],
      },
    });
  }

  // ===============================
  // 2. PIE CHART (distributionChart) ✅
  // ===============================
  const cancerCounts = {};

  assessmentsData.forEach((a) => {
    const type = a.processedData?.cancerType || "None";
    if (type !== "None") {
      cancerCounts[type] = (cancerCounts[type] || 0) + 1;
    }
  });

  const pieCanvas = document.getElementById("distributionChart");

  if (pieCanvas && Object.keys(cancerCounts).length > 0) {
    charts.pie = new Chart(pieCanvas, {
      type: "pie",
      data: {
        labels: Object.keys(cancerCounts),
        datasets: [
          {
            data: Object.values(cancerCounts),
          },
        ],
      },
    });
  }

  // ===============================
  // 3. RISK CHART (riskChart) ✅
  // ===============================
  const riskCounts = { HIGH: 0, MEDIUM: 0, LOW: 0 };

  assessmentsData.forEach((a) => {
    const level = a.processedData?.riskLevel;
    if (riskCounts[level] !== undefined) {
      riskCounts[level]++;
    }
  });

  const riskCanvas = document.getElementById("riskChart");

  if (riskCanvas) {
    charts.risk = new Chart(riskCanvas, {
      type: "doughnut",
      data: {
        labels: ["High", "Medium", "Low"],
        datasets: [
          {
            data: [
              riskCounts.HIGH,
              riskCounts.MEDIUM,
              riskCounts.LOW,
            ],
          },
        ],
      },
    });
  }

  // ===============================
  // 4. AGE DEMOGRAPHICS (ageChart) ✅
  // ===============================
  const ageGroups = {
    "0-20": 0,
    "21-40": 0,
    "41-60": 0,
    "60+": 0,
  };

  assessmentsData.forEach((a) => {
    const age = a.age || a.processedData?.patientAge;

    if (!age) return;

    if (age <= 20) ageGroups["0-20"]++;
    else if (age <= 40) ageGroups["21-40"]++;
    else if (age <= 60) ageGroups["41-60"]++;
    else ageGroups["60+"]++;
  });

  const ageCanvas = document.getElementById("ageChart");

  if (ageCanvas) {
    charts.age = new Chart(ageCanvas, {
      type: "bar",
      data: {
        labels: Object.keys(ageGroups),
        datasets: [
          {
            label: "Patients",
            data: Object.values(ageGroups),
          },
        ],
      },
    });
  }
}
// function renderCharts() {
//   if (assessmentsData.length === 0) return;

//   Object.values(charts).forEach((c) => c.destroy());
//   charts = {};

//   const labels = assessmentsData.map((a) =>
//     new Date(a.created_at).toLocaleDateString()
//   );

//   const values = assessmentsData.map(
//     (a) => a.processedData.probability
//   );

//   const canvas = document.getElementById("trendChart");
//   if (!canvas) return;

//   charts.trend = new Chart(canvas, {
//     type: "line",
//     data: {
//       labels,
//       datasets: [
//         {
//           label: "Cancer Probability",
//           data: values,
//           borderColor: "#0a5c2e",
//           fill: true,
//         },
//       ],
//     },
//   });
// }
window.setRange = function (range, btn) {
  // UI active button
  document.querySelectorAll(".range-btn").forEach((b) =>
    b.classList.remove("active")
  );
  if (btn) btn.classList.add("active");

  const now = new Date();
  let startDate;

  switch (range) {
    case "today":
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;

    case "week":
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
      break;

    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;

    case "quarter":
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;

    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;

    default:
      return;
  }

  applyDateFilter(startDate, new Date());
};
// ============================================
// PLACEHOLDERS
// ============================================
function renderInsights() {}
function renderMonthlyTable() {}
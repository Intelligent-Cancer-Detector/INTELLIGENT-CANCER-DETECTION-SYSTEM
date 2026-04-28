

// Global variables
let assessmentsData = [];
let patientsData = [];
let predictionsData = [];
let doctorsData = [];
let charts = {};
let currentHospitalId = null;

// Cancer types mapping
const CANCER_TYPES = {
  lung: "Lung Cancer",
  breast: "Breast Cancer",
  colorectal: "Colorectal Cancer",
  prostate: "Prostate Cancer",
  liver: "Liver Cancer",
  cervical: "Cervical Cancer",
  brain: "Brain Cancer",
  skin: "Skin Cancer",
  pancreatic: "Pancreatic Cancer",
  eye: "Eye Cancer",
};

// ============================================
// INITIALIZATION
// ============================================
window.onload = async function () {
  checkAuth();
  await loadUserData();
  setDefaultDates();
  await loadAnalyticsData();
};

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

  document.getElementById("hospitalName").textContent = hospital || "—";
  document.getElementById("doctorName").textContent = name || "—";
  document.getElementById("doctorEmail").textContent = email || "—";
  document.getElementById("userDisplayName").textContent = name || "—";
  document.getElementById("userRole").textContent = role;

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  document.getElementById("userAvatar").textContent = initials || "--";
}

function setDefaultDates() {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  document.getElementById("endDate").value = today.toISOString().split("T")[0];
  document.getElementById("startDate").value = firstOfMonth
    .toISOString()
    .split("T")[0];
}

// ============================================
// LOAD DATA FROM BACKEND
// ============================================
async function loadAnalyticsData() {
  if (!currentHospitalId) {
    console.error("No hospital ID found");
    document.getElementById("analyticsSubtitle").textContent =
      "Please log in again";
    return;
  }

  showLoading(true);

  try {
    // 1. Fetch patients
    const { data: patients, error: patientsError } = await supabase
      .from("patients")
      .select("*")
      .eq("hospital_id", currentHospitalId);

    if (patientsError) throw patientsError;
    patientsData = patients || [];

    // 2. Fetch assessments with predictions
    const { data: assessments, error: assessmentsError } = await supabase
      .from("assessments")
      .select(
        `
                id,
                patient_id,
                doctor_id,
                symptoms,
                risk_factors,
                status,
                created_at,
                patients (first_name, last_name, age, gender),
                predictions (
                    top_cancer_type,
                    top_probability,
                    lung_cancer_prob,
                    breast_cancer_prob,
                    colorectal_cancer_prob,
                    prostate_cancer_prob,
                    liver_cancer_prob,
                    cervical_cancer_prob,
                    brain_cancer_prob,
                    skin_cancer_prob,
                    pancreatic_cancer_prob,
                    eye_cancer_prob
                ),
                users (full_name)
            `,
      )
      .eq("hospital_id", currentHospitalId)
      .order("created_at", { ascending: false });

    if (assessmentsError) throw assessmentsError;
    assessmentsData = assessments || [];

    // 3. Fetch doctors
    const { data: doctors, error: doctorsError } = await supabase
      .from("users")
      .select("id, full_name, email")
      .eq("hospital_id", currentHospitalId)
      .eq("is_active", true);

    if (doctorsError) throw doctorsError;
    doctorsData = doctors || [];

    // 4. Process and render all analytics
    processAnalyticsData();
    renderKPIs();
    renderCharts();
    renderInsights();
    renderMonthlyTable();

    document.getElementById("analyticsSubtitle").textContent =
      `Based on ${assessmentsData.length} assessment${assessmentsData.length !== 1 ? "s" : ""}`;
  } catch (error) {
    console.error("Error loading analytics:", error);
    document.getElementById("analyticsSubtitle").textContent =
      "Error loading data. Please refresh.";
    showEmptyStates();
  } finally {
    showLoading(false);
  }
}

function processAnalyticsData() {
  // Process assessments to create unified data structure
  assessmentsData.forEach((assessment) => {
    const patient = assessment.patients;
    const prediction = assessment.predictions?.[0];
    const doctor = assessment.users;

    assessment.processedData = {
      id: assessment.id,
      patientName: patient
        ? `${patient.first_name} ${patient.last_name}`
        : "Unknown",
      patientAge: patient?.age || "?",
      patientGender: patient?.gender || "?",
      doctorName: doctor?.full_name || "Unknown",
      date: assessment.created_at,
      symptoms: assessment.symptoms || [],
      riskFactors: assessment.risk_factors || [],
      cancerType: prediction?.top_cancer_type || "None",
      probability: prediction?.top_probability || 0,
      riskLevel: getRiskLevel(prediction?.top_probability || 0),
    };
  });
}

function getRiskLevel(probability) {
  if (probability > 70) return "HIGH";
  if (probability > 40) return "MEDIUM";
  return "LOW";
}

function showEmptyStates() {
  const emptyMessage =
    '<div class="insight-empty"><i class="fas fa-chart-pie"></i><p>No data available</p></div>';
  document.getElementById("topCancers").innerHTML = emptyMessage;
  document.getElementById("riskBreakdown").innerHTML = emptyMessage;
  document.getElementById("topDoctors").innerHTML = emptyMessage;
  document.getElementById("monthlyTableBody").innerHTML =
    '<tr><td colspan="5" class="table-empty"><i class="fas fa-table"></i><p>No data available</p></td></tr>';
}

function showLoading(show) {
  const overlay = document.getElementById("loadingOverlay");
  if (show) overlay.classList.add("active");
  else overlay.classList.remove("active");
}

// ============================================
// RENDER FUNCTIONS
// ============================================
function renderKPIs() {
  const total = assessmentsData.length;
  const detected = assessmentsData.filter(
    (a) => a.processedData.cancerType !== "None",
  ).length;
  const highRisk = assessmentsData.filter(
    (a) => a.processedData.riskLevel === "HIGH",
  ).length;
  const now = new Date();
  const thisMonth = assessmentsData.filter((a) => {
    const d = new Date(a.created_at);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;
  const activeDoctors = [
    ...new Set(assessmentsData.map((a) => a.doctor_id).filter(Boolean)),
  ].length;
  const rate = total > 0 ? ((detected / total) * 100).toFixed(1) : 0;

  document.getElementById("kpiTotal").textContent = total;
  document.getElementById("kpiDetected").textContent = detected;
  document.getElementById("kpiHighRisk").textContent = highRisk;
  document.getElementById("kpiThisMonth").textContent = thisMonth;
  document.getElementById("kpiDoctors").textContent = activeDoctors;
  document.getElementById("kpiRate").textContent = rate + "%";

  document.getElementById("kpiTotalSub").textContent =
    total === 0 ? "No assessments yet" : `${thisMonth} added this month`;
  document.getElementById("kpiDetectedSub").textContent =
    `${rate}% detection rate`;
  document.getElementById("kpiHighRiskSub").textContent =
    total > 0
      ? `${((highRisk / total) * 100).toFixed(1)}% of total`
      : "0% of total";
  document.getElementById("kpiThisMonthSub").textContent =
    "Assessments this month";
  document.getElementById("kpiDoctorsSub").textContent =
    activeDoctors === 0
      ? "No doctors yet"
      : `${activeDoctors} doctor${activeDoctors !== 1 ? "s" : ""} active`;
}

function renderCharts() {
  if (assessmentsData.length === 0) {
    document.querySelectorAll(".chart-container").forEach((container) => {
      container.innerHTML =
        '<div class="no-chart-data"><i class="fas fa-chart-simple"></i><p>No data available yet</p><p style="font-size:11px;">Complete assessments to see analytics</p></div>';
    });
    return;
  }

  // Destroy existing charts
  Object.values(charts).forEach((c) => c.destroy());
  charts = {};

  // 1. Trend Chart
  const days = parseInt(document.getElementById("trendSelect")?.value || 30);
  const trendData = buildTrendData(days);
  charts.trend = new Chart(document.getElementById("trendChart"), {
    type: "line",
    data: {
      labels: trendData.labels,
      datasets: [
        {
          label: "Assessments",
          data: trendData.assessments,
          borderColor: "#0a5c2e",
          backgroundColor: "rgba(10,92,46,0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Cancers Detected",
          data: trendData.cancers,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239,68,68,0.08)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
    },
  });

  // 2. Distribution Chart
  const typeCounts = {};
  assessmentsData
    .filter((a) => a.processedData.cancerType !== "None")
    .forEach((a) => {
      typeCounts[a.processedData.cancerType] =
        (typeCounts[a.processedData.cancerType] || 0) + 1;
    });
  const typeLabels = Object.keys(typeCounts);
  const typeValues = Object.values(typeCounts);
  charts.dist = new Chart(document.getElementById("distributionChart"), {
    type: "doughnut",
    data: {
      labels: typeLabels.length > 0 ? typeLabels : ["No cancers detected"],
      datasets: [
        {
          data: typeValues.length > 0 ? typeValues : [1],
          backgroundColor: [
            "#ef4444",
            "#f59e0b",
            "#10b981",
            "#3b82f6",
            "#8b5cf6",
            "#6b7280",
            "#ec4899",
            "#14b8a6",
            "#f97316",
            "#06b6d4",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
    },
  });

  // 3. Risk Chart
  const high = assessmentsData.filter(
    (a) => a.processedData.riskLevel === "HIGH",
  ).length;
  const medium = assessmentsData.filter(
    (a) => a.processedData.riskLevel === "MEDIUM",
  ).length;
  const low = assessmentsData.filter(
    (a) => a.processedData.riskLevel === "LOW",
  ).length;
  charts.risk = new Chart(document.getElementById("riskChart"), {
    type: "bar",
    data: {
      labels: ["High Risk", "Medium Risk", "Low Risk"],
      datasets: [
        {
          label: "Patients",
          data: [high, medium, low],
          backgroundColor: ["#ef4444", "#f59e0b", "#10b981"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
    },
  });

  // 4. Age Chart
  const ageBuckets = {
    "0–18": 0,
    "19–30": 0,
    "31–45": 0,
    "46–60": 0,
    "60+": 0,
  };
  assessmentsData.forEach((a) => {
    const age = a.processedData.patientAge;
    if (age <= 18) ageBuckets["0–18"]++;
    else if (age <= 30) ageBuckets["19–30"]++;
    else if (age <= 45) ageBuckets["31–45"]++;
    else if (age <= 60) ageBuckets["46–60"]++;
    else if (age > 60) ageBuckets["60+"]++;
  });
  charts.age = new Chart(document.getElementById("ageChart"), {
    type: "pie",
    data: {
      labels: Object.keys(ageBuckets),
      datasets: [
        {
          data: Object.values(ageBuckets),
          backgroundColor: [
            "#3b82f6",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
    },
  });
}

function buildTrendData(days) {
  const labels = [],
    assessments = [],
    cancers = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const label = `${d.getDate()}/${d.getMonth() + 1}`;
    labels.push(label);
    const dayAssessments = assessmentsData.filter(
      (a) => new Date(a.created_at).toDateString() === d.toDateString(),
    );
    assessments.push(dayAssessments.length);
    cancers.push(
      dayAssessments.filter((a) => a.processedData.cancerType !== "None")
        .length,
    );
  }
  return { labels, assessments, cancers };
}

function updateTrendChart() {
  if (!charts.trend || assessmentsData.length === 0) return;
  const days = parseInt(document.getElementById("trendSelect").value);
  const data = buildTrendData(days);
  charts.trend.data.labels = data.labels;
  charts.trend.data.datasets[0].data = data.assessments;
  charts.trend.data.datasets[1].data = data.cancers;
  charts.trend.update();
}

function renderInsights() {
  // Top Cancer Types
  const typeCounts = {};
  assessmentsData
    .filter((a) => a.processedData.cancerType !== "None")
    .forEach((a) => {
      typeCounts[a.processedData.cancerType] =
        (typeCounts[a.processedData.cancerType] || 0) + 1;
    });
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  const total = assessmentsData.length;

  const cancerEl = document.getElementById("topCancers");
  if (sortedTypes.length === 0) {
    cancerEl.innerHTML =
      '<div class="insight-empty"><i class="fas fa-chart-pie"></i><p>No cancers detected yet</p></div>';
  } else {
    cancerEl.innerHTML = sortedTypes
      .slice(0, 5)
      .map(
        ([type, count]) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--gray-100);">
                <span style="color:var(--gray-600);font-size:13px;">${type}</span>
                <span style="font-weight:600;font-size:13px;">${count} case${count !== 1 ? "s" : ""}</span>
                <span style="background:rgba(10,92,46,0.1);color:var(--primary);padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;">${total > 0 ? ((count / total) * 100).toFixed(0) : 0}%</span>
            </div>`,
      )
      .join("");
  }

  // Risk Breakdown
  const high = assessmentsData.filter(
    (a) => a.processedData.riskLevel === "HIGH",
  ).length;
  const medium = assessmentsData.filter(
    (a) => a.processedData.riskLevel === "MEDIUM",
  ).length;
  const low = assessmentsData.filter(
    (a) => a.processedData.riskLevel === "LOW",
  ).length;
  const riskEl = document.getElementById("riskBreakdown");
  if (total === 0) {
    riskEl.innerHTML =
      '<div class="insight-empty"><i class="fas fa-shield-alt"></i><p>No data yet</p></div>';
  } else {
    riskEl.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--gray-100);">
                <span style="color:var(--gray-600);font-size:13px;">High Risk</span>
                <span style="font-weight:600;">${high}</span>
                <span style="background:rgba(239,68,68,0.1);color:var(--danger);padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;">${((high / total) * 100).toFixed(0)}%</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--gray-100);">
                <span style="color:var(--gray-600);font-size:13px;">Medium Risk</span>
                <span style="font-weight:600;">${medium}</span>
                <span style="background:rgba(245,158,11,0.1);color:var(--warning);padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;">${((medium / total) * 100).toFixed(0)}%</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;">
                <span style="color:var(--gray-600);font-size:13px;">Low Risk</span>
                <span style="font-weight:600;">${low}</span>
                <span style="background:rgba(16,185,129,0.1);color:var(--secondary);padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;">${((low / total) * 100).toFixed(0)}%</span>
            </div>`;
  }

  // Top Doctors
  const docCounts = {};
  assessmentsData.forEach((a) => {
    if (a.processedData.doctorName) {
      docCounts[a.processedData.doctorName] =
        (docCounts[a.processedData.doctorName] || 0) + 1;
    }
  });
  const sortedDocs = Object.entries(docCounts).sort((a, b) => b[1] - a[1]);
  const docEl = document.getElementById("topDoctors");
  if (sortedDocs.length === 0) {
    docEl.innerHTML =
      '<div class="insight-empty"><i class="fas fa-user-md"></i><p>No data yet</p></div>';
  } else {
    docEl.innerHTML = sortedDocs
      .slice(0, 5)
      .map(
        ([doc, count]) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--gray-100);">
                <span style="color:var(--gray-600);font-size:13px;">${doc}</span>
                <span style="font-weight:600;font-size:13px;">${count} case${count !== 1 ? "s" : ""}</span>
            </div>`,
      )
      .join("");
  }
}

function renderMonthlyTable() {
  const tbody = document.getElementById("monthlyTableBody");
  if (assessmentsData.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="table-empty"><i class="fas fa-table"></i><p>No data available</p></td></tr>';
    return;
  }

  const monthMap = {};
  assessmentsData.forEach((a) => {
    const d = new Date(a.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap[key])
      monthMap[key] = { assessments: 0, cancers: 0, highRisk: 0 };
    monthMap[key].assessments++;
    if (a.processedData.cancerType !== "None") monthMap[key].cancers++;
    if (a.processedData.riskLevel === "HIGH") monthMap[key].highRisk++;
  });

  const sorted = Object.entries(monthMap).sort((a, b) =>
    b[0].localeCompare(a[0]),
  );
  tbody.innerHTML = sorted
    .map(([key, data]) => {
      const [year, month] = key.split("-");
      const label = new Date(
        parseInt(year),
        parseInt(month) - 1,
        1,
      ).toLocaleDateString("en-KE", { month: "long", year: "numeric" });
      const rate =
        data.assessments > 0
          ? ((data.cancers / data.assessments) * 100).toFixed(1)
          : 0;
      return `<tr><td>${label}</td><td>${data.assessments}</td><td>${data.cancers}</td><td>${data.highRisk}</td><td>${rate}%</td></tr>`;
    })
    .join("");
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function setRange(range, btn) {
  document
    .querySelectorAll(".range-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  const today = new Date();
  let start = new Date(today);
  switch (range) {
    case "today":
      break;
    case "week":
      start.setDate(today.getDate() - 7);
      break;
    case "month":
      start.setMonth(today.getMonth() - 1);
      break;
    case "quarter":
      start.setMonth(today.getMonth() - 3);
      break;
    case "year":
      start.setFullYear(today.getFullYear() - 1);
      break;
  }
  document.getElementById("startDate").value = start
    .toISOString()
    .split("T")[0];
  document.getElementById("endDate").value = today.toISOString().split("T")[0];
}

function exportAnalytics() {
  if (assessmentsData.length === 0) {
    alert("No data to export yet.");
    return;
  }

  const headers = [
    "Patient Name",
    "Age",
    "Gender",
    "Doctor",
    "Cancer Type",
    "Probability",
    "Risk Level",
    "Symptoms",
    "Risk Factors",
    "Date",
  ];
  const rows = assessmentsData.map((a) => {
    const p = a.processedData;
    return [
      p.patientName,
      p.patientAge,
      p.patientGender,
      p.doctorName,
      p.cancerType,
      p.probability + "%",
      p.riskLevel,
      p.symptoms.join(", "),
      p.riskFactors.join(", "),
      new Date(a.created_at).toLocaleDateString(),
    ];
  });

  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${v || ""}"`).join(","))
    .join("\n");
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
    download: `icds_analytics_${new Date().toISOString().split("T")[0]}.csv`,
  });
  a.click();
}

function exportCSV() {
  exportAnalytics();
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("collapsed");
  document.getElementById("mainContent").classList.toggle("expanded");
}

function logout() {
  [
    "icds_logged_in",
    "icds_user_id",
    "icds_user_email",
    "icds_user_name",
    "icds_hospital",
    "icds_hospital_id",
    "icds_user_role",
    "icds_department",
  ].forEach((k) => localStorage.removeItem(k));
  window.location.href = "login.html";
}

window.addEventListener("resize", () => {
  if (window.innerWidth <= 768) {
    document.getElementById("sidebar").classList.remove("collapsed");
    document.getElementById("mainContent").classList.remove("expanded");
  }
  Object.values(charts).forEach((c) => c?.resize());
});

window.toggleSidebar = toggleSidebar;

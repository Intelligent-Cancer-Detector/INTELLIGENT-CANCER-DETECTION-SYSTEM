import { API_PATHS } from "../utils/apiPaths.js";
import api from "../utils/axiosInstance.js";

// Global variables
let allAssessments = [];
let filteredAssessments = [];
let trendChartObj = null;
let distChartObj = null;
let currentHospitalId = null;
const ROWS_PER_PAGE = 10;
let currentPage = 1;

window.onload = async function () {
  checkAuth();
  await loadUserData();
  await loadAssessments();
};

function checkAuth() {
  if (localStorage.getItem("icds_logged_in") !== "true") {
    window.location.href = "login.html";
  }
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

async function loadAssessments() {
  if (!currentHospitalId) {
    console.log("No hospital ID found");
    return;
  }

  try {
    const res = await api.get(
      API_PATHS.PATIENT_HISTORY_DATA.PATIENT_ASSESSMENT(currentHospitalId),
    );
    const result = res.data;
    if (result.status !== "success") {
      throw new Error("Backend error!");
    }
    const assessments = result.data;

    // Process assessments into display format
    allAssessments = assessments.map((assessment) => {
      const patient = {
        full_name: assessment.patient_name,
        age: assessment.age,
        contact: assessment.contact,
        gender:assessment.gender,
        id:assessment.id
      };
      const doctor = assessment.doctors_name;
      let symptomsArray = [];

      if (assessment.symptoms_json) {
        try {
          const parsed = JSON.parse(assessment.symptoms_json);

          // Convert object keys → array
          symptomsArray = Object.keys(parsed);
        } catch (e) {
          console.warn("Invalid JSON:", assessment.symptoms_json);
        }
      }
      // const prediction = assessment.predictions?.[0];

      return {
        id: assessment.id,
        patientId: patient?.id,
        patientName: patient ? patient.full_name : "Unknown",
        age: patient.age || "?",
        gender: patient?.gender || "?",
        contact: patient?.contact || "—",
        symptoms:
          symptomsArray.slice(0, 3).join(", ") +
            (symptomsArray.length > 3 ? "..." : "") || "No symptoms",
        riskLevel: assessment.risk_level || "Unknown",
        cancerType: assessment.cancer_type || "None",
        probability: assessment.confidence
          ? `${assessment.confidence * 100}%`
          : "—",
        doctor: doctor || "Unknown",
        date: assessment.created_at,
        // notes: assessment.notes || "No additional notes",
        // status: assessment.status || "Completed",
      };
    });

    filteredAssessments = [...allAssessments];
    currentPage = 1;

    populateDoctorFilter();
    updateStats();
    renderTable();
    renderCharts();

    document.getElementById("recordCount").textContent =
      allAssessments.length === 0
        ? "No records yet — start by creating an assessment"
        : `Total of ${allAssessments.length} assessment${allAssessments.length !== 1 ? "s" : ""}`;
  } catch (error) {
    console.error("Error loading assessments:", error);
    document.getElementById("tableBody").innerHTML = `
                <tr><td colspan="10" class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading assessments. Please refresh.</p>
                </td></tr>
            `;
  }
}

function getRiskLevel(probability) {
  if (probability > 70) return "HIGH";
  if (probability > 40) return "MEDIUM";
  return "LOW";
}

function populateDoctorFilter() {
  const select = document.getElementById("doctorFilter");
  const current = select.value;

  while (select.options.length > 1) select.remove(1);

  const doctors = [
    ...new Set(allAssessments.map((a) => a.doctor).filter(Boolean)),
  ];
  doctors.forEach((doc) => {
    const opt = document.createElement("option");
    opt.value = doc;
    opt.textContent = doc;
    select.appendChild(opt);
  });
  select.value = current;
}

function updateStats() {
  const total = allAssessments.length;
  const high = allAssessments.filter((a) => a.riskLevel === "HIGH").length;
  const detected = allAssessments.filter((a) => a.cancerType !== "None").length;
  const now = new Date();
  const thisMonth = allAssessments.filter((a) => {
    const d = new Date(a.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statHighRisk").textContent = high;
  document.getElementById("statDetected").textContent = detected;
  document.getElementById("statThisMonth").textContent = thisMonth;
}

function renderTable() {
  const tbody = document.getElementById("tableBody");

  if (filteredAssessments.length === 0) {
    tbody.innerHTML = `
                <tr><td colspan="10" class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>No patient records yet</h3>
                    <p>Complete your first assessment and it will appear here automatically.</p>
                    <button class="btn btn-primary" onclick="window.location.href='assessment.html'">
                        <i class="fas fa-plus-circle"></i> New Assessment
                    </button>
                 </td></tr>
            `;
    document.getElementById("paginationArea").style.display = "none";
    return;
  }

  const totalPages = Math.ceil(filteredAssessments.length / ROWS_PER_PAGE);
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * ROWS_PER_PAGE;
  const slice = filteredAssessments.slice(start, start + ROWS_PER_PAGE);

  document.getElementById("paginationArea").style.display = "flex";
  document.getElementById("pageInfo").textContent =
    `Showing ${start + 1}–${Math.min(start + ROWS_PER_PAGE, filteredAssessments.length)} of ${filteredAssessments.length} records`;

  renderPageButtons(totalPages);

  tbody.innerHTML = slice
    .map((a) => {
      const initials = a.patientName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
      const riskClass =
        a.riskLevel === "HIGH"
          ? "risk-high"
          : a.riskLevel === "MEDIUM"
            ? "risk-medium"
            : "risk-low";
      const date = new Date(a.date).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      return `
                <tr>
                    <td>
                        <div class="patient-info">
                            <div class="patient-avatar">${initials}</div>
                            <div>
                                <div class="patient-name">${a.patientName}</div>
                                <div class="patient-id">${a.patientId ? a.patientId.substring(0, 8) : "—"}</div>
                            </div>
                        </div>
                    </td>
                    <td>${a.age} / ${a.gender === "male" ? "M" : a.gender === "female" ? "F" : a.gender || "?"}</td>
                    <td>${a.contact}</td>
                    <td>${a.symptoms}</td>
                    <td><span class="risk-badge ${riskClass}">${a.riskLevel}</span></td>
                    <td>${a.cancerType}</td>
                    <td>${a.probability}</td>
                    <td>${a.doctor}</td>
                    <td>${date}</td>
                    <td>
                        <button class="action-btn" title="View Details" onclick="viewAssessment('${a.id}')"><i class="fas fa-eye"></i></button>
                        <button class="action-btn" title="Print" onclick="window.print()"><i class="fas fa-print"></i></button>
                     </td>
                </tr>
            `;
    })
    .join("");
}

function renderPageButtons(totalPages) {
  const container = document.getElementById("pageButtons");
  container.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = "page-btn" + (i === currentPage ? " active" : "");
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      renderTable();
    };
    container.appendChild(btn);
  }
}

function applyFilters() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const risk = document.getElementById("riskFilter").value;
  const cancer = document.getElementById("cancerFilter").value;
  const doctor = document.getElementById("doctorFilter").value;

  filteredAssessments = allAssessments.filter((a) => {
    const matchSearch =
      !search ||
      a.patientName.toLowerCase().includes(search) ||
      (a.symptoms && a.symptoms.toLowerCase().includes(search));
    const matchRisk = risk === "all" || a.riskLevel === risk;
    const matchCancer = cancer === "all" || a.cancerType === cancer;
    const matchDoctor = doctor === "all" || a.doctor === doctor;
    return matchSearch && matchRisk && matchCancer && matchDoctor;
  });

  currentPage = 1;
  renderTable();
}

function resetFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("riskFilter").value = "all";
  document.getElementById("cancerFilter").value = "all";
  document.getElementById("doctorFilter").value = "all";
  filteredAssessments = [...allAssessments];
  currentPage = 1;
  renderTable();
}

async function viewAssessment(assessmentId) {
  const assessment = allAssessments.find((a) => a.id === assessmentId);
  if (!assessment) return;

  const riskClass =
    assessment.riskLevel === "HIGH"
      ? "risk-high"
      : assessment.riskLevel === "MEDIUM"
        ? "risk-medium"
        : "risk-low";
  const date = new Date(assessment.date).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  document.getElementById("modalPatientName").textContent =
    assessment.patientName;
  document.getElementById("patientDetails").innerHTML = `
            <div class="detail-item"><div class="detail-label">Patient ID</div><div class="detail-value">${assessment.patientId || "—"}</div></div>
            <div class="detail-item"><div class="detail-label">Demographics</div><div class="detail-value">${assessment.age} years, ${assessment.gender === "male" ? "Male" : assessment.gender === "female" ? "Female" : assessment.gender || "Not specified"}</div></div>
            <div class="detail-item"><div class="detail-label">Contact</div><div class="detail-value">${assessment.contact}</div></div>
            <div class="detail-item"><div class="detail-label">Symptoms</div><div class="detail-value">${assessment.symptoms}</div></div>
            <div class="detail-item"><div class="detail-label">Risk Assessment</div><div class="detail-value"><span class="risk-badge ${riskClass}">${assessment.riskLevel} RISK</span> &nbsp; ${assessment.cancerType} (${assessment.probability})</div></div>
            <div class="detail-item"><div class="detail-label">Attending Doctor</div><div class="detail-value">${assessment.doctor}</div></div>
            <div class="detail-item"><div class="detail-label">Assessment Date</div><div class="detail-value">${date}</div></div>
            <div class="detail-item"><div class="detail-label">Clinical Notes</div><div class="detail-value">${assessment.notes}</div></div>
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="window.location.href='assessment.html'"><i class="fas fa-edit"></i> New Assessment</button>
                <button class="btn btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
            </div>
        `;
  document.getElementById("patientModal").classList.add("active");
}

function closeModal() {
  document.getElementById("patientModal").classList.remove("active");
}

function renderCharts() {
  if (allAssessments.length === 0) return;

  // Trend chart
  const tc = document.getElementById("trendContainer");
  tc.innerHTML = '<canvas id="trendChart"></canvas>';
  const days = parseInt(document.getElementById("trendRange").value) || 30;
  const td = buildTrendData(days);

  if (trendChartObj) trendChartObj.destroy();
  trendChartObj = new Chart(
    document.getElementById("trendChart").getContext("2d"),
    {
      type: "line",
      data: {
        labels: td.labels,
        datasets: [
          {
            label: "Assessments",
            data: td.values,
            borderColor: "#0a5c2e",
            backgroundColor: "rgba(10,92,46,0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false },
    },
  );

  // Distribution chart
  const dc = document.getElementById("distContainer");
  dc.innerHTML = '<canvas id="distChart"></canvas>';
  const high = allAssessments.filter((a) => a.riskLevel === "HIGH").length;
  const medium = allAssessments.filter((a) => a.riskLevel === "MEDIUM").length;
  const low = allAssessments.filter((a) => a.riskLevel === "LOW").length;

  if (distChartObj) distChartObj.destroy();
  distChartObj = new Chart(
    document.getElementById("distChart").getContext("2d"),
    {
      type: "pie",
      data: {
        labels: ["High Risk", "Medium Risk", "Low Risk"],
        datasets: [
          {
            data: [high, medium, low],
            backgroundColor: ["#ef4444", "#f59e0b", "#10b981"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
      },
    },
  );
}

function buildTrendData(days) {
  const labels = [],
    values = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
    values.push(
      allAssessments.filter((a) => {
        const ad = new Date(a.date);
        return ad.toDateString() === d.toDateString();
      }).length,
    );
  }
  return { labels, values };
}

function updateTrendChart() {
  if (allAssessments.length === 0) return;
  const days = parseInt(document.getElementById("trendRange").value);
  const td = buildTrendData(days);
  if (trendChartObj) {
    trendChartObj.data.labels = td.labels;
    trendChartObj.data.datasets[0].data = td.values;
    trendChartObj.update();
  }
}

function downloadCSV() {
  if (allAssessments.length === 0) {
    alert("No patient data to export.");
    return;
  }

  const headers = [
    "Patient Name",
    "Age",
    "Gender",
    "Contact",
    "Symptoms",
    "Risk Level",
    "Cancer Type",
    "Probability",
    "Doctor",
    "Date",
    "Notes",
  ];
  const rows = allAssessments.map((a) => [
    a.patientName,
    a.age,
    a.gender,
    a.contact,
    a.symptoms,
    a.riskLevel,
    a.cancerType,
    a.probability,
    a.doctor,
    new Date(a.date).toLocaleDateString(),
    a.notes,
  ]);

  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${v || ""}"`).join(","))
    .join("\n");
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
    download: `icds_patient_history_${new Date().toISOString().split("T")[0]}.csv`,
  });
  a.click();
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

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "f") {
    e.preventDefault();
    document.getElementById("searchInput").focus();
  }
  if (e.ctrlKey && e.key === "n") {
    e.preventDefault();
    window.location.href = "assessment.html";
  }
  if (e.key === "Escape") closeModal();
});

window.addEventListener("resize", () => {
  if (window.innerWidth <= 768) {
    document.getElementById("sidebar").classList.remove("collapsed");
    document.getElementById("mainContent").classList.remove("expanded");
  }
});

window.toggleSidebar = toggleSidebar;
window.loadAssessments = loadAssessments;

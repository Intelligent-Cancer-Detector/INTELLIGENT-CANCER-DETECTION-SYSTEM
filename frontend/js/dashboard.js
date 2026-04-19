// ====================================
// SUPABASE CONFIGURATION
// ====================================

const SUPABASE_URL = "https://tgrrmzusqjzzvhevmmbt.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRncnJtenVzcWp6enZoZXZtbWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyOTg4NDUsImV4cCI6MjA5MDg3NDg0NX0.nmD117ohEA-pMV4YnNluPxJGT4N-HFJxPaRRyGFyyks";

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables
let cancerChart = null;
let riskChart = null;
let currentHospitalId = null;

// Load dashboard data on page load
window.onload = async function () {
  checkAuth();
  await loadUserData();
  await loadDashboardData();
  await loadRecentAssessments();
  await loadAlerts();
};

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
  const hospitalId = localStorage.getItem("icds_hospital_id");
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
  const hospitalId = localStorage.getItem("icds_hospital_id");

  if (!hospitalId) {
    console.log("No hospital ID found");
    return;
  }

  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch assessments for this hospital
    const { data: assessments, error: assessmentsError } = await supabase
      .from("assessments")
      .select(
        `
                        id,
                        status,
                        created_at,
                        predictions (
                            top_cancer_type,
                            top_probability
                        )
                    `,
      )
      .eq("hospital_id", hospitalId);

    if (assessmentsError) throw assessmentsError;

    // Count assessments today
    const todayAssessments =
      assessments?.filter((a) => {
        const date = new Date(a.created_at);
        return date >= today && date < tomorrow;
      }).length || 0;

    // Count high risk cases (probability > 70%)
    const highRisk =
      assessments?.filter(
        (a) => a.predictions && a.predictions.top_probability > 70,
      ).length || 0;

    // Count cancers detected (completed assessments with predictions)
    const cancersDetected =
      assessments?.filter((a) => a.status === "completed" && a.predictions)
        .length || 0;

    // Count active doctors
    const { data: doctors, error: doctorsError } = await supabase
      .from("users")
      .select("id", { count: "exact" })
      .eq("hospital_id", hospitalId)
      .eq("is_active", true)
      .in("role", ["doctor", "super_admin", "admin"]);

    if (doctorsError) throw doctorsError;

    // Update stats display
    document.getElementById("assessmentsToday").textContent = todayAssessments;
    document.getElementById("highRiskCases").textContent = highRisk;
    document.getElementById("cancerDetected").textContent = cancersDetected;
    document.getElementById("activeDoctors").textContent = doctors?.length || 0;

    // Load charts
    await loadCancerChart(assessments);
    await loadRiskChart(assessments);
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
    if (assessment.predictions && assessment.predictions.top_cancer_type) {
      const cancerType = assessment.predictions.top_cancer_type;
      if (cancerCounts[cancerType] !== undefined) {
        cancerCounts[cancerType]++;
      }
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
    if (assessment.predictions && assessment.predictions.top_probability) {
      const prob = assessment.predictions.top_probability;
      if (prob > 70) highRisk++;
      else if (prob > 40) mediumRisk++;
      else lowRisk++;
    }
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
  const hospitalId = localStorage.getItem("icds_hospital_id");
  const tbody = document.getElementById("assessmentsTableBody");

  if (!hospitalId) {
    tbody.innerHTML = `
                    <tr><td colspan="8" class="empty-table">
                        <i class="fas fa-hospital"></i>
                        <p>No hospital associated with your account</p>
                    </td></tr>
                `;
    return;
  }

  try {
    const { data: assessments, error } = await supabase
      .from("assessments")
      .select(
        `
                        id,
                        status,
                        symptoms,
                        risk_factors,
                        created_at,
                        patients (
                            first_name,
                            last_name,
                            age,
                            gender
                        ),
                        users (
                            full_name
                        ),
                        predictions (
                            top_cancer_type,
                            top_probability
                        )
                    `,
      )
      .eq("hospital_id", hospitalId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!assessments || assessments.length === 0) {
      tbody.innerHTML = `
                        <tr><td colspan="8" class="empty-table">
                            <i class="fas fa-folder-open"></i>
                            <p>No assessments found</p>
                            <p style="font-size: 12px;">Create your first patient assessment to see data here</p>
                            <button class="quick-action-btn" onclick="newAssessment()" style="margin-top: 15px; background: var(--primary); color: white;">
                                <i class="fas fa-plus-circle"></i> New Assessment
                            </button>
                        </td></tr>
                    `;
      return;
    }

    tbody.innerHTML = assessments
      .map((assessment) => {
        const patient = assessment.patients;
        const doctor = assessment.users;
        const prediction = assessment.predictions;
        const createdDate = new Date(
          assessment.created_at,
        ).toLocaleDateString();

        const riskLevel =
          prediction?.top_probability > 70
            ? "High"
            : prediction?.top_probability > 40
              ? "Medium"
              : "Low";
        const riskClass =
          riskLevel === "High"
            ? "risk-high"
            : riskLevel === "Medium"
              ? "risk-medium"
              : "risk-low";

        const symptomsList =
          assessment.symptoms?.slice(0, 2).join(", ") || "No symptoms";
        const symptomsDisplay =
          symptomsList + (assessment.symptoms?.length > 2 ? "..." : "");

        return `
                        <tr>
                            <td>${patient?.first_name || "Unknown"} ${patient?.last_name || ""}</td>
                            <td>${patient?.age || "?"}/${patient?.gender || "?"}</td>
                            <td>${symptomsDisplay}</td>
                            <td class="${riskClass}">${riskLevel}</td>
                            <td>${prediction?.top_cancer_type || "Pending"}</td>
                            <td>${doctor?.full_name || "Unknown"}</td>
                            <td>${createdDate}</td>
                            <td>
                                <button class="quick-action-btn" onclick="viewAssessment('${assessment.id}')" style="padding: 5px 10px; font-size: 12px;">
                                    <i class="fas fa-eye"></i> View
                                </button>
                            </td>
                        </tr>
                    `;
      })
      .join("");
  } catch (error) {
    console.error("Error loading assessments:", error);
    tbody.innerHTML = `
                    <tr><td colspan="8" class="empty-table">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Error loading assessments</p>
                        <p style="font-size: 12px;">Please refresh the page</p>
                    </td></tr>
                `;
  }
}

// Load alerts
async function loadAlerts() {
  const hospitalId = localStorage.getItem("icds_hospital_id");

  if (!hospitalId) return;

  try {
    // Get high risk assessments from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: highRiskAssessments, error } = await supabase
      .from("assessments")
      .select(
        `
                        id,
                        created_at,
                        patients (first_name, last_name),
                        predictions (top_probability, top_cancer_type)
                    `,
      )
      .eq("hospital_id", hospitalId)
      .gte("created_at", sevenDaysAgo.toISOString());

    if (error) throw error;

    const urgentAlerts =
      highRiskAssessments?.filter(
        (a) => a.predictions && a.predictions.top_probability > 70,
      ) || [];

    const alertsContainer = document.getElementById("urgentAlertsContainer");

    if (urgentAlerts.length === 0) {
      alertsContainer.innerHTML = `
                        <div class="empty-alert">
                            <i class="fas fa-check-circle" style="color: var(--success);"></i>
                            <p>No urgent alerts</p>
                            <p style="font-size: 12px;">All clear</p>
                        </div>
                    `;
    } else {
      alertsContainer.innerHTML = urgentAlerts
        .slice(0, 5)
        .map((alert) => {
          const patientName = alert.patients
            ? `${alert.patients.first_name} ${alert.patients.last_name}`
            : "Unknown";
          const date = new Date(alert.created_at).toLocaleDateString();
          return `
                            <div class="alert-item danger">
                                <i class="fas fa-exclamation-triangle"></i>
                                <div class="alert-content">
                                    <div class="alert-title">High Risk: ${alert.predictions.top_cancer_type}</div>
                                    <div>Patient: ${patientName} (${alert.predictions.top_probability}% probability)</div>
                                    <div class="alert-time">${date}</div>
                                </div>
                            </div>
                        `;
        })
        .join("");
    }

    // Update notification badge
    document.getElementById("notificationBadge").textContent =
      urgentAlerts.length;
    document.getElementById("notificationBadge").style.display =
      urgentAlerts.length > 0 ? "inline-block" : "none";
  } catch (error) {
    console.error("Error loading alerts:", error);
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

console.log("ICDS Dashboard - Connected to Supabase Database");

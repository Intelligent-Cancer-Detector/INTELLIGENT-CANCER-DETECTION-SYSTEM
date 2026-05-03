/* ============================================
   HOSPITAL PROFILE - FRONTEND READY FOR API
   ============================================ */

// Import API utilities (when backend is ready)
// import api from "../utils/axiosInstance.js";
// import { API_PATHS } from "../utils/apiPaths.js";

let currentHospitalId = null;
let editing = false;

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", function () {
  console.log("Initializing Hospital Profile...");

  loadUserData();
  loadHospitalProfile();
  loadStaffList();
  loadDepartments();
  loadStats();
  setupEventListeners();
  setupEditMode();
  updateClock();
  loadDepartmentsIntoSelect();
});

// ===== LOAD USER DATA FROM LOCALSTORAGE =====
function loadUserData() {
  currentHospitalId = localStorage.getItem("icds_hospital_id");
  const userName = localStorage.getItem("icds_user_name") || "Medical Staff";
  const userEmail =
    localStorage.getItem("icds_user_email") || "staff@hospital.com";
  const hospitalName = localStorage.getItem("icds_hospital") || "City Hospital";

  document.getElementById("displayDoctorName").textContent = userName;
  document.getElementById("displayDoctorEmail").textContent = userEmail;
  document.getElementById("displayHospitalName").textContent = hospitalName;
  document.getElementById("dbDoctorName").textContent = userName;
}

// ===== LOAD HOSPITAL PROFILE (API Ready) =====
async function loadHospitalProfile() {
  // TODO: Uncomment when backend is ready
  /*
  try {
    const response = await api.get(API_PATHS.HOSPITAL.GET_HOSPITAL(currentHospitalId));
    const data = response.data;
    
    document.getElementById("hospitalName").value = data.name || "";
    document.getElementById("hospitalEmail").value = data.email || "";
    document.getElementById("phone").value = data.phone || "";
    document.getElementById("location").value = data.location || "";
    document.getElementById("description").value = data.description || "";
    
    if (data.logo_url) {
      document.getElementById("hospitalLogo").src = data.logo_url;
      document.getElementById("sidebarLogo").src = data.logo_url;
      document.getElementById("headerLogo").src = data.logo_url;
    }
  } catch (error) {
    console.error("Error loading hospital profile:", error);
  }
  */

  // Temporary placeholder - remove when API is ready
  console.log("Waiting for API connection...");
}

// ===== LOAD STAFF LIST (API Ready) =====
async function loadStaffList() {
  const container = document.getElementById("usersList");

  // TODO: Uncomment when backend is ready
  /*
  try {
    const response = await api.get(API_PATHS.HOSPITAL.GET_STAFF(currentHospitalId));
    const staff = response.data;
    
    if (!staff || staff.length === 0) {
      container.innerHTML = `<div class="empty-state"><i class="fas fa-user-plus"></i><p>No staff found. Click "Add User" to get started.</p></div>`;
      return;
    }
    
    container.innerHTML = staff.map(member => `
      <div class="user-item" data-id="${member.id}">
        <div class="user-info">
          <h4><i class="fas fa-user-md"></i> ${escapeHtml(member.name)}</h4>
          <p>${escapeHtml(member.email)} | ${escapeHtml(member.position)}</p>
        </div>
        <div class="user-actions">
          <button onclick="deleteStaff(${member.id})"><i class="fas fa-trash-alt"></i></button>
        </div>
      </div>
    `).join("");
    
  } catch (error) {
    console.error("Error loading staff:", error);
    container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error loading staff. Please try again.</p></div>`;
  }
  */

  // Temporary placeholder
  container.innerHTML = `<div class="empty-state"><i class="fas fa-user-plus"></i><p>No staff found. Click "Add User" to get started.</p></div>`;
}

// ===== LOAD DEPARTMENTS (API Ready) =====
async function loadDepartments() {
  const container = document.getElementById("deptList");

  // TODO: Uncomment when backend is ready
  /*
  try {
    const response = await api.get(API_PATHS.HOSPITAL.GET_DEPARTMENTS(currentHospitalId));
    const departments = response.data;
    
    if (!departments || departments.length === 0) {
      container.innerHTML = `<div class="empty-state"><i class="fas fa-building"></i><p>No departments found. Click "Add Department" to get started.</p></div>`;
      return;
    }
    
    container.innerHTML = departments.map(dept => `
      <div class="dept-item" data-id="${dept.id}">
        <div class="dept-info">
          <h4><i class="fas fa-hospital-user"></i> ${escapeHtml(dept.name)}</h4>
          <p>Head: ${escapeHtml(dept.head || 'Not assigned')}</p>
          <p>${escapeHtml(dept.description || '')}</p>
        </div>
        <div class="dept-actions">
          <button onclick="deleteDepartment(${dept.id})"><i class="fas fa-trash-alt"></i></button>
        </div>
      </div>
    `).join("");
    
  } catch (error) {
    console.error("Error loading departments:", error);
    container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error loading departments. Please try again.</p></div>`;
  }
  */

  // Temporary placeholder
  container.innerHTML = `<div class="empty-state"><i class="fas fa-building"></i><p>No departments found. Click "Add Department" to get started.</p></div>`;
}

// ===== LOAD DEPARTMENTS INTO SELECT DROPDOWN =====
async function loadDepartmentsIntoSelect() {
  const deptSelect = document.getElementById("staffDepartment");

  // TODO: Uncomment when backend is ready
  /*
  try {
    const response = await api.get(API_PATHS.HOSPITAL.GET_DEPARTMENTS(currentHospitalId));
    const departments = response.data;
    
    deptSelect.innerHTML = '<option value="">Select Department</option>';
    departments.forEach(dept => {
      deptSelect.innerHTML += `<option value="${dept.id}">${escapeHtml(dept.name)}</option>`;
    });
  } catch (error) {
    console.error("Error loading departments for select:", error);
  }
  */
}

// ===== LOAD STATISTICS (API Ready) =====
async function loadStats() {
  // TODO: Uncomment when backend is ready
  /*
  try {
    const response = await api.get(API_PATHS.HOSPITAL.GET_STATS(currentHospitalId));
    const stats = response.data;
    
    document.getElementById("totalStaff").textContent = stats.totalStaff || "0";
    document.getElementById("totalDepts").textContent = stats.totalDepartments || "0";
    document.getElementById("totalAssessments").textContent = stats.totalAssessments || "0";
  } catch (error) {
    console.error("Error loading stats:", error);
  }
  */
}

// ===== SAVE HOSPITAL PROFILE (API Ready) =====
async function saveHospitalProfile() {
  const updateData = {
    name: document.getElementById("hospitalName").value,
    email: document.getElementById("hospitalEmail").value,
    phone: document.getElementById("phone").value,
    location: document.getElementById("location").value,
    description: document.getElementById("description").value,
  };

  // TODO: Uncomment when backend is ready
  /*
  try {
    await api.put(API_PATHS.HOSPITAL.UPDATE_HOSPITAL(currentHospitalId), updateData);
    
    // Update localStorage
    localStorage.setItem("icds_hospital", updateData.name);
    document.getElementById("displayHospitalName").textContent = updateData.name;
    
    // Handle logo upload if exists
    if (currentLogoFile) {
      const formData = new FormData();
      formData.append("logo", currentLogoFile);
      await api.post(API_PATHS.HOSPITAL.UPLOAD_LOGO(currentHospitalId), formData);
      currentLogoFile = null;
    }
    
    showSuccess("Profile updated successfully!");
    return true;
  } catch (error) {
    console.error("Error saving profile:", error);
    showError("Failed to update profile");
    return false;
  }
  */

  // Temporary for frontend testing
  console.log("Save profile data:", updateData);
  localStorage.setItem("icds_hospital", updateData.name);
  document.getElementById("displayHospitalName").textContent = updateData.name;
  showSuccess("Profile updated successfully! (API will be connected soon)");
  return true;
}

// ===== ADD NEW STAFF (API Ready) =====
async function addStaff(staffData) {
  // TODO: Uncomment when backend is ready
  /*
  try {
    await api.post(API_PATHS.HOSPITAL.ADD_STAFF(currentHospitalId), staffData);
    showSuccess(`Staff ${staffData.name} added successfully!`);
    await loadStaffList();
    await loadStats();
    return true;
  } catch (error) {
    console.error("Error adding staff:", error);
    showError("Failed to add staff");
    return false;
  }
  */

  // Temporary for frontend testing
  console.log("Add staff data:", staffData);
  showSuccess(
    `Staff ${staffData.name} added successfully! (API will be connected soon)`,
  );
  return true;
}

// ===== ADD NEW DEPARTMENT (API Ready) =====
async function addDepartment(deptData) {
  // TODO: Uncomment when backend is ready
  /*
  try {
    await api.post(API_PATHS.HOSPITAL.ADD_DEPARTMENT(currentHospitalId), deptData);
    showSuccess(`Department ${deptData.name} added successfully!`);
    await loadDepartments();
    await loadDepartmentsIntoSelect();
    await loadStats();
    return true;
  } catch (error) {
    console.error("Error adding department:", error);
    showError("Failed to add department");
    return false;
  }
  */

  // Temporary for frontend testing
  console.log("Add department data:", deptData);
  showSuccess(
    `Department ${deptData.name} added successfully! (API will be connected soon)`,
  );
  return true;
}

// ===== DELETE STAFF (API Ready) =====
window.deleteStaff = async function (staffId) {
  if (confirm("Are you sure you want to remove this staff member?")) {
    // TODO: Uncomment when backend is ready
    /*
    try {
      await api.delete(API_PATHS.HOSPITAL.REMOVE_STAFF(currentHospitalId, staffId));
      showSuccess("Staff removed successfully");
      await loadStaffList();
      await loadStats();
    } catch (error) {
      console.error("Error deleting staff:", error);
      showError("Failed to remove staff");
    }
    */

    console.log("Delete staff ID:", staffId);
    showSuccess("Staff removed successfully! (API will be connected soon)");
  }
};

// ===== DELETE DEPARTMENT (API Ready) =====
window.deleteDepartment = async function (deptId) {
  if (confirm("Are you sure you want to remove this department?")) {
    // TODO: Uncomment when backend is ready
    /*
    try {
      await api.delete(API_PATHS.HOSPITAL.REMOVE_DEPARTMENT(currentHospitalId, deptId));
      showSuccess("Department removed successfully");
      await loadDepartments();
      await loadDepartmentsIntoSelect();
      await loadStats();
    } catch (error) {
      console.error("Error deleting department:", error);
      showError("Failed to remove department");
    }
    */

    console.log("Delete department ID:", deptId);
    showSuccess(
      "Department removed successfully! (API will be connected soon)",
    );
  }
};

// ===== EDIT MODE SETUP =====
function setupEditMode() {
  const btn = document.getElementById("editBtn");
  const changeLogoBtn = document.getElementById("changeLogoBtn");
  const fields = document.querySelectorAll(
    "#hospitalName, #hospitalEmail, #phone, #location, #description",
  );

  if (!btn) return;

  btn.onclick = async () => {
    editing = !editing;

    fields.forEach((field) => {
      if (editing) {
        field.removeAttribute("readonly");
        field.style.background = "white";
      } else {
        field.setAttribute("readonly", true);
        field.style.background = "#fafbfc";
      }
    });

    if (changeLogoBtn) {
      changeLogoBtn.style.display = editing ? "inline-block" : "none";
    }

    if (!editing) {
      const success = await saveHospitalProfile();
      if (success) {
        btn.innerHTML = '<i class="fas fa-edit"></i> Edit Profile';
      } else {
        editing = true;
      }
    } else {
      btn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
    }
  };
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Logo upload
  const changeLogoBtn = document.getElementById("changeLogoBtn");
  const logoInput = document.getElementById("logoInput");

  if (changeLogoBtn && logoInput) {
    changeLogoBtn.addEventListener("click", () => logoInput.click());
    logoInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          document.getElementById("hospitalLogo").src = event.target.result;
        };
        reader.readAsDataURL(file);
        window.currentLogoFile = file;
      }
    });
  }

  // Add Staff Modal
  const addUserBtn = document.getElementById("addUserBtn");
  const addStaffModal = document.getElementById("addStaffModal");

  if (addUserBtn && addStaffModal) {
    addUserBtn.addEventListener("click", () => {
      addStaffModal.style.display = "flex";
    });
  }

  // Add Department Modal
  const addDeptBtn = document.getElementById("addDeptBtn");
  const addDeptModal = document.getElementById("addDeptModal");

  if (addDeptBtn && addDeptModal) {
    addDeptBtn.addEventListener("click", () => {
      addDeptModal.style.display = "flex";
    });
  }

  // Close modals
  document.querySelectorAll(".close-modal").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".modal")
        .forEach((modal) => (modal.style.display = "none"));
    });
  });

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none";
    }
  });

  // Save Staff
  const saveStaffBtn = document.getElementById("saveStaffBtn");
  if (saveStaffBtn) {
    saveStaffBtn.addEventListener("click", async () => {
      const name = document.getElementById("staffName").value.trim();
      const email = document.getElementById("staffEmail").value.trim();
      const phone = document.getElementById("staffPhone").value;
      const position = document.getElementById("staffPosition").value;
      const department = document.getElementById("staffDepartment").value;
      const joinDate = document.getElementById("staffJoinDate").value;

      if (!name || !email || !position) {
        showError("Please fill all required fields");
        return;
      }

      const staffData = { name, email, phone, position, department, joinDate };
      await addStaff(staffData);

      document.getElementById("addStaffModal").style.display = "none";
      document.getElementById("staffName").value = "";
      document.getElementById("staffEmail").value = "";
      document.getElementById("staffPhone").value = "";
      document.getElementById("staffPosition").value = "";
      document.getElementById("staffDepartment").value = "";
      document.getElementById("staffJoinDate").value = "";
    });
  }

  // Save Department
  const saveDeptBtn = document.getElementById("saveDeptBtn");
  if (saveDeptBtn) {
    saveDeptBtn.addEventListener("click", async () => {
      const name = document.getElementById("deptName").value.trim();
      const head = document.getElementById("deptHead").value.trim();
      const description = document.getElementById("deptDesc").value.trim();
      const location = document.getElementById("deptLocation").value.trim();

      if (!name) {
        showError("Please enter department name");
        return;
      }

      const deptData = { name, head, description, location };
      await addDepartment(deptData);

      document.getElementById("addDeptModal").style.display = "none";
      document.getElementById("deptName").value = "";
      document.getElementById("deptHead").value = "";
      document.getElementById("deptDesc").value = "";
      document.getElementById("deptLocation").value = "";
    });
  }

  // Cancel buttons
  document.getElementById("cancelStaffBtn")?.addEventListener("click", () => {
    document.getElementById("addStaffModal").style.display = "none";
  });

  document.getElementById("cancelDeptBtn")?.addEventListener("click", () => {
    document.getElementById("addDeptModal").style.display = "none";
  });
}

// ===== UTILITY FUNCTIONS =====
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, function (m) {
    if (m === "&") return "&amp;";
    if (m === "<") return "&lt;";
    if (m === ">") return "&gt;";
    return m;
  });
}

function showSuccess(message) {
  alert("✅ " + message);
}

function showError(message) {
  alert("❌ " + message);
}

function updateClock() {
  const clockEl = document.getElementById("liveClock");
  if (clockEl) {
    const now = new Date();
    clockEl.textContent = now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }
  setTimeout(updateClock, 60000);
}

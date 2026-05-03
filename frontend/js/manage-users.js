// ====================================
// SUPABASE CONFIGURATION
// ====================================
const SUPABASE_URL = "https://tgrrmzusqjzzvhevmmbt.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRncnJtenVzcWp6enZoZXZtbWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyOTg4NDUsImV4cCI6MjA5MDg3NDg0NX0.nmD117ohEA-pMV4YnNluPxJGT4N-HFJxPaRRyGFyyks";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables
let users = [];
let currentUserId = null;
let userToDelete = null;
let currentHospitalId = null;

// Load user data on page load
window.onload = async function () {
  checkAuth();
  await loadUserData();
  await loadUsersFromSupabase();
  updateStats();
  renderUsersTable();
};

// Check if user is authenticated
function checkAuth() {
  const loggedIn = localStorage.getItem("icds_logged_in");
  if (loggedIn !== "true") {
    window.location.href = "login.html";
  }
}

// Load users from Supabase
async function loadUsersFromSupabase() {
  if (!currentHospitalId) {
    console.log("No hospital ID found");
    return;
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("hospital_id", currentHospitalId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    users = data || [];
    console.log(`Loaded ${users.length} users from Supabase`);
  } catch (error) {
    console.error("Error loading users:", error);
    showNotification("Error loading users from database", "error");
    users = [];
  }
}

// Save user to Supabase
async function saveUserToSupabase(userData) {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert({
        hospital_id: currentHospitalId,
        full_name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        password_hash: btoa(userData.password),
        role: userData.role,
        department: userData.department,
        phone: userData.phone,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data };
  } catch (error) {
    console.error("Error saving user:", error);
    return { success: false, error: error.message };
  }
}

// Update user in Supabase
async function updateUserInSupabase(userId, userData) {
  try {
    const { error } = await supabase
      .from("users")
      .update({
        full_name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        phone: userData.phone,
      })
      .eq("id", userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: error.message };
  }
}

// Delete user from Supabase
async function deleteUserFromSupabase(userId) {
  try {
    const { error } = await supabase.from("users").delete().eq("id", userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
  }
}

// Update user status in Supabase
async function updateUserStatusInSupabase(userId, isActive) {
  try {
    const { error } = await supabase
      .from("users")
      .update({ is_active: isActive })
      .eq("id", userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error updating status:", error);
    return { success: false, error: error.message };
  }
}

// Reset password in Supabase
async function resetPasswordInSupabase(userId, newPassword) {
  try {
    const { error } = await supabase
      .from("users")
      .update({ password_hash: btoa(newPassword) })
      .eq("id", userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, error: error.message };
  }
}

// Load user data from localStorage and Supabase
async function loadUserData() {
  const name = localStorage.getItem("icds_user_name") || "";
  const hospital = localStorage.getItem("icds_hospital") || "";
  const email = localStorage.getItem("icds_user_email") || "";
  currentHospitalId = localStorage.getItem("icds_hospital_id");

  document.getElementById("hospitalName").textContent = hospital || "--";
  document.getElementById("doctorName").textContent = name || "--";
  document.getElementById("doctorEmail").textContent = email || "--";
  document.getElementById("userNameDisplay").textContent = name || "--";

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "--";
  document.getElementById("userAvatar").textContent = initials;
}

// Update all stats
function updateStats() {
  const total = users.length;
  const doctors = users.filter((u) => u.role === "doctor").length;
  const nurses = users.filter((u) => u.role === "nurse").length;
  const superAdmins = users.filter((u) => u.role === "super-admin").length;
  const admins = users.filter((u) => u.role === "admin").length;
  const pending = users.filter(
    (u) => u.status === "pending" || !u.is_active,
  ).length;

  document.getElementById("totalUsers").textContent = total;
  document.getElementById("totalDoctors").textContent = doctors;
  document.getElementById("totalNurses").textContent = nurses;
  document.getElementById("pendingUsers").textContent = pending;
  document.getElementById("superAdminCount").textContent = superAdmins;
  document.getElementById("adminCount").textContent = admins;
  document.getElementById("doctorCount").textContent = doctors;
  document.getElementById("nurseCount").textContent = nurses;
  document.getElementById("userStatsText").textContent =
    `Total of ${total} users`;
}

// Render users table
function renderUsersTable() {
  const tbody = document.getElementById("tableBody");
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const roleFilter = document.getElementById("roleFilter").value;
  const statusFilter = document.getElementById("statusFilter").value;
  const deptFilter = document.getElementById("departmentFilter").value;

  let filteredUsers = users.filter((user) => {
    let match = true;
    if (searchTerm) {
      const fullName = user.full_name || `${user.firstName} ${user.lastName}`;
      if (
        !fullName.toLowerCase().includes(searchTerm) &&
        !user.email.toLowerCase().includes(searchTerm)
      ) {
        match = false;
      }
    }
    if (roleFilter !== "all" && user.role !== roleFilter) match = false;

    let userStatus = user.is_active ? "active" : "inactive";
    if (user.status === "pending") userStatus = "pending";
    if (statusFilter !== "all" && userStatus !== statusFilter) match = false;

    if (deptFilter !== "all" && user.department !== deptFilter) match = false;
    return match;
  });

  if (filteredUsers.length === 0) {
    tbody.innerHTML = `
                    <tr><td colspan="7" class="empty-table">
                        <i class="fas fa-users-slash"></i>
                        <p>No users found</p>
                        <small>Click "Add New User" to create your first staff member</small>
                        <div style="margin-top: 20px;">
                            <button class="btn btn-primary" onclick="addNewUser()" style="padding: 10px 20px;">
                                <i class="fas fa-user-plus"></i> Add Your First User
                            </button>
                        </div>
                    </td></tr>
                `;
    return;
  }

  tbody.innerHTML = filteredUsers
    .map((user) => {
      let roleClass = "";
      let avatarClass = "";
      let statusClass = "";
      let roleDisplay = "";
      const userStatus = user.is_active ? "active" : "inactive";
      const fullName =
        user.full_name || `${user.firstName || ""} ${user.lastName || ""}`;
      const firstName = user.full_name
        ? user.full_name.split(" ")[0]
        : user.firstName || "";
      const lastName = user.full_name
        ? user.full_name.split(" ").slice(1).join(" ")
        : user.lastName || "";
      const initials = (
        firstName.charAt(0) + (lastName.charAt(0) || "")
      ).toUpperCase();

      switch (user.role) {
        case "super-admin":
          roleClass = "role-super-admin";
          avatarClass = "super-admin";
          roleDisplay = "Super Admin";
          break;
        case "admin":
          roleClass = "role-admin";
          avatarClass = "admin";
          roleDisplay = "Admin";
          break;
        case "doctor":
          roleClass = "role-doctor";
          avatarClass = "doctor";
          roleDisplay = "Doctor";
          break;
        case "nurse":
          roleClass = "role-nurse";
          avatarClass = "nurse";
          roleDisplay = "Nurse";
          break;
        default:
          roleClass = "role-doctor";
          avatarClass = "doctor";
          roleDisplay = "Staff";
      }

      switch (userStatus) {
        case "active":
          statusClass = "status-active";
          break;
        case "inactive":
          statusClass = "status-inactive";
          break;
        default:
          statusClass = "status-pending";
          break;
      }

      return `
                    <tr>
                        <td>
                            <div class="user-info">
                                <div class="user-avatar ${avatarClass}">${initials || "U"}</div>
                                <div class="user-details">
                                    <div class="user-name">${fullName}</div>
                                    <div class="user-email">${user.email}</div>
                                </div>
                            </div>
                        </td>
                        <td><span class="role-badge ${roleClass}">${roleDisplay}</span></td>
                        <td>${user.department || "Not assigned"}</td>
                        <td>${user.phone || "Not provided"}</td>
                        <td><span class="status-badge ${statusClass}">${userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}</span></td>
                        <td>${user.last_active || "Never"}</td>
                        <td>
                            <button class="action-btn edit" onclick="editUser('${user.id}')" title="Edit User"><i class="fas fa-edit"></i></button>
                            <button class="action-btn reset" onclick="resetPassword('${user.id}')" title="Reset Password"><i class="fas fa-key"></i></button>
                            <button class="action-btn status" onclick="toggleUserStatus('${user.id}')" title="${userStatus === "active" ? "Disable User" : "Enable User"}"><i class="fas ${userStatus === "active" ? "fa-ban" : "fa-check-circle"}"></i></button>
                            <button class="action-btn delete" onclick="deleteUser('${user.id}')" title="Delete User"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
    })
    .join("");
}

// Search and filter functions
function searchUsers() {
  renderUsersTable();
}
function filterUsers() {
  renderUsersTable();
}

function resetFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("roleFilter").value = "all";
  document.getElementById("statusFilter").value = "all";
  document.getElementById("departmentFilter").value = "all";
  renderUsersTable();
}

// Add new user
function addNewUser() {
  document.getElementById("modalTitle").textContent = "Add New User";
  document.getElementById("firstName").value = "";
  document.getElementById("lastName").value = "";
  document.getElementById("userEmail").value = "";
  document.getElementById("userPhone").value = "";
  document.getElementById("userRole").value = "doctor";
  document.getElementById("userDepartment").value = "oncology";
  document.getElementById("licenseNumber").value = "";
  document.getElementById("userPassword").value = "";
  document.getElementById("confirmUserPassword").value = "";
  document.getElementById("sendInvite").checked = true;

  document.getElementById("permAssess").checked = true;
  document.getElementById("permView").checked = true;
  document.getElementById("permEdit").checked = false;
  document.getElementById("permDelete").checked = false;
  document.getElementById("permUsers").checked = false;
  document.getElementById("permReports").checked = true;

  currentUserId = null;
  document.getElementById("userModal").classList.add("active");
}

// Save user
async function saveUser() {
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("userEmail").value;
  const phone = document.getElementById("userPhone").value;
  const role = document.getElementById("userRole").value;
  const department = document.getElementById("userDepartment").value;
  const password = document.getElementById("userPassword").value;
  const confirmPassword = document.getElementById("confirmUserPassword").value;

  if (!firstName || !lastName || !email) {
    alert("Please fill in all required fields");
    return;
  }

  if (!currentUserId && (!password || password.length < 6)) {
    alert("Password must be at least 6 characters");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  const saveBtn = document.getElementById("saveUserBtn");
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span class="loading-spinner"></span> Saving...';

  if (currentUserId) {
    // Edit existing user
    const result = await updateUserInSupabase(currentUserId, {
      firstName,
      lastName,
      email,
      phone,
      role,
      department,
    });

    if (result.success) {
      // Update local array
      const index = users.findIndex((u) => u.id === currentUserId);
      if (index !== -1) {
        users[index] = {
          ...users[index],
          full_name: `${firstName} ${lastName}`,
          email,
          phone,
          role,
          department,
        };
      }
      alert(`User ${firstName} ${lastName} updated successfully!`);
    } else {
      alert(`Error updating user: ${result.error}`);
    }
  } else {
    // Add new user
    const result = await saveUserToSupabase({
      firstName,
      lastName,
      email,
      phone,
      role,
      department,
      password,
    });

    if (result.success) {
      users.push(result.data);
      alert(
        `User ${firstName} ${lastName} (${role}) added successfully!\nInvitation email would be sent to ${email}`,
      );
    } else {
      alert(`Error adding user: ${result.error}`);
    }
  }

  saveBtn.disabled = false;
  saveBtn.innerHTML = '<i class="fas fa-save"></i> Save User';

  updateStats();
  renderUsersTable();
  closeUserModal();
}

// Edit user
function editUser(userId) {
  const user = users.find((u) => u.id === userId);
  if (!user) return;

  const nameParts = (user.full_name || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  document.getElementById("modalTitle").textContent = "Edit User";
  document.getElementById("firstName").value = firstName;
  document.getElementById("lastName").value = lastName;
  document.getElementById("userEmail").value = user.email;
  document.getElementById("userPhone").value = user.phone || "";
  document.getElementById("userRole").value = user.role;
  document.getElementById("userDepartment").value =
    user.department || "oncology";
  document.getElementById("userPassword").value = "";
  document.getElementById("confirmUserPassword").value = "";
  document.getElementById("sendInvite").checked = false;

  document.getElementById("permAssess").checked = true;
  document.getElementById("permView").checked = true;
  document.getElementById("permEdit").checked = false;
  document.getElementById("permDelete").checked = false;
  document.getElementById("permUsers").checked = false;
  document.getElementById("permReports").checked = true;

  currentUserId = userId;
  document.getElementById("userModal").classList.add("active");
}

// Delete user - Show confirmation modal
function deleteUser(userId) {
  const user = users.find((u) => u.id === userId);
  if (!user) return;

  userToDelete = userId;
  document.getElementById("deleteUserName").textContent =
    user.full_name || `${user.firstName} ${user.lastName}`;
  document.getElementById("deleteUserModal").classList.add("active");
}

// Confirm delete user
async function confirmDeleteUser() {
  if (userToDelete) {
    const user = users.find((u) => u.id === userToDelete);
    const userName = user
      ? user.full_name || `${user.firstName} ${user.lastName}`
      : "User";

    const result = await deleteUserFromSupabase(userToDelete);

    if (result.success) {
      users = users.filter((u) => u.id !== userToDelete);
      updateStats();
      renderUsersTable();
      alert(`${userName} has been deleted successfully.`);
    } else {
      alert(`Error deleting user: ${result.error}`);
    }

    closeDeleteModal();
    userToDelete = null;
  }
}

// Close delete modal
function closeDeleteModal() {
  document.getElementById("deleteUserModal").classList.remove("active");
  userToDelete = null;
}

// Reset password
function resetPassword(userId) {
  const user = users.find((u) => u.id === userId);
  if (!user) return;

  document.getElementById("resetUserName").textContent =
    user.full_name || `${user.firstName} ${user.lastName}`;
  document.getElementById("newPassword").value = "";
  document.getElementById("confirmPassword").value = "";
  currentUserId = userId;
  document.getElementById("resetPasswordModal").classList.add("active");
}

// Confirm reset
async function confirmReset() {
  const newPass = document.getElementById("newPassword").value;
  const confirmPass = document.getElementById("confirmPassword").value;

  if (!newPass) {
    alert("Please enter a new password");
    return;
  }

  if (newPass !== confirmPass) {
    alert("Passwords do not match");
    return;
  }

  if (newPass.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  const result = await resetPasswordInSupabase(currentUserId, newPass);

  if (result.success) {
    alert(
      `Password reset successfully for ${document.getElementById("resetUserName").textContent}`,
    );
  } else {
    alert(`Error resetting password: ${result.error}`);
  }

  closeResetModal();
}

// Toggle user status
async function toggleUserStatus(userId) {
  const user = users.find((u) => u.id === userId);
  if (user) {
    const newStatus = !user.is_active;
    const result = await updateUserStatusInSupabase(userId, newStatus);

    if (result.success) {
      user.is_active = newStatus;
      updateStats();
      renderUsersTable();
      alert(
        `${user.full_name || `${user.firstName} ${user.lastName}`} is now ${newStatus ? "ACTIVE" : "INACTIVE"}`,
      );
    } else {
      alert(`Error updating status: ${result.error}`);
    }
  }
}

function closeUserModal() {
  document.getElementById("userModal").classList.remove("active");
}
function closeResetModal() {
  document.getElementById("resetPasswordModal").classList.remove("active");
}

function exportUsers() {
  const dataStr = JSON.stringify(users, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
  const exportFileDefaultName = `icds_users_${new Date().toISOString().split("T")[0]}.json`;
  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
}

function sendInvitations() {
  addNewUser();
}

async function refreshTable() {
  await loadUsersFromSupabase();
  updateStats();
  renderUsersTable();
  showNotification("Users refreshed from database", "success");
}

function showNotifications() {
  const pendingCount = users.filter((u) => !u.is_active).length;
  alert(
    `${users.length} total users\n${pendingCount} inactive users\n${users.filter((u) => u.role === "doctor").length} doctors`,
  );
}

function showUserProfile() {
  const name = localStorage.getItem("icds_user_name") || "Not logged in";
  const hospital = localStorage.getItem("icds_hospital") || "No hospital";
  const email = localStorage.getItem("icds_user_email") || "No email";
  alert(`${name}\n${hospital}\n${email}\nRole: Medical Director`);
}

function showNotification(message, type) {
  console.log(`[${type.toUpperCase()}] ${message}`);
}

function logout() {
  localStorage.removeItem("icds_logged_in");
  localStorage.removeItem("icds_user_id");
  localStorage.removeItem("icds_user_email");
  localStorage.removeItem("icds_user_name");
  localStorage.removeItem("icds_hospital");
  localStorage.removeItem("icds_hospital_id");
  localStorage.removeItem("icds_user_role");
  window.location.href = "login.html";
}

document.addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.key === "f") {
    e.preventDefault();
    document.getElementById("searchInput").focus();
  }
  if (e.ctrlKey && e.key === "n") {
    e.preventDefault();
    addNewUser();
  }
  if (e.key === "Escape") {
    closeUserModal();
    closeResetModal();
    closeDeleteModal();
  }
});

window.addEventListener("resize", function () {
  if (window.innerWidth <= 768) {
    document.getElementById("sidebar").classList.remove("collapsed");
    document.getElementById("mainContent").classList.remove("expanded");
  }
});

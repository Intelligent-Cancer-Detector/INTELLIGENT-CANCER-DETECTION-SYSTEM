// ====================================
// SETTINGS PAGE JAVASCRIPT
// Admin: Dr. Wycliff Nthiga
// Hospital: BBH NATIONAL HOSPITAL
// ====================================

// Load user data on page load
window.onload = function () {
  checkAuth();
  loadUserData();
  initializeSettings();
  console.log("Settings Page Loaded");
  console.log("Hospital: BBH NATIONAL HOSPITAL");
  console.log("Admin: Dr. Wycliff Nthiga");
};

// Check if user is authenticated
function checkAuth() {
  const loggedIn = localStorage.getItem("icds_logged_in");
  if (!loggedIn || loggedIn !== "true") {
    window.location.href = "login.html";
  }
}

// Load user data from localStorage
function loadUserData() {
  const name = localStorage.getItem("icds_user_name") || "Dr. Wycliff Nthiga";
  const hospital =
    localStorage.getItem("icds_hospital") || "BBH NATIONAL HOSPITAL";
  const email =
    localStorage.getItem("icds_user_email") || "wycliffr254@gmail.com";

  document.getElementById("hospitalName").textContent = hospital;
  document.getElementById("doctorName").textContent = name;
  document.getElementById("doctorEmail").textContent = email;
}

// Initialize settings with saved values
function initializeSettings() {
  // Load saved settings from localStorage
  const savedSettings = localStorage.getItem("icds_settings");
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    // Apply saved settings to form elements
    console.log("Loaded saved settings:", settings);
  }

  // Setup range input listeners
  document
    .getElementById("highThreshold")
    .addEventListener("input", function (e) {
      document.getElementById("highValue").textContent = e.target.value + "%";
    });

  document
    .getElementById("mediumThreshold")
    .addEventListener("input", function (e) {
      document.getElementById("mediumValue").textContent = e.target.value + "%";
    });
}

// Show settings section
function showSection(section) {
  // Hide all sections
  document.querySelectorAll(".settings-section").forEach((s) => {
    s.classList.remove("active");
  });

  // Remove active class from all nav items
  document.querySelectorAll(".settings-nav-item").forEach((item) => {
    item.classList.remove("active");
  });

  // Show selected section
  document.getElementById(`section-${section}`).classList.add("active");

  // Add active class to clicked nav item
  event.target.closest(".settings-nav-item").classList.add("active");
}

// Save all settings
function saveAllSettings() {
  // Collect all settings
  const settings = {
    general: {
      language: document.getElementById("systemLanguage").value,
      dateFormat: document.getElementById("dateFormat").value,
      timezone: document.getElementById("timezone").value,
      currency: document.getElementById("currency").value,
      theme: document.getElementById("theme").value,
      accentColor: document.getElementById("accentColor").value,
      compactMode: document.getElementById("compactMode").checked,
      autoSave: document.getElementById("autoSave").checked,
      requireSecondOpinion: document.getElementById("requireSecondOpinion")
        .checked,
    },
    notifications: {
      emailHighRisk: document.getElementById("emailHighRisk").checked,
      emailCompletion: document.getElementById("emailCompletion").checked,
      emailWeekly: document.getElementById("emailWeekly").checked,
      smsCritical: document.getElementById("smsCritical").checked,
      smsPhone: document.getElementById("smsPhone").value,
      showBadge: document.getElementById("showBadge").checked,
      desktopNotify: document.getElementById("desktopNotify").checked,
      notifySound: document.getElementById("notifySound").value,
    },
    security: {
      twoFactor: document.getElementById("twoFactor").checked,
      sessionTimeout: document.getElementById("sessionTimeout").value,
      passwordExpiry: document.getElementById("passwordExpiry").value,
      loginAttempts: document.getElementById("loginAttempts").value,
      enableWhitelist: document.getElementById("enableWhitelist").checked,
      ipWhitelist: document.getElementById("ipWhitelist").value,
      auditLogins: document.getElementById("auditLogins").checked,
      auditAssessments: document.getElementById("auditAssessments").checked,
      auditUserChanges: document.getElementById("auditUserChanges").checked,
      auditRetention: document.getElementById("auditRetention").value,
    },
    ai: {
      model: document.getElementById("aiModel").value,
      highThreshold: document.getElementById("highThreshold").value,
      mediumThreshold: document.getElementById("mediumThreshold").value,
      includeLung: document.getElementById("includeLung").checked,
      includeColorectal: document.getElementById("includeColorectal").checked,
      includeBreast: document.getElementById("includeBreast").checked,
      includeProstate: document.getElementById("includeProstate").checked,
      includePancreatic: document.getElementById("includePancreatic").checked,
      includeBrain: document.getElementById("includeBrain").checked,
      includeEye: document.getElementById("includeEye").checked,
      includeSkin: document.getElementById("includeSkin").checked,
      includeOvarian: document.getElementById("includeOvarian").checked,
      includeBladder: document.getElementById("includeBladder").checked,
    },
  };

  // Save to localStorage
  localStorage.setItem("icds_settings", JSON.stringify(settings));

  showSuccessMessage("All settings saved successfully!");
}

// Discard changes
function discardChanges() {
  if (confirm("Discard all unsaved changes?")) {
    location.reload();
  }
}

// Reset to default
function resetToDefault() {
  document.getElementById("resetModal").classList.add("active");
}

// Close reset modal
function closeResetModal() {
  document.getElementById("resetModal").classList.remove("active");
}

// Confirm reset
function confirmReset() {
  // Reset all form elements to default values
  // This would reset all settings to system defaults
  showSuccessMessage("Settings reset to default values");
  closeResetModal();
}

// Show success message
function showSuccessMessage(message) {
  const successMsg = document.getElementById("successMessage");
  document.getElementById("successText").textContent = message;
  successMsg.classList.add("show");

  setTimeout(() => {
    successMsg.classList.remove("show");
  }, 3000);
}

// Copy API key
function copyAPIKey() {
  const apiKey = document.getElementById("apiKey");
  apiKey.select();
  document.execCommand("copy");
  showSuccessMessage("API key copied to clipboard!");
}

// Backup now
function backupNow() {
  showSuccessMessage("Backup started... This may take a few minutes");
}

// Schedule backup
function scheduleBackup() {
  alert("Configure backup schedule in the Backup section above");
}

// Restore backup
function restoreBackup(date) {
  if (
    confirm(`Restore backup from ${date}? This will overwrite current data.`)
  ) {
    showSuccessMessage(`Restoring backup from ${date}...`);
  }
}

// Download backup
function downloadBackup(date) {
  showSuccessMessage(`Downloading backup from ${date}...`);
}

// Configure integration
function configureIntegration(type) {
  alert(`Configure ${type} integration settings`);
}

// Connect integration
function connectIntegration(type) {
  alert(`Connect to ${type} system`);
}

// Download audit logs
function downloadAuditLogs() {
  showSuccessMessage("Downloading audit logs...");
}

// Update AI model
function updateAIModel() {
  showSuccessMessage("AI model update initiated. This may take a few minutes.");
}

// View system logs
function viewSystemLogs() {
  alert("View system logs - Opening log viewer");
}

// Clear cache
function clearCache() {
  if (
    confirm("Clear system cache? This may temporarily slow down the system.")
  ) {
    showSuccessMessage("Cache cleared successfully");
  }
}

// Reset all settings
function resetAllSettings() {
  document.getElementById("resetModal").classList.add("active");
}

// Deactivate hospital
function deactivateHospital() {
  document.getElementById("deactivateModal").classList.add("active");
}

// Close deactivate modal
function closeDeactivateModal() {
  document.getElementById("deactivateModal").classList.remove("active");
}

// Confirm deactivate
function confirmDeactivate() {
  alert("Deactivation request submitted. Super admin approval required.");
  closeDeactivateModal();
}

// Show notifications
function showNotifications() {
  alert(
    "You have 3 notifications:\n- 2 pending user approvals\n- 1 system update available",
  );
}

// Show user profile
function showUserProfile() {
  alert(
    `Dr. Wycliff Nthiga\nMedical Director\nBBH NATIONAL HOSPITAL\nwycliffr254@gmail.com`,
  );
}

// Logout
function logout() {
  localStorage.removeItem("icds_logged_in");
  localStorage.removeItem("icds_user_email");
  localStorage.removeItem("icds_user_name");
  localStorage.removeItem("icds_hospital");
  window.location.href = "login.html";
}

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  // Ctrl + S to save
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    saveAllSettings();
  }

  // Esc to close modals
  if (e.key === "Escape") {
    closeResetModal();
    closeDeactivateModal();
  }
});

// Handle window resize
window.addEventListener("resize", function () {
  if (window.innerWidth <= 768) {
    document.getElementById("sidebar").classList.remove("collapsed");
    document.getElementById("mainContent").classList.remove("expanded");
  }
});

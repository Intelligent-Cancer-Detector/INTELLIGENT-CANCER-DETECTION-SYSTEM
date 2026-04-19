// ====================================
// BACKEND API CONFIGURATION
// ====================================

import { API_PATHS, BASE_URL } from "../utils/apiPaths.js";
import api from "../utils/axiosInstance.js";

const API_BASE_URL = BASE_URL;

// Test credentials
const TEST_EMAIL = window.ENV.TEST_EMAIL;
const TEST_PASSWORD = window.ENV.TEST_PASSWORD;

// Handle login with backend API
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const rememberMe = document.getElementById("remember").checked;
  const loginBtn = document.getElementById("loginBtn");

  if (!email || !password) {
    showAlert("error", "Please enter both email and password");
    return;
  }

  loginBtn.disabled = true;
  loginBtn.innerHTML =
    '<span class="loading-spinner"></span> Authenticating...';
  showAlert("info", "Connecting to server...");

  try {
    // Call backend login API
    // const response = await fetch(`${API_BASE_URL}/auth/login`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     email: email,
    //     password: password,
    //   }),
    // });

    const response = await api.post(API_PATHS.AUTH.LOGIN, {
      email: email,
      password: password,
    });

    const data =  response.data;

    if (data.success) {
      // Login successful
      showAlert("success", `Welcome back, ${data.user.name}! Redirecting...`);

      // Store login state in localStorage
      localStorage.setItem("icds_logged_in", "true");
      localStorage.setItem("icds_user_id", data.user.id);
      localStorage.setItem("icds_user_email", data.user.email);
      localStorage.setItem("icds_user_name", data.user.name);
      localStorage.setItem("icds_user_role", data.user.role);
      localStorage.setItem(
        "icds_department",
        data.user.department || "Medical",
      );
      localStorage.setItem("icds_hospital_id", data.user.hospital_id);
      localStorage.setItem("icds_hospital", data.user.hospital_name);
      localStorage.setItem("icds_token", data.token);

      if (rememberMe) {
        localStorage.setItem("icds_remember_me", "true");
        localStorage.setItem("icds_saved_email", email);
      } else {
        localStorage.removeItem("icds_remember_me");
        localStorage.removeItem("icds_saved_email");
      }

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);
    } else {
      showAlert("error", data.error || "Invalid email or password");
      resetLoginButton(loginBtn);
    }
  } catch (error) {
    console.error("Login error:", error);
    showAlert(
      "error",
      "Cannot connect to server. Make sure backend is running on port 5000",
    );
    resetLoginButton(loginBtn);
  }
}

function resetLoginButton(loginBtn) {
  loginBtn.disabled = false;
  loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
}

function showAlert(type, message) {
  const successAlert = document.getElementById("successAlert");
  const errorAlert = document.getElementById("errorAlert");
  const infoAlert = document.getElementById("infoAlert");

  successAlert.classList.remove("show");
  errorAlert.classList.remove("show");
  infoAlert.classList.remove("show");

  if (type === "success") {
    document.getElementById("successMessage").textContent = message;
    successAlert.classList.add("show");
    setTimeout(() => successAlert.classList.remove("show"), 3000);
  } else if (type === "error") {
    document.getElementById("errorMessage").textContent = message;
    errorAlert.classList.add("show");
    setTimeout(() => errorAlert.classList.remove("show"), 4000);
  } else if (type === "info") {
    document.getElementById("infoMessage").textContent = message;
    infoAlert.classList.add("show");
    setTimeout(() => infoAlert.classList.remove("show"), 2000);
  }
}

function togglePassword() {
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.getElementById("toggleIcon");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.classList.remove("fa-eye");
    toggleIcon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    toggleIcon.classList.remove("fa-eye-slash");
    toggleIcon.classList.add("fa-eye");
  }
}

function forgotPassword() {
  alert(
    "Please contact your hospital administrator to reset your password.\n\nOr use test mode (Ctrl+Shift+L)",
  );
}

function loadSavedCredentials() {
  const rememberMe = localStorage.getItem("icds_remember_me");
  if (rememberMe === "true") {
    const savedEmail = localStorage.getItem("icds_saved_email");
    if (savedEmail) {
      document.getElementById("email").value = savedEmail;
      document.getElementById("remember").checked = true;
    }
  }
}

// Test Mode - Press Ctrl+Shift+L to load test credentials
document.addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.shiftKey && e.key === "Y") {
    e.preventDefault();
    console.log("hello shortcut pressed!");
    document.getElementById("email").value = TEST_EMAIL;
    document.getElementById("password").value = TEST_PASSWORD;
    showAlert("success", "Test credentials loaded! Click Sign In to login.");
  }
});

document.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("loginForm").dispatchEvent(new Event("submit"));
  }
});

loadSavedCredentials();
console.log("ICDS Login Page Ready - Using Backend API at", API_BASE_URL);
console.log("Test credentials: Ctrl+Shift+Y to load");
console.log("Make sure backend is running: python app.py");

window.togglePassword = togglePassword;
window.forgotPassword = forgotPassword;
window.handleLogin = handleLogin;

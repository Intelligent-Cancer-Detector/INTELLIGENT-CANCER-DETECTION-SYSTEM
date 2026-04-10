/**
 * ICDS - Shared API Helper
 * Place this file in: frontend/js/api.js
 * All pages import this to talk to the Flask backend.
 */

const API = {

  BASE: "http://localhost:5000",

  // ── Get stored token ───────────────────────────────────────────────────────
  getToken() {
    return localStorage.getItem("icds_token");
  },

  // ── Headers with JWT ───────────────────────────────────────────────────────
  headers() {
    const token = this.getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
  },

  // ── Generic request ────────────────────────────────────────────────────────
  async request(method, endpoint, body = null) {
    try {
      const options = {
        method,
        headers: this.headers(),
      };
      if (body) options.body = JSON.stringify(body);

      const res  = await fetch(`${this.BASE}${endpoint}`, options);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  get:    (ep)       => API.request("GET",    ep),
  post:   (ep, body) => API.request("POST",   ep, body),
  put:    (ep, body) => API.request("PUT",    ep, body),
  delete: (ep)       => API.request("DELETE", ep),

  // ── Save login session ─────────────────────────────────────────────────────
  saveSession(token, user, hospital) {
    localStorage.setItem("icds_token",        token);
    localStorage.setItem("icds_user",         JSON.stringify(user));
    localStorage.setItem("icds_hospital",     JSON.stringify(hospital));
    localStorage.setItem("icds_user_name",    user.name);
    localStorage.setItem("icds_user_email",   user.email);
    localStorage.setItem("icds_user_role",    user.role);
    localStorage.setItem("icds_hospital_name",hospital.name || "");
    localStorage.setItem("icds_logged_in",    "true");
  },

  // ── Clear session on logout ────────────────────────────────────────────────
  clearSession() {
    ["icds_token","icds_user","icds_hospital","icds_user_name",
     "icds_user_email","icds_user_role","icds_hospital_name",
     "icds_logged_in"].forEach(k => localStorage.removeItem(k));
  },

  // ── Check if logged in ─────────────────────────────────────────────────────
  isLoggedIn() {
    return !!this.getToken() && localStorage.getItem("icds_logged_in") === "true";
  },

  // ── Get current user from localStorage ────────────────────────────────────
  getCurrentUser() {
    try { return JSON.parse(localStorage.getItem("icds_user") || "{}"); }
    catch { return {}; }
  },

  getCurrentHospital() {
    try { return JSON.parse(localStorage.getItem("icds_hospital") || "{}"); }
    catch { return {}; }
  },

  // ── Redirect to login if not authenticated ─────────────────────────────────
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = "/login.html";
      return false;
    }
    return true;
  },

  // ── Logout ─────────────────────────────────────────────────────────────────
  logout() {
    this.clearSession();
    window.location.href = "/login.html";
  }
};
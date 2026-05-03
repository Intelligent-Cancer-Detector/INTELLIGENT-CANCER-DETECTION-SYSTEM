// // GLOBAL FUNCTIONS
// window.toggleSidebar = function () {
//   const sidebar = document.querySelector(".app-sidebar");
//   const mainContent = document.getElementById("mainContent");

import { API_PATHS } from "../utils/apiPaths.js";
import api from "../utils/axiosInstance.js";

//   if (!sidebar) return;

//   sidebar.classList.toggle("collapsed");

//   if (mainContent) {
//     mainContent.classList.toggle("expanded");
//   }

//   const icon = document.querySelector(".menu-toggle i");

//   if (icon) {
//     icon.classList.toggle("fa-chevron-left");
//     icon.classList.toggle("fa-chevron-right");
//   }
// };

// // SIDEBAR DATA
// window.syncSidebarRegistry = async function () {
//   const hospId = localStorage.getItem("icds_hospital_id");

//   const nameEl = document.getElementById("displayDoctorName");
//   const emailEl = document.getElementById("displayDoctorEmail");

//   if (nameEl)
//     nameEl.textContent =
//       localStorage.getItem("icds_user_name") || "Medical Staff";

//   if (emailEl)
//     emailEl.textContent =
//       localStorage.getItem("icds_user_email") || "staff@hosp.com";

//   if (!hospId) return;

//   try {
//     const response = await fetch(
//       `http://localhost:5000/api/hospitals/${hospId}`
//     );
//     const data = await response.json();

//     if (data.success) {
//       const hospitalEl = document.getElementById("displayHospitalName");
//       if (hospitalEl) hospitalEl.textContent = data.hospital.name;
//     }
//   } catch (e) {
//     console.log("Offline mode");
//   }
// };

// ACTIVE MENU
// window.setActiveMenu = function () {
//   const links = document.querySelectorAll(".menu-item");
//   const currentPage = window.location.pathname.split("/").pop();

//   links.forEach((link) => {
//     const linkPage = link.getAttribute("href").split("/").pop();

//     link.classList.toggle("active", linkPage === currentPage);
//   });
// };

// INIT AFTER SIDEBAR LOAD
window.initSidebar = function () {
  setActiveMenu();
  syncSidebarRegistry();
  sidebarCollapser();
};

function sidebarCollapser() {
  document.addEventListener("click", function (e) {
    const sidebar = document.querySelector(".app-sidebar");
    const toggleBtn = document.querySelector(".menu-toggle");

    if (!sidebar) return;

    const isClickInsideSidebar = sidebar.contains(e.target);
    const isToggleButton = toggleBtn && toggleBtn.contains(e.target);

    if (!isClickInsideSidebar && !isToggleButton) {
      sidebar.classList.add("collapsed");
      document.body.classList.add("sidebar-collapsed");

      // update icon
      const icon = document.querySelector(".menu-toggle i");
      if (icon) {
        icon.classList.remove("fa-chevron-left");
        icon.classList.add("fa-chevron-right");
      }

      // optional: save state
      localStorage.setItem("sidebarCollapsed", "true");
    }
  });
}

async function syncSidebarRegistry() {
  const hospId = localStorage.getItem("icds_hospital_id");

  // These come from the login session
  document.getElementById("displayHospitalName").textContent =
    localStorage.getItem("icds_hospital");

  document.getElementById("displayDoctorName").textContent =
    localStorage.getItem("icds_user_name") || "Medical Staff";
  document.getElementById("displayDoctorEmail").textContent =
    localStorage.getItem("icds_user_email") || "staff@hosp.com";
  if (!hospId) return;

  try {
    // Fetch the "Original" registered name from your database
    const response = await api.get(
      API_PATHS.HOSPITAL.GET_HOSPITAL(currentHospitalId),
    );
    const data = await response.json();

    if (data.success) {
      document.getElementById("displayHospitalName").textContent =
        data.hospital.name;
    }
  } catch (e) {
    console.log("Offline mode - using session cache");
    document.getElementById("hospitalName").textContent =
      localStorage.getItem("icds_hospital_name");
  }
}

function setActiveMenu() {
  const links = document.querySelectorAll(".menu-item");
  const currentPage = window.location.pathname.split("/").pop();
  console.log(currentPage);

  links.forEach((link) => {
    const linkPage = link.getAttribute("href").split("/").pop();
    if (linkPage === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function handleLogout() {
  localStorage.clear();
  window.location.href = "login.html";
}
// function toggleSidebar() {
//   const sidebar = document.querySelector(".app-sidebar");
//   sidebar.classList.toggle("collapsed");

//   const icon = document.querySelector(".menu-toggle i");

//   if (sidebar.classList.contains("collapsed")) {
//     icon.classList.remove("fa-chevron-left");
//     icon.classList.add("fa-chevron-right");
//   } else {
//     icon.classList.remove("fa-chevron-right");
//     icon.classList.add("fa-chevron-left");
//   }
// }

window.toggleSidebar = function () {
  const sidebar = document.querySelector(".app-sidebar");
  const body = document.body;
  // const microscope = document.querySelector(".fa-microscope");

  sidebar.classList.toggle("collapsed");
  body.classList.toggle("sidebar-collapsed");
  // if (sidebar.classList.contains("collapsed")) {
  //   if (microscope) microscope.style.display = "none";
  //   else {
  //     if (microscope) microscope.style.display = "block";
  //   }
  // }

  const icon = document.querySelector(".menu-toggle i");

  if (icon) {
    if (sidebar.classList.contains("collapsed")) {
      icon.classList.replace("fa-chevron-left", "fa-chevron-right");
    } else {
      icon.classList.replace("fa-chevron-right", "fa-chevron-left");
    }
  }
};
// document.addEventListener("DOMContentLoaded", setActiveMenu);
// document.addEventListener("DOMContentLoaded", syncSidebarRegistry);

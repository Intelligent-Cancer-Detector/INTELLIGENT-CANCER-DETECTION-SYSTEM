window.syncHeaderWithDatabase = async function () {
  const hospId = localStorage.getItem("icds_hospital_id");
  const docNameFromSession = localStorage.getItem("icds_user_name");

const clockEl = document.getElementById("liveClock");

if (clockEl) {
  const now = new Date();
  clockEl.textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}
  // ✅ ALWAYS set name first
  const doctorEl = document.getElementById("dbDoctorName");
  if (doctorEl) {
    doctorEl.textContent = docNameFromSession || "Medical Staff";
  }

  if (!hospId) return;

  try {
    const response = await fetch(
      `http://localhost:5000/api/hospitals/${hospId}`,
    );

    const data = await response.json();

    if (data.success) {
      const hospEl = document.getElementById("dbHospitalName");

      if (hospEl) {
        hospEl.textContent = data.hospital.name;
      }

      if (data.hospital.logo_url) {
        document.getElementById("dbHospLogo").src = data.hospital.logo_url;
      }
    }
  } catch (e) {
    console.log("Offline mode");

    const hospEl = document.getElementById("dbHospitalName");
    if (hospEl) {
      hospEl.textContent = localStorage.getItem("icds_hospital") || "Hospital";
    }
  }
};

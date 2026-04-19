import { API_PATHS } from "../utils/apiPaths.js";
import api from "../utils/axiosInstance.js";

let generatedOTP = "";
let timerInterval;
let currentFormData = null;

console.log("Registration system ready!");

function checkHospitalEmail() {
  const email = document.getElementById("hospitalEmail").value;
  const match = email.match(/@(.+)$/);
  if (match && match[1].toLowerCase() === "gmail.com") {
    document.getElementById("aiSuggestText").innerHTML = "My Hospital";
    document.getElementById("aiSuggest").classList.add("show");
  } else {
    document.getElementById("aiSuggest").classList.remove("show");
  }
}

function applyAISuggestion() {
  document.getElementById("hospitalName").value =
    document.getElementById("aiSuggestText").innerHTML;
  document.getElementById("aiSuggest").classList.remove("show");
}

const passwordInput = document.getElementById("password");
passwordInput.addEventListener("input", () => {
  checkPasswordStrength();
});

function checkPasswordStrength() {
  const password = document.getElementById("password").value;
  const fill = document.getElementById("strengthFill");
  const text = document.getElementById("strengthText");
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;
  if (/[^A-Za-z0-9]/.test(password)) strength += 25;
  fill.style.width = strength + "%";
  if (strength < 25) {
    fill.style.background = "#ef4444";
    text.innerText = "Weak password";
  } else if (strength < 50) {
    fill.style.background = "#f59e0b";
    text.innerText = "Fair password";
  } else if (strength < 75) {
    fill.style.background = "#3b82f6";
    text.innerText = "Good password";
  } else {
    fill.style.background = "#10b981";
    text.innerText = "Strong password";
  }
}

const confirmPasswordInput = document.getElementById("confirmPassword");
confirmPasswordInput.addEventListener("input",checkPasswordMatch)
passwordInput.addEventListener("input",checkPasswordMatch)

// use the above since no arguments are being passed in to the check password function

// confirmPasswordInput.addEventListener("input", () => {
//   checkPasswordMatch();
// });
// passwordInput.addEventListener("input", () => {
//   checkPasswordMatch();
// });

function checkPasswordMatch() {
  const pwd = document.getElementById("password").value;
  const confirm = document.getElementById("confirmPassword").value;
  if (pwd && confirm && pwd !== confirm) {
    document.getElementById("confirmPassword").style.borderColor = "#ef4444";
  } else if (pwd && confirm && pwd === confirm) {
    document.getElementById("confirmPassword").style.borderColor = "#10b981";
  } else {
    document.getElementById("confirmPassword").style.borderColor = "#e2e8f0";
  }
}

function highlightField(field) {
  field.style.border = "2px solid #ef4444";
  field.style.backgroundColor = "#fef2f2";
  setTimeout(() => {
    field.style.border = "1.5px solid #e2e8f0";
    field.style.backgroundColor = "white";
  }, 3000);
}

function validateAll() {
  let missingFields = [];

  const hospitalEmail = document.getElementById("hospitalEmail");
  const hospitalName = document.getElementById("hospitalName");
  const hospitalType = document.getElementById("hospitalType");
  const address = document.getElementById("address");
  const city = document.getElementById("city");
  const phone = document.getElementById("phone");
  const fullName = document.getElementById("fullName");
  const designation = document.getElementById("designation");
  const department = document.getElementById("department");
  const adminEmail = document.getElementById("adminEmail");
  const adminPhone = document.getElementById("adminPhone");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const agreeTerms = document.getElementById("agreeTerms");
  const agreePrivacy = document.getElementById("agreePrivacy");

  if (!hospitalEmail.value) {
    missingFields.push("Institution Email");
    highlightField(hospitalEmail);
  }
  if (!hospitalName.value) {
    missingFields.push("Institution Name");
    highlightField(hospitalName);
  }
  if (!hospitalType.value) {
    missingFields.push("Institution Type");
    highlightField(hospitalType);
  }
  if (!address.value) {
    missingFields.push("Street Address");
    highlightField(address);
  }
  if (!city.value) {
    missingFields.push("City");
    highlightField(city);
  }
  if (!phone.value) {
    missingFields.push("Main Phone");
    highlightField(phone);
  }
  if (!fullName.value) {
    missingFields.push("Full Name");
    highlightField(fullName);
  }
  if (!designation.value) {
    missingFields.push("Designation");
    highlightField(designation);
  }
  if (!department.value) {
    missingFields.push("Department");
    highlightField(department);
  }
  if (!adminEmail.value) {
    missingFields.push("Work Email");
    highlightField(adminEmail);
  }
  if (!adminPhone.value) {
    missingFields.push("Direct Phone");
    highlightField(adminPhone);
  }
  if (!username.value) {
    missingFields.push("Username");
    highlightField(username);
  }
  if (!password.value) {
    missingFields.push("Password");
    highlightField(password);
  }

  if (
    password.value &&
    confirmPassword.value &&
    password.value !== confirmPassword.value
  ) {
    missingFields.push("Passwords do not match");
    highlightField(confirmPassword);
  }

  if (password.value && password.value.length < 6) {
    missingFields.push("Password must be at least 6 characters");
    highlightField(password);
  }

  if (!agreeTerms.checked) {
    missingFields.push("Accept Terms & Conditions");
  }
  if (!agreePrivacy.checked) {
    missingFields.push("Accept Privacy Policy");
  }

  if (missingFields.length > 0) {
    alert(
      "❌ Please fill the following required fields:\n\n• " +
        missingFields.join("\n• "),
    );
    return false;
  }

  return true;
}

function getFormData() {
  return {
    hospital: {
      email: document.getElementById("hospitalEmail").value,
      name: document.getElementById("hospitalName").value,
      type: document.getElementById("hospitalType").value,
      address: document.getElementById("address").value,
      city: document.getElementById("city").value,
      phone: document.getElementById("phone").value,
      state: document.getElementById("state").value,
      postal_code: document.getElementById("postalCode").value,
      country: document.getElementById("country").value || "Kenya",
      size: document.getElementById("hospitalSize").value,
      license: document.getElementById("licenseNumber").value,
      year: document.getElementById("yearEstablished").value,
      emergency: document.getElementById("emergencyContact").value,
    },
    admin: {
      fullName: document.getElementById("fullName").value,
      designation: document.getElementById("designation").value,
      department: document.getElementById("department").value,
      email: document.getElementById("adminEmail").value,
      phone: document.getElementById("adminPhone").value,
      license: document.getElementById("adminLicense").value,
      mobile: document.getElementById("adminMobile").value,
      alternative: document.getElementById("alternativeContact").value,
    },
    security: {
      username: document.getElementById("username").value,
      password: document.getElementById("password").value,
    },
  };
}

function sendOTP(email) {
  generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("OTP:", generatedOTP);
  alert(
    `📧 Verification code sent to: ${email}\n\nYour OTP is: ${generatedOTP}`,
  );
  return generatedOTP;
}

function showVerificationSection(email) {
  document
    .querySelectorAll(".section")
    .forEach((s) => (s.style.display = "none"));
  document.querySelector(".submit-section").style.display = "none";

  const verificationSection = document.getElementById("verificationSection");
  verificationSection.style.display = "block";
  document.getElementById("verifyEmail").innerText = email;

  let timeLeft = 300;
  const timerEl = document.getElementById("timer");
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timerEl.innerHTML = `Code expires in: ${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerEl.innerHTML = "Code expired! Please resend.";
    }
    timeLeft--;
  }, 1000);
}

function moveToNext(current, next) {
  const cur = document.getElementById("code" + current);
  if (cur.value.length >= 1) {
    const nxt = document.getElementById("code" + next);
    if (nxt) nxt.focus();
    if (next === 6) verifyOTP();
  }
}

// async function verifyOTP() {
//   let code = "";
//   for (let i = 1; i <= 6; i++)
//     code += document.getElementById("code" + i).value;

//   if (code.length < 6) {
//     alert("Please enter the 6-digit verification code");
//     return;
//   }

//   if (code !== generatedOTP) {
//     alert("❌ Invalid verification code! Please try again.");
//     return;
//   }

//   if (timerInterval) clearInterval(timerInterval);

//   document.getElementById("loadingOverlay").classList.add("active");
//   const result = await saveToDatabase(currentFormData);
//   document.getElementById("loadingOverlay").classList.remove("active");

//   if (result.success) {
//     alert("✅ Registration Successful!\n\nRedirecting to login page...");
//     setTimeout(() => (window.location.href = "login.html"), 2000);
//   } else {
//     alert("❌ Registration failed: " + result.error);
//   }
// }

function resendOTP() {
  console.log("hello from resendOTP");
  //   const email = document.getElementById("adminEmail").value;
  //   generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  //   alert(`📧 New code sent to: ${email}\n\nYour new OTP is: ${generatedOTP}`);
  //   for (let i = 1; i <= 6; i++) document.getElementById("code" + i).value = "";
  //   document.getElementById("code1").focus();
}

async function submitRegistration() {
  if (!validateAll()) return;
  const data = getFormData();
  console.log(data);
  // const res = await fetch("http://localhost:5000/api/auth/register", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(data),
  // });

  try {
    const res = await api.post(API_PATHS.AUTH.REGISTER, data);
    const result = res.data;
    if (result.success) {
      alert("✅ Registration successful");
    } else {
      alert("❌ " + result.error);
    }
  } catch (error) {
    // console.error(error);
    if (error.response) {
      alert("❌ " + error.response.data.error);
    } else {
      alert("❌ Network error");
    }
  }
  //   sendOTP(currentFormData.admin.email);
  //   showVerificationSection(currentFormData.admin.email);
}

// Test Mode: Ctrl+Shift+E
document.addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.shiftKey && e.key === "E") {
    e.preventDefault();

    document.getElementById("hospitalEmail").value = "info@myhospital.com";
    document.getElementById("hospitalName").value = "My Hospital";
    document.getElementById("hospitalType").value = "private";
    document.getElementById("hospitalSize").value = "medium";
    document.getElementById("address").value = "Nyeri, Kenya";
    document.getElementById("city").value = "Nyer";
    document.getElementById("state").value = "Nyeri County";
    document.getElementById("postalCode").value = "00100";
    document.getElementById("country").value = "Kenya";
    document.getElementById("phone").value = "+254700000000";
    document.getElementById("fullName").value = "Dr. Isaac Ireri";
    document.getElementById("designation").value = "medical-director";
    document.getElementById("department").value = "administration";
    document.getElementById("adminEmail").value = "mugwimiisaac230@gmail.com";
    document.getElementById("adminPhone").value = "+254700000000";
    document.getElementById("username").value = "Isaac";
    document.getElementById("password").value = "Test123";
    document.getElementById("confirmPassword").value = "Test123";
    document.getElementById("agreeTerms").checked = true;
    document.getElementById("agreePrivacy").checked = true;

    const allFields = [
      "hospitalEmail",
      "hospitalName",
      "hospitalType",
      "address",
      "city",
      "phone",
      "fullName",
      "designation",
      "department",
      "adminEmail",
      "adminPhone",
      "username",
      "password",
    ];
    allFields.forEach((fid) => {
      const f = document.getElementById(fid);
      if (f && f.value) f.style.border = "1.5px solid #10b981";
    });

    alert("✅ Test data loaded! Click Complete Registration.");
  }
});
window.submitRegistration = submitRegistration;

export const BASE_URL = window.ENV.API_BASE_URL;

export const API_PATHS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
  },
  DASHBOARD_DATA: {
    DASHBOARD: (hospitalId) => `/dashboard/${hospitalId}`,
    RECENT_ASSESSMENTS: (hospitalId) =>
      `/dashboard/${hospitalId}/recent-assessments`,
    ALERTS: (hospitalId) => `/dashboard/${hospitalId}/alerts`,
  },
  PATIENT_HISTORY_DATA: {
    PATIENT_ASSESSMENT: (hospitalId) =>
      `/patient_assessment/patient-history/${hospitalId}`,
  },
};

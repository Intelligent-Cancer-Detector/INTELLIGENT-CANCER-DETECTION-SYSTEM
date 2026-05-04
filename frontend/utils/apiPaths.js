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
      `/patient-assessment/patient-history/${hospitalId}`,
    NEW_PATIENT_ASSESSMENT: (hospitalId) =>
      `/new-patient-assessment/${hospitalId}/save-patient-assessment`,
  },
  HOSPITAL: {
    GET_HOSPITAL: (hospitalId) => `/hospital/${hospitalId}`,
    UPDATE_HOSPITAL: (hospitalId) => `/hospital/${hospitalId}/update-hospital`,
    GET_STATS: (hospitalId) => `/hospital/${hospitalId}/hospital-stats`,

    GET_STAFF: (hospitalId) => `/hospital/${hospitalId}/staff`,
    ADD_STAFF: (hospitalId) => `/hospital/${hospitalId}/staff/add-staff`,

    GET_DEPARTMENTS: (hospitalId) => `/hospital/${hospitalId}/department`,
    ADD_DEPARTMENT: (hospitalId) =>
      `/hospital/${hospitalId}/department/add-department`,
  },

  // analytics endpoints
  ANALYTICS: {
  GET_ALL: (id) => `/analytics/${id}`,
}
};

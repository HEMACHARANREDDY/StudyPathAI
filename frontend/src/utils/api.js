import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 30000,
});

export const dreamMapperAPI = {
  generateProfile: (data) => API.post("/dream/profile", data),
  getUniversities: (profile) => API.post("/dream/universities", profile),
};

export const sopAPI = {
  generateSOP: (data) => API.post("/sop/generate", data),
  roastSOP: (text) => API.post("/sop/roast", { text }),
  improveSOP: (text, feedback) => API.post("/sop/improve", { text, feedback }),
};

export const loanAPI = {
  checkEligibility: (profile) => API.post("/loan/eligibility", profile),
  processAdmit: (admitData) => API.post("/loan/process-admit", admitData),
  submitKYC: (kycData) => API.post("/loan/kyc/submit", kycData),
  applyForLoan: (applicationData) => API.post("/loan/apply", applicationData),
};

export const journeyAPI = {
  generatePlan: (profile) => API.post("/journey/plan", profile),
  getDailyTask: (profile) => API.post("/journey/daily-task", profile),
};

// CREATING AXIOS INSTANCE
import axios from "https://cdn.jsdelivr.net/npm/axios@1.2.1/+esm";
import { BASE_URL } from "./apiPaths.js";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default api;
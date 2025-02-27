import axios from "axios";

const useInternalAPI = import.meta.env.VITE_USE_INTERNAL_API === "true";
const apiBaseUrl = useInternalAPI
  ? "/api" // Internal proxy route
  : import.meta.env.VITE_EXTERNAL_API_BASE; // External API


const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
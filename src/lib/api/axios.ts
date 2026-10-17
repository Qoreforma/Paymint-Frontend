import axios from "axios";
import { queryClient } from "../queryClient";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1"
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if(token) config.headers.Authorization = `Bearer ${token}`;
    // Guard against hanging read requests without timing out critical debit mutations
    if(config.method?.toLowerCase() === "get" && !config.timeout) {
        config.timeout = 30000;
    }
    return config;
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url;

    if (
      status === 401 &&
      !requestUrl?.includes("/auth/login") &&
      !requestUrl?.includes("/auth/register") &&
      !requestUrl?.includes("/auth/change-password") &&
      !requestUrl?.includes("/auth/social/google/signin") 
    ) {
      // Token expired or invalid: clear session and cached queries
      try {
        queryClient.clear();
      } catch {
        // fail-safe
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
    }

    return Promise.reject(error);
  }
);

export default api;
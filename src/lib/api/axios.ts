import axios from "axios";
import { queryClient } from "../queryClient";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1"
});

export const APP_CHANNEL = "web";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if(token) config.headers.Authorization = `Bearer ${token}`;

    // Always attach channel and app version headers for backend telemetry & channel detection
    config.headers["x-channel"] = APP_CHANNEL;
    config.headers["x-app-version"] = APP_VERSION;

    // Guard against hanging read requests without timing out critical debit mutations
    if(config.method?.toLowerCase() === "get" && !config.timeout) {
        config.timeout = 30000;
    }

    // Safely attach channel & version to /auth/register and /auth/login bodies where explicitly supported
    if (
        config.data &&
        typeof config.data === "object" &&
        !(config.data instanceof FormData) &&
        !Array.isArray(config.data)
    ) {
        const url = config.url || "";
        if (url.includes("/auth/register") || url.includes("/auth/login")) {
            if (!config.data.channel) config.data.channel = APP_CHANNEL;
            if (!config.data.version && !config.data.appVersion) config.data.version = APP_VERSION;
        }
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
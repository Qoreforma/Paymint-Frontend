import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://js.billpadi.com/api/v1"
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if(token) config.headers.Authorization = `Bearer ${token}`;
    return config;
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url;
    // const hasAuthHeader = !!error.config?.headers?.Authorization;

    if (
      status === 401 &&
      !requestUrl?.includes("/auth/login") &&
      !requestUrl?.includes("/auth/register") &&
      !requestUrl?.includes("/auth/change-password") &&
      !requestUrl?.includes("/auth/social/google/signin") 
    ) {
      console.log("redirect to login")
      // Token expired or invalid
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
    }

    return Promise.reject(error);
  }
);

export default api;
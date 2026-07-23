import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // The backend is on port 8080 based on server.js defaults
  withCredentials: true, // Important for cookies
});

// While we use HTTP-Only cookies for the JWT, we'll keep this interceptor
// around in case the frontend still relies on a localStorage token for whatever reason.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/register" && path !== "/") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;

import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
});

// Request Interceptor
API.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      "REQUEST GOING TO:",
      config.baseURL + config.url
    );

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        localStorage.removeItem("token");
        window.location.href = "/";
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      return API.post("/auth/refresh", {}, {
        headers: { Authorization: `Bearer ${refreshToken}` }
      })
        .then((res) => {
          const newToken = res.data?.token;
          if (newToken) {
            localStorage.setItem("token", newToken);
            API.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return API(originalRequest);
          }
          // fallback: clear and redirect
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          window.location.href = "/";
          return Promise.reject(error);
        })
        .catch((err) => {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          window.location.href = "/";
          return Promise.reject(err);
        });

    }

    return Promise.reject(error);
  }
);

export default API;




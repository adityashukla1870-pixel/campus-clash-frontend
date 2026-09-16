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
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Token refresh — single-flight and recursion-safe.
//
// 1. The refresh call uses raw axios (not the API instance), so a 401 from
//    /auth/refresh itself can never re-enter this interceptor. Without this,
//    a dead refresh token causes infinite recursive refresh calls.
// 2. Parallel 401s (page data + notification poll) share one in-flight
//    refresh request instead of each spawning their own.
// ---------------------------------------------------------------------------
let refreshPromise = null;

function doRefresh() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    return Promise.reject(new Error("No refresh token"));
  }
  return axios
    .post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {}, {
      headers: { Authorization: `Bearer ${refreshToken}` },
      timeout: 5000,
    })
    .then((res) => {
      const newToken = res.data?.token;
      if (!newToken) {
        throw new Error("No token in refresh response");
      }
      localStorage.setItem("token", newToken);
      return newToken;
    });
}

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function clearSessionAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  // Only navigate when we're actually on a protected page — otherwise a
  // stale token on a public page (landing/login) would reload-loop.
  if (window.location.pathname !== "/" && window.location.pathname !== "/login") {
    window.location.href = "/";
  }
}

// Response Interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Refresh only once per request, and never for the refresh call itself.
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      return refreshAccessToken()
        .then((newToken) => {
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return API(originalRequest);
        })
        .catch((err) => {
          clearSessionAndRedirect();
          return Promise.reject(err);
        });
    }

    return Promise.reject(error);
  }
);

export default API;

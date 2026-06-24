import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
});

API.interceptors.request.use((config) => {
  console.log("REQUEST GOING TO:", config.baseURL + config.url);
  return config;
});

export default API;




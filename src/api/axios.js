import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000",
  timeout: 5000
});

// debug interceptor
API.interceptors.request.use((config) => {
  console.log("REQUEST GOING TO:", config.baseURL + config.url);
  return config;
});

export default API;




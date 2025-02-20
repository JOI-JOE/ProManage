// src/api/authClient.js
import axios from "axios";
import { addAuthHeader } from "./interceptors/addAuthHeader";
import { handle401Error } from "./interceptors/handle401Error";

const authClient = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Sử dụng interceptor cho request
authClient.interceptors.request.use(addAuthHeader, (error) =>
  Promise.reject(error)
);
authClient.interceptors.response.use((response) => response, handle401Error);

export default authClient;

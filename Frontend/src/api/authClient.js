import axios from "axios";
import { addAuthHeader } from "./interceptors/addAuthHeader";
import { handle401Error } from "./interceptors/handle401Error";

const API_BASE_URL = "http://localhost:8000/api"; // Dễ chỉnh sửa khi cần

const authClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptors: Tự động thêm token vào request
authClient.interceptors.request.use(addAuthHeader, (error) =>
  Promise.reject(error)
);

// Interceptors: Xử lý lỗi 401 (Token hết hạn, đăng xuất, v.v.)
authClient.interceptors.response.use((response) => response, handle401Error);

export default authClient;

import axios from "axios";

// Tạo instance Axios
const Authen = axios.create({
  baseURL: "http://localhost:8000/api", // URL của Laravel backend
  withCredentials: true, // Nếu dùng Laravel Sanctum thì giữ nguyên
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Thêm token vào headers (nếu có)
Authen.interceptors.request.use((config) => {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi response
Authen.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default Authen;

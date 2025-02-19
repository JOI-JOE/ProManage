import axios from "axios";

const Authen = axios.create({
    baseURL: "http://localhost:8000/api", // URL của Laravel backend
    withCredentials: true, // Cho phép gửi cookie xác thực (nếu dùng Laravel Sanctum)
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    }
});


Authen.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});


export default Authen;

import axios from "axios";

const Authen = axios.create({
    baseURL: "http://localhost:8000/api", // URL của Laravel backend
    withCredentials: true, // Cho phép gửi cookie xác thực (nếu dùng Laravel Sanctum)
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    }
});

export default Authen;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";

const GoogleAuth = () => {
  const navigate = useNavigate();
  const { setToken, token } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Kiểm tra token và chuyển hướng nếu đã đăng nhập
  useEffect(() => {
    if (token) {
      navigate("/home");
    }
  }, [token, navigate]);

  // Xử lý callback từ Google OAuth (khi backend redirect về)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    const idMember = urlParams.get("idMember");
    const errorMessage = urlParams.get("error");
    const message = urlParams.get("message");

    if (errorMessage) {
      setError(decodeURIComponent(message) || "Đăng nhập thất bại. Vui lòng thử lại.");
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (tokenParam) {
      setIsLoading(true);
      try {
        // Lưu token vào localStorage và context
        localStorage.setItem("auth_token", tokenParam);
        setToken(tokenParam);

        // Lưu idMember nếu cần (tùy vào yêu cầu của bạn)
        if (idMember) {
          localStorage.setItem("idMember", idMember);
        }

        // Xóa query parameters khỏi URL
        window.history.replaceState({}, document.title, window.location.pathname);

        // Chuyển hướng đến trang home
        navigate("/home");
      } catch (err) {
        setError("Không thể xử lý đăng nhập. Vui lòng thử lại.");
        console.error("Authentication error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [navigate, setToken]);

  // Xử lý đăng nhập với Google
  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Gọi API để lấy URL chuyển hướng từ backend
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
      const response = await axios.get(`${apiBaseUrl}/api/auth/redirect/google`);

      // Chuyển hướng đến URL Google OAuth do backend cung cấp
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error("Không thể lấy URL đăng nhập Google.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không thể kết nối đến server. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <button
        onClick={handleLogin}
        className="flex items-center justify-center w-full px-4 py-2 text-white bg-gray-900 rounded-lg shadow-md hover:bg-gray-800 transition duration-300 disabled:opacity-50"
        disabled={isLoading}
      >
        <FcGoogle className="mr-2" size={16} />
        <span>{isLoading && "Đang xử lý..."}</span>
      </button>
      {error && (
        <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
      )}
    </div>
  );
};

export default GoogleAuth;
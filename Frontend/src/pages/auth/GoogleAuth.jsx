import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";
import { FcGoogle } from "react-icons/fc";

const GoogleAuth = () => {
  const navigate = useNavigate();
  const { setToken } = useStateContext();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const idMember = urlParams.get("idMember");

    if (token) {
      setToken(token); // Lưu vào Context + localStorage (chỉ 1 lần)

      if (idMember) {
        // Lưu idMember vào Cookie
        document.cookie = `idMember=${idMember}; path=/; expires=${new Date(
          new Date().getTime() + 7 * 24 * 60 * 60 * 1000 // 7 ngày
        ).toUTCString()}`;
      }

      navigate("/home"); // Chuyển hướng sau khi đăng nhập
    }
  }, []);

  const handleLogin = () => {
    window.location.href = "http://127.0.0.1:8000/api/auth/redirect/google";
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center justify-center w-full px-4 py-2 text-white bg-gray-900 rounded-lg shadow-md hover:bg-gray-800 transition duration-300 mb-2"
    >
      <FcGoogle className="text-xl" />
      <span className="text-sm font-medium">Đăng nhập với Google</span>
    </button>
  );
};

export default GoogleAuth;

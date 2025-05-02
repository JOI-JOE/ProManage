import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import Cookies from "js-cookie";
import LogoLoading from "../../components/Common/LogoLoading";

const GoogleAuth = () => {
  const navigate = useNavigate();
  const { setToken, token, setLinkInvite } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  // const inviteToken = location.state?.inviteToken;


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    const idMember = urlParams.get("idMember");
    const errorMessage = urlParams.get("error");
    const message = urlParams.get("message");
    // Mời của bảng
    // mời của worksace - hâu
    const invitationWorkspace = Cookies.get("invitation");

    const inviteTokenWhenUnauthenticated = localStorage.getItem(
      "inviteTokenWhenUnauthenticated"
    );

    if (errorMessage) {
      setError(
        decodeURIComponent(message) || "Đăng nhập thất bại. Vui lòng thử lại."
      );
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (tokenParam) {
      setIsLoading(true);
      try {
        // Lưu token vào localStorage và context
        localStorage.setItem("token", tokenParam);
        setToken(tokenParam);

        let invitePath = null;
        if (inviteTokenWhenUnauthenticated) {
          // Trường hợp 1: Có inviteToken
          localStorage.removeItem("inviteTokenWhenUnauthenticated");
          invitePath = `/accept-invite/${inviteTokenWhenUnauthenticated}`;
        } else if (invitationWorkspace) {
          // Trường hợp 2: Có invitationWorkspace
          try {
            const decoded = decodeURIComponent(invitationWorkspace); // Giảm bớt một lần decode
            console.log("Decoded invitationWorkspace:", decoded); // Debug
            const [prefix, workspaceId, token] = decoded.split(":");
            if (prefix === "workspace" && workspaceId && token) {
              invitePath = `/invite/${workspaceId}/${token}`;
              console.log("Set invitePath from invitationWorkspace:", invitePath);
            } else {
              console.warn("Invalid invitationWorkspace format:", decoded);
            }
          } catch (err) {
            console.error("Error decoding invitationWorkspace:", err);
          }
        }
        // Lưu link mời vào inviteToken
        setLinkInvite(invitePath);
        // Lưu idMember nếu cần (tùy vào yêu cầu của bạn)
        if (idMember) {
          localStorage.setItem("idMember", idMember);
        }
        // Xóa query parameters khỏi URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        // // ✅ Nếu có inviteToken khi chưa đăng nhập, chuyển sang accept-invite
        // if (inviteTokenWhenUnauthenticated) {
        //   localStorage.removeItem("inviteTokenWhenUnauthenticated");
        //   setTimeout(() => {
        //     navigate(`/accept-invite/${inviteTokenWhenUnauthenticated}`);
        //   }, 50); // Delay nhẹ để đảm bảo Router mount kịp
        // } else {
        //   navigate("/home");
        // }
      } catch (err) {
        setError("Không thể xử lý đăng nhập. Vui lòng thử lại.");
        console.error("Authentication error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [navigate, setToken]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Gọi API để lấy URL chuyển hướng từ backend
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
      const response = await axios.get(
        `${apiBaseUrl}/api/auth/redirect/google`
      );

      // Chuyển hướng đến URL Google OAuth do backend cung cấp
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error("Không thể lấy URL đăng nhập Google.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể kết nối đến server. Vui lòng thử lại."
      );
      setIsLoading(false);
    }
  };

  if (token) return null;

  return (
    <div className="flex flex-col items-center w-full max-w-md space-y-3">
      {isLoading ? (
        // Khi đang loading
        <LogoLoading />
      ) : (
        // Khi không loading
        <button
          onClick={handleLogin}
          className="flex items-center justify-center w-full px-4 py-2 text-white bg-gray-900 rounded-lg shadow-md hover:bg-gray-800 transition duration-300"
        >
          <FcGoogle className="mr-2" size={18} />
        </button>
      )}

      {/* Hiển thị lỗi nếu có */}
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </div>
  );
};

export default GoogleAuth;

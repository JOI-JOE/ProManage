import { useEffect } from "react";
import { IoLogoGithub } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";

const GitHubAuth = () => {
  const navigate = useNavigate();
  const { setToken } = useStateContext();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      setToken(token); // Lưu vào Context + localStorage (chỉ 1 lần)
      navigate("/home"); // Chuyển hướng sau khi đăng nhập
    }else{
        navigate("/login");
    }
  }, [navigate]);

  const handleLoginGitHub = () => {
    window.location.href = "http://127.0.0.1:8000/auth/redirect";
  };

  return (
    <button
      onClick={handleLoginGitHub}
      className="flex items-center justify-center w-full px-4 py-2 text-white bg-gray-900 rounded-lg shadow-md hover:bg-gray-800 transition duration-300 mb-2"
    >
      <IoLogoGithub size={20} className="mr-2" />
      Login with GitHub
    </button>
  );
};

export default GitHubAuth;
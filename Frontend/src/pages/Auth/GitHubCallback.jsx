import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const GitHubCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    // console.log(auth_token);
    if (token) {
      localStorage.setItem("token", token);
      navigate("/"); // Hoặc trang cần chuyển hướng
    } else {
      navigate("/login");
    }
  }, [navigate, searchParams]);

  return <h2>Đang xác thực...</h2>;
};

export default GitHubCallback;

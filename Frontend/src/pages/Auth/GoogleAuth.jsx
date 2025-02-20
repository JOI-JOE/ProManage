import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";

const GoogleAuth = () => {
    const navigate = useNavigate();
    const { setToken } = useStateContext();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (token) {
            setToken(token); // Lưu vào Context + localStorage (chỉ 1 lần)
            navigate("/w/lam9424/home"); // Chuyển hướng sau khi đăng nhập
        }
    }, []);

    const handleLogin = () => {
        window.location.href = "http://127.0.0.1:8000/api/auth/redirect";
    };

    return <button onClick={handleLogin}>Login with Google</button>;
};

export default GoogleAuth;

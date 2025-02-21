import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/useUser";
import { handle401Error } from "../../api/interceptors/handle401Error";
import GoogleAuth from "./GoogleAuth";
import { IoLogoGithub } from "react-icons/io";

const LoginForm = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { mutate: login, isLoading, error } = useLogin();

    const handleSubmit = (e) => {
        e.preventDefault();
        login(
            { email, password },
            {
                onSuccess: (data) => {
                    console.log("Đăng nhập thành công:", data);
                    localStorage.setItem("token", data.token);
                    navigate("/home"); // ✅ Điều hướng sau khi đăng nhập
                },
                onError: (err) => {
                    console.error("Lỗi đăng nhập:", err);
                    handle401Error(err, navigate); // ✅ Truyền navigate vào đây
                },
            }
        );
    };
    const handleGitHubLogin = () => {
        window.location.href = "/auth/github"; // Example redirect URL
    };


    return (
        <>
            <div>
                <h2>Đăng nhập</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                </form>
                {error && <p style={{ color: "red" }}>Lỗi: {error.message}</p>}
            </div>

            <button
                onClick={handleGitHubLogin}
                className="flex items-center justify-center w-full px-4 py-2 text-white bg-gray-900 rounded-lg shadow-md hover:bg-gray-800 transition duration-300"
            >
                <IoLogoGithub size={20} className="mr-2" />
                Login with GitHub
            </button>
            <GoogleAuth />
        </>
    );
};

export default LoginForm;

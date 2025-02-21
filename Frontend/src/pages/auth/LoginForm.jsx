import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/useUser";
import { handle401Error } from "../../api/interceptors/handle401Error";
import GoogleAuth from "./GoogleAuth";
import { IoLogoGithub } from "react-icons/io";
import GitHubAuth from "./GitHubAuth";

const LoginForm = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { mutate: login, isLoading, error } = useLogin();


     const [formData, setFormData] = useState({
            email: "",
            password: "",
        });
        const [errors, setErrors] = useState({
            email: "",
            password: "",
            general: "",
        });
 
        const handleChange = (e) => {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value,
            });
            setErrors({ ...errors, [e.target.name]: "" });
        };

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
  
    return (
        <section className="bg-[#1693E1] min-h-screen flex items-center justify-center">
        <div className="container mx-auto">
            <div className="flex justify-center">
                <div className="w-full max-w-[525px] rounded-lg bg-white py-16 px-10 text-center sm:px-12 md:px-[60px]">
                    <div className="mb-10 text-center md:mb-16">TRELLO</div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                className={`w-full rounded-md border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-primary ${errors.email ? "border-red-500" : "border-gray-300"}`}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div className="mb-4">
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                className={`w-full rounded-md border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-primary ${errors.password ? "border-red-500" : "border-gray-300"}`}
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>

                        {errors.general && <p className="text-red-500 text-sm mb-4">{errors.general}</p>}

                        <div className="mb-10">
                            <button type="submit" className="w-full px-4 py-3 bg-indigo-500 hover:bg-indigo-700 rounded-md text-white">
                                Login
                            </button>
                        </div>
                    </form>

                    {/* <button
                        onClick={handleGitHubLogin}
                        className="flex items-center justify-center w-full px-4 py-2 text-white bg-gray-900 rounded-lg shadow-md hover:bg-gray-800 transition duration-300"
                    >
                        <IoLogoGithub size={20} className="mr-2" />
                        Login with GitHub
                    </button> */}
                    <GitHubAuth/>

                    {/* <button> */}
                    <GoogleAuth />
                    {/* </button> */}

                    {/* <Link to="/forgot-password" className="mt-4 block text-base text-[#adadad] hover:text-primary hover:underline">
                        Forgot Password?
                    </Link> */}

                    <p className="text-base text-[#adadad] mt-2">
                        Don't have an account?
                        {/* <Link to="/register" className="text-primary hover:underline ml-1">
                            Sign Up
                        </Link> */}
                    </p>
                </div>
            </div>
        </div>
    </section>
    );
};

export default LoginForm;

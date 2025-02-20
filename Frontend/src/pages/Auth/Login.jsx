import { IoLogoGithub } from "react-icons/io";
import React, { useState } from "react";
// import GoogleAuth from './GoogleAuth';
import GoogleAuth from './GoogleAuth'; // Correct: Auth/GoogleAuth.jsx

import { Link, useNavigate } from "react-router-dom";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({
        email: "",
        password: "",
        general: "",
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        // Basic client-side validation (you should also have server-side validation)
        let isValid = true;
        const newErrors = { ...errors };

        if (!formData.email) {
            newErrors.email = "Email is required";
            isValid = false;
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = "Invalid email format";
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
            isValid = false;
        }

        setErrors(newErrors);

        if (isValid) {
            try {
                // Here you would make your API call
                const response = await fetch('/api/login', {  // Replace with your API endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (response.ok) {
                    const data = await response.json();
                    // Store the token or user data (e.g., in localStorage)
                    localStorage.setItem('token', data.token); // Example
                    // Redirect to the appropriate page
                    navigate('/'); // Or navigate('/dashboard') or wherever you want
                } else {
                    const errorData = await response.json(); // Get error details from the server
                    setErrors({ ...errors, general: errorData.message || "Login failed" }); // Display server error
                }
            } catch (error) {
                setErrors({ ...errors, general: "An error occurred" });
                console.error("Login Error:", error);
            }
        }
    };

    const handleGitHubLogin = () => {
        window.location.href = "/auth/github"; // Example redirect URL
    };


    return (
        <section className="bg-[#1693E1] min-h-screen flex items-center justify-center">
            <div className="container mx-auto">
                <div className="flex justify-center">
                    <div className="w-full max-w-[525px] rounded-lg bg-white py-16 px-10 text-center sm:px-12 md:px-[60px]">
                        <div className="mb-10 text-center md:mb-16">TRELLO</div>
                        <form onSubmit={handleLogin}>
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

                        <button
                            onClick={handleGitHubLogin}
                            className="flex items-center justify-center w-full px-4 py-2 text-white bg-gray-900 rounded-lg shadow-md hover:bg-gray-800 transition duration-300"
                        >
                            <IoLogoGithub size={20} className="mr-2" />
                            Login with GitHub
                        </button>

                        {/* <button> */}
                        <GoogleAuth />
                        {/* </button> */}

                        <Link to="/forgot-password" className="mt-4 block text-base text-[#adadad] hover:text-primary hover:underline">
                            Forgot Password?
                        </Link>

                        <p className="text-base text-[#adadad] mt-2">
                            Don't have an account?
                            <Link to="/register" className="text-primary hover:underline ml-1">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Login;
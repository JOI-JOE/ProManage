import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/useUser";
import FormLabel from '@mui/material/FormLabel';
import GitHubAuth from "./GitHubAuth";
import GoogleAuth from "./GoogleAuth";

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const location = useLocation();
  const inviteToken = location.state?.inviteToken;
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const { mutate: login, isLoading } = useLogin();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({ ...errors, [name]: "" }); // Clear error when user types
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({ email: "", password: "", general: "" });

    // Basic client-side validation
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: "Please enter your email." }));
      return;
    }
    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: "Please enter your password." }));
      return;
    }

    // Call the login mutation
    login(formData, {
      onSuccess: (data) => {

        localStorage.setItem("token", data.token); // Lưu token
        localStorage.setItem('user', data.user);
        // console.log("Đăng nhập thành công:", data.user);

      
        // if (inviteToken) {
        //   navigate(`/accept-invite/${inviteToken}`);
        // } else {
        //   navigate('/home');
        // }
      
        if (inviteToken) {
          navigate(`/accept-invite/${inviteToken}`);
        } else {
          if (data.user.role === "admin") {
              window.location.href = "http://localhost:8000"; // Điều hướng đến trang admin
          } else {
              navigate("/home"); // Điều hướng đến trang client
          }
      }
        // alert("Đăng nhập thành công"); // Thông báo
      },
      onError: (err) => {
        console.error("Login error:", err);

        if (err.response) {
          if (err.response.status === 401) {
            setErrors((prev) => ({
              ...prev,
              general: "Invalid email or password.",
            }));
          } else if (err.response.status === 422) {
            const serverErrors = err.response.data.errors;
            if (serverErrors) {
              setErrors((prev) => ({
                ...prev,
                email: serverErrors.email ? serverErrors.email[0] : "",
                password: serverErrors.password ? serverErrors.password[0] : "",
              }));
            }
          } else {
            setErrors((prev) => ({
              ...prev,
              general: "Login failed. Please try again later.",
            }));
          }
        } else if (err.request) {
          setErrors((prev) => ({
            ...prev,
            general: "Connection error. Please check your internet.",
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            general: "Login failed. Please try again later.",
          }));
        }
      },
    });
  };

  return (
    <section className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg p-8 shadow-lg">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <h2 className="text-2xl font-bold text-blue-500">ProManage</h2>
        </div>

        {/* Title */}
        <h3 className="text-3xl font-semibold text-center mb-6">Sign in</h3>

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <FormLabel htmlFor="email">Email</FormLabel>
          <div className="mb-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`w-full rounded-md border py-2 px-4 text-base placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <FormLabel htmlFor="password">Password</FormLabel>
          <div className="mb-4">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="******"
              className={`w-full rounded-md border py-2 px-4 text-base placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          

          {/* General Error */}
          {errors.general && (
            <p className="text-red-500 text-sm mb-4 text-center">{errors.general}</p>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full mt-4 bg-gray-800 text-white p-3 rounded-md hover:bg-gray-900 disabled:opacity-50 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Forgot Password Link */}
        <p className="text-center mt-4">
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-blue-500 hover:underline text-sm cursor-pointer"
          >
            Forgot your password?
          </button>
        </p>

        {/* Divider */}
        <p className="text-center text-gray-500 my-4">or</p>

        {/* Social Login Buttons */}
        <div className="space-y-3 cursor-pointer">
          <GoogleAuth />
          <GitHubAuth />
        </div>

        {/* Sign Up Link */}
        <p className="text-center mt-4">
          <span className="text-sm text-gray-600">Don't have an account? </span>
          <button
            onClick={() => navigate("/register")}
            className="text-blue-500 hover:underline text-sm cursor-pointer"
          >
            Sign up
          </button>
        </p>
      </div>
    </section>
  );
};

export default LoginForm;
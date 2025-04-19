import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../../hooks/useUser";
import FormLabel from '@mui/material/FormLabel';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    user_name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({
    full_name: "",
    user_name: "",
    email: "",
    password: "",
    password_confirmation: "",
    general: "",
  });
  const navigate = useNavigate();
  const { mutate: register, isLoading } = useRegister();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({ ...errors, [name]: "" }); // Xóa lỗi khi người dùng nhập lại
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({
      full_name: "",
      user_name: "",
      email: "",
      password: "",
      password_confirmation: "",
      general: "",
    });

    // Basic client-side validation
    if (!formData.full_name) {
      setErrors((prev) => ({ ...prev, full_name: "Please enter your full name." }));
      return;
    }
    if (!formData.user_name) {
      setErrors((prev) => ({ ...prev, user_name: "Please enter your username." }));
      return;
    }
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: "Please enter your email." }));
      return;
    }
    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: "Please enter your password." }));
      return;
    }
    if (!formData.password_confirmation) {
      setErrors((prev) => ({
        ...prev,
        password_confirmation: "Please confirm your password.",
      }));
      return;
    }
    if (formData.password !== formData.password_confirmation) {
      setErrors((prev) => ({
        ...prev,
        password_confirmation: "Passwords do not match.",
      }));
      return;
    }

    register(formData, {
      onSuccess: (data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          navigate("/home");
        }
      },
      onError: (err) => {
        if (err.response?.data?.errors) {
          setErrors((prev) => ({
            ...prev,
            ...err.response.data.errors,
          }));
        } else if (err.response?.status === 422) {
          setErrors((prev) => ({
            ...prev,
            general: "Invalid input data. Please check your details.",
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            general: "Registration failed. Please try again later.",
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
        <h3 className="text-3xl font-semibold text-center mb-6">Sign up</h3>

        <form onSubmit={handleSubmit}>
          {/* Full Name Field */}
          <FormLabel htmlFor="full_name">Full Name</FormLabel>
          <div className="mb-4">
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={`w-full rounded-md border py-2 px-4 text-base placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.full_name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.full_name && (
              <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
            )}
          </div>

          {/* Username Field */}
          <FormLabel htmlFor="user_name">Username</FormLabel>
          <div className="mb-4">
            <input
              type="text"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              placeholder="Enter your username"
              className={`w-full rounded-md border py-2 px-4 text-base placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.user_name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.user_name && (
              <p className="text-red-500 text-sm mt-1">{errors.user_name}</p>
            )}
          </div>

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

          {/* Password Confirmation Field */}
          <FormLabel htmlFor="password_confirmation">Confirm Password</FormLabel>
          <div className="mb-4">
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="******"
              className={`w-full rounded-md border py-2 px-4 text-base placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password_confirmation ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password_confirmation && (
              <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <p className="text-red-500 text-sm mb-4 text-center">{errors.general}</p>
          )}

          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full mt-4 bg-gray-800 text-white p-3 rounded-md hover:bg-gray-900 disabled:opacity-50 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        {/* Sign In Link */}
        <p className="text-center mt-4">
          <span className="text-sm text-gray-600">Already have an account? </span>
          <button
            onClick={() => navigate("/login")}
            className="text-blue-500 hover:underline text-sm cursor-pointer"
          >
            Sign in
          </button>
        </p>
      </div>
    </section>
  );
};

export default Register;
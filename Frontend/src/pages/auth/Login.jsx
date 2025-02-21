import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Authen from "../../Apis/Authen";

import { IoLogoGithub } from "react-icons/io";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "", // Lỗi chung (nếu có)
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({ ...errors, [e.target.name]: "" }); // Xóa lỗi khi nhập lại
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Gửi request lấy CSRF token (chỉ cần với Sanctum)
      await Authen.get("/sanctum/csrf-cookie");

      // Gửi request đăng nhập
      const response = await Authen.post("/login", formData);
      console.log(response.data);

      const token = response?.data?.token;
      const role = response?.data?.user?.role;

      if (token && role) {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        alert("Đăng nhập thành công");
        if (role === "admin") {
          window.location.href = "http://localhost:8000/admin";
        } else {
          navigate("/");
        }
        return;
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          general: "Có lỗi xảy ra trong quá trình đăng nhập",
        }));
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            email: "Email không tồn tại",
          }));
        } else if (error.response.status === 401) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            password: "Mật khẩu không đúng",
          }));
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            general: error.response.data.message || "Có lỗi xảy ra",
          }));
        }
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          general: "Không thể kết nối với server",
        }));
      }
    }
  };

  const handleGitHubLogin = (e) => {
    e.preventDefault();
    window.location.href = "http://localhost:8000/auth/redirect";
  };

  return (
    <section className="bg-[#1693E1] min-h-screen flex items-center justify-center">
      <div className="container mx-auto">
        <div className="flex justify-center">
          <div className="w-full max-w-[525px] rounded-lg bg-white py-16 px-10 text-center sm:px-12 md:px-[60px]">
            <div className="mb-10 text-center md:mb-16">TRELLO</div>
            <form onSubmit={handleLogin}>
              {/* Email Input */}
              <div className="mb-4">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className={`w-full rounded-md border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-primary ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="mb-4">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={`w-full rounded-md border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-primary ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Hiển thị lỗi chung nếu có */}
              {errors.general && (
                <p className="text-red-500 text-sm mb-4">{errors.general}</p>
              )}

              <div className="mb-10">
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-indigo-500 hover:bg-indigo-700 rounded-md text-white"
                >
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

            <Link
              to="/forgot-password"
              className="mt-4 block text-base text-[#adadad] hover:text-primary hover:underline"
            >
              Forgot Password?
            </Link>

            <p className="text-base text-[#adadad] mt-2">
              Don't have an account?
              <Link
                to="/register"
                className="text-primary hover:underline ml-1"
              >
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

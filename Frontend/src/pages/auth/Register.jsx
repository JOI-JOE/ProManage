import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../../hooks/useUser";

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    user_name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Sử dụng hook useRegister
  const { mutate, isLoading } = useRegister();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({ ...errors, [e.target.name]: "" }); // Xóa lỗi khi nhập lại
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setErrors({});

    mutate(formData, {
      onSuccess: (data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          alert("Đăng ký thành công!");
          navigate("/home");
        }
      },
      onError: (error) => {
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        } else {
          alert("Có lỗi xảy ra, vui lòng thử lại!");
        }
      },
    });
  };

  return (
    <section
      className="bg-[#1693E1] min-h-screen flex items-center justify-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url('https://i.pinimg.com/736x/64/38/b3/6438b38a762d52d83727aef56fc75863.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-[400px] bg-white rounded-lg p-10 text-center shadow-lg">
        <h3 className="mb-8 text-center text-base font-semibold text-black">
          Tạo tài khoản mới
        </h3>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="User Name"
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
            className="w-full p-3 mb-3 rounded-md border border-gray-300 bg-[#FCFDFE] h-[40px] px-5 text-sm text-body-color placeholder-[#ACB6BE] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition"
          />
          {errors.user_name && (
            <p className="text-red-500 text-sm">{errors.user_name[0]}</p>
          )}

          <input
            type="text"
            placeholder="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="w-full p-3 mb-3 rounded-md border border-gray-300 bg-[#FCFDFE] h-[40px] px-5 text-sm text-body-color placeholder-[#ACB6BE] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition"
          />
          {errors.full_name && (
            <p className="text-red-500 text-sm">{errors.full_name[0]}</p>
          )}

          <input
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 mb-3 rounded-md border border-gray-300 bg-[#FCFDFE] h-[40px] px-5 text-sm text-body-color placeholder-[#ACB6BE] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email[0]}</p>
          )}

          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 mb-3 rounded-md border border-gray-300 bg-[#FCFDFE] h-[40px] px-5 text-sm text-body-color placeholder-[#ACB6BE] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password[0]}</p>
          )}

          <input
            type="password"
            placeholder="Password Confirmation"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            className="w-full p-3 mb-3 rounded-md border border-gray-300 bg-[#FCFDFE] h-[40px] px-5 text-sm text-body-color placeholder-[#ACB6BE] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition"
          />
          {errors.password_confirmation && (
            <p className="text-red-500 text-sm">
              {errors.password_confirmation[0]}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-teal-500 text-white text-sm p-1.5 rounded-md hover:bg-teal-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-teal-500 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Register;

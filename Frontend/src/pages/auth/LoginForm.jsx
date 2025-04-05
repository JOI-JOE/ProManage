import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/useUser";
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
      setErrors((prev) => ({ ...prev, email: "Vui lòng nhập email." }));
      return;
    }
    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: "Vui lòng nhập mật khẩu." }));
      return;
    }

    // Call the login mutation
    login(formData, {
      onSuccess: (data) => {
        localStorage.setItem("token", data.token); // Lưu token

        if (inviteToken) {
          navigate(`/accept-invite/${inviteToken}`);
        } else {
          navigate("/home");
        }

        // alert("Đăng nhập thành công"); // Thông báo
      },
      onError: (err) => {
        console.error("Lỗi đăng nhập:", err);

        if (err.response) {
          // Server returned an error (e.g., 400, 401, 500)
          console.error("Lỗi từ server:", err.response.data);

          if (err.response.status === 401) {
            // Handle 401 (Unauthorized) - likely invalid credentials
            setErrors((prev) => ({
              ...prev,
              general: "Tài khoản hoặc mật khẩu không chính xác.",
            }));
          } else if (err.response.status === 422) {
            // Validation errors
            const serverErrors = err.response.data.errors;
            if (serverErrors) {
              setErrors((prev) => ({
                ...prev,
                email: serverErrors.email ? serverErrors.email[0] : "",
                password: serverErrors.password ? serverErrors.password[0] : "",
              }));
            }
          } else {
            // Other server errors
            setErrors((prev) => ({
              ...prev,
              general: "Lỗi đăng nhập. Vui lòng thử lại sau.",
            }));
          }
        } else if (err.request) {
          // Request was made but no response was received
          console.error("Lỗi không có response:", err.request);
          setErrors((prev) => ({
            ...prev,
            general: "Lỗi kết nối. Vui lòng kiểm tra internet.",
          }));
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Lỗi khác:", err.message);
          setErrors((prev) => ({
            ...prev,
            general: "Lỗi đăng nhập. Vui lòng thử lại sau.",
          }));
        }
      },
    });
  };

  return (
    <section
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url('https://i.pinimg.com/736x/64/38/b3/6438b38a762d52d83727aef56fc75863.jpg')",
      }}
    >
      <div className="w-full max-w-[400px] rounded-lg p-8 text-center shadow-lg bg-white bg-opacity-90">
        <h3 className="mb-8 text-center text-base font-semibold text-black">
          Đăng nhập vào tài khoản
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className={`w-full rounded-md border bg-[#FCFDFE] h-[40px] px-5 text-sm text-body-color placeholder-[#ACB6BE] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className={`w-full rounded-md border bg-[#FCFDFE] h-[40px] px-5 text-sm text-body-color placeholder-[#ACB6BE] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {errors.general && (
            <p className="text-red-500 text-sm mb-4">{errors.general}</p>
          )}

          <button
            type="submit"
            className="w-full bg-teal-500 text-white text-sm h-[40px] rounded-md hover:bg-teal-600 transition disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="text-center mt-3 text-sm">
          <button
            onClick={() => navigate("/forgort-password")}
            className="text-teal-500  hover:text-teal-700 transition"
          >
            Quên mật khẩu?
          </button>
        </p>

        <p className="text-center mt-3 text-sm">
          <button
            onClick={() => navigate("/register")}
            className="text-teal-500  hover:text-teal-700 transition"
          >
            Đăng ký tài khoản
          </button>
        </p>

        <p className="text-center mt-3 pb-3 text-gray-600 text-sm">
          Hoặc đăng nhập bằng
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="text-sm">
            <GitHubAuth showText={false} />
          </div>
          <div className="text-sm">
            <GoogleAuth showText={false} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginForm;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/useUser";
import GitHubAuth from "./GitHubAuth";
import GoogleAuth from "./GoogleAuth";

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
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
        console.log("Đăng nhập thành công:", data);
        localStorage.setItem("token", data.token); // Store the token
        navigate("/home"); // Redirect to home page
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
                  className={`w-full rounded-md border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-primary ${
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
                  className={`w-full rounded-md border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-primary ${
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

              <div className="mb-10">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-indigo-500 hover:bg-indigo-700 rounded-md text-white"
                >
                  {isLoading ? "Đang đăng nhập..." : "Login"}
                </button>
              </div>
            </form>

            {/* Button */}
            <GitHubAuth />
            {/* Button */}

            <GoogleAuth />
            <p className="text-base text-[#adadad] mt-2">
              Don't have an account? {/* Add a link to register if needed */}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginForm;

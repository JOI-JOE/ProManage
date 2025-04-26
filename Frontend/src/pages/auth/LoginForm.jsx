import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/useUser";
import GitHubAuth from "./GitHubAuth";
import GoogleAuth from "./GoogleAuth";
import anh4 from "../../assets/anh4.jpg";
import { useStateContext } from "../../contexts/ContextProvider";
import Cookies from "js-cookie";

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, setLinkInvite } = useStateContext();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const inviteToken = location.state?.inviteToken;
  const invitationWorkspace = Cookies.get("invitation");

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const [errorTimers, setErrorTimers] = useState({});

  const { mutate: login, isLoading } = useLogin();

  // Clear timers on component unmount
  useEffect(() => {
    return () => {
      Object.values(errorTimers).forEach((timer) => clearTimeout(timer));
    };
  }, [errorTimers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({ ...errors, [name]: "" });

    if (errorTimers[name]) {
      clearTimeout(errorTimers[name]);
      setErrorTimers((prev) => {
        const newTimers = { ...prev };
        delete newTimers[name];
        return newTimers;
      });
    }
  };

  const setErrorWithTimeout = (fieldName, errorMessage, duration = 5000) => {
    const errorDuration =
      fieldName === "password" || fieldName === "general" || fieldName === "email"
        ? 15000
        : duration;

    setErrors((prev) => ({ ...prev, [fieldName]: errorMessage }));

    if (errorTimers[fieldName]) {
      clearTimeout(errorTimers[fieldName]);
    }

    const timerId = setTimeout(() => {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
      setErrorTimers((prev) => {
        const newTimers = { ...prev };
        delete newTimers[name];
        return newTimers;
      });
    }, errorDuration);

    setErrorTimers((prev) => ({ ...prev, [fieldName]: timerId }));
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      // Client-side validation
      if (!formData.email) {
        setErrorWithTimeout("email", "Vui lòng nhập email.");
        return;
      }
      if (!formData.password) {
        setErrorWithTimeout("password", "Vui lòng nhập mật khẩu.");
        return;
      }

      // Call login mutation
      login(formData, {
        onSuccess: (data) => {

          console.log("Đăng nhập thành công:", data);
          localStorage.setItem("token", data.token);
          setToken(data.token);
          if (inviteToken) {
            setLinkInvite(`/accept-invite/${inviteToken}`);
            navigate(`/accept-invite/${inviteToken}`);
          } else if (invitationWorkspace) {
            const decoded = decodeURIComponent(decodeURIComponent(invitationWorkspace));
            const [prefix, workspaceId, token] = decoded.split(":");
            if (prefix === "workspace" && workspaceId && token) {
              setLinkInvite(`/invite/${workspaceId}/${token}`);
              navigate(`/invite/${workspaceId}/${token}`);
            } else {
              setLinkInvite(null);
            }
          } else {
            setLinkInvite(null);
          }
        },
        onError: (err) => {
          console.error("Lỗi đăng nhập:", {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
          });

          if (err.response) {
            const { status, data } = err.response;
            console.log("Phản hồi từ server:", data);

            if (status === 401) {
              if (data?.password) {
                setErrorWithTimeout("password", data.password);
              } else if (data?.message && typeof data.message === "string") {
                setErrorWithTimeout("password", data.message);
              } else {
                setErrorWithTimeout("general", "Tài khoản hoặc mật khẩu không chính xác.");
              }
            } else if (status === 404) {
              if (data?.email) {
                setErrorWithTimeout("email", data.email);
              } else {
                setErrorWithTimeout("email", data?.message || "Email không tồn tại trong hệ thống.");
              }
            } else if (status === 422) {
              const validationErrors = data.errors || {};
              if (validationErrors.email) {
                setErrorWithTimeout("email", validationErrors.email[0]);
              }
              if (validationErrors.password) {
                setErrorWithTimeout("password", validationErrors.password[0]);
              }
            } else {
              setErrorWithTimeout(
                "general",
                data?.message || "Có lỗi xảy ra. Vui lòng thử lại sau."
              );
            }
          } else {
            console.error("Lỗi không có phản hồi:", err);
            setErrorWithTimeout(
              "general",
              "Không thể kết nối đến server. Vui lòng thử lại."
            );
          }
        },
      });
    } catch (error) {
      console.error("Lỗi trong handleSubmit:", error);
      setErrorWithTimeout("general", "Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  return (
    <section
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${anh4}')`,
      }}
    >
      <div className="w-full max-w-xs rounded-lg p-6 shadow-lg bg-white bg-opacity-95">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Đăng nhập</h2>
          <p className="text-sm text-gray-600 mt-1">Đăng nhập để tiếp tục</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-gray-700 mb-1 ml-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
              className={`w-full rounded-md border bg-white h-10 px-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-100 transition ${errors.email ? "border-red-500" : "border-gray-300"
                }`}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-gray-700 ml-1"
              >
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")} // Fixed typo: forgort -> forgot
                className="text-xs text-teal-600 hover:text-teal-800 transition"
                disabled={isLoading}
              >
                Quên mật khẩu?
              </button>
            </div>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              className={`w-full rounded-md border bg-white h-10 px-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-100 transition ${errors.password ? "border-red-500" : "border-gray-300"
                }`}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>
            )}
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
              {errors.general}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-teal-600 text-white font-medium py-2 px-4 text-sm rounded hover:bg-teal-700 transition shadow-sm disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative flex items-center justify-center">
            <div className="border-t w-full border-gray-300"></div>
            <div className="absolute bg-white px-2 text-xs text-gray-500">
              hoặc
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex justify-center">
              <GitHubAuth showText={false} />
            </div>
            <div className="flex justify-center">
              <GoogleAuth showText={false} />
            </div>
          </div>
        </div>

        <p className="text-center mt-4 text-xs text-gray-600">
          Chưa có tài khoản?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-teal-600 font-medium hover:text-teal-800 transition"
            disabled={isLoading}
          >
            Đăng ký
          </button>
        </p>
      </div>
    </section>
  );
};

export default LoginForm;
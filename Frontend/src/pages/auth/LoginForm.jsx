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

  const [formData, setFormData] = useState({ email: "", password: "" });
  const location = useLocation();
  const inviteToken = location.state?.inviteToken;
  const invitationWorkspace = Cookies.get("invitation");

  // Pending của workspace
  // Nếu đã có token => kiểm tra xem có pending invite không

  // -----------------------------------------------------
  const { setToken, setLinkInvite } = useStateContext();



  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  // Add state to track error timers
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

    // Clear the timer for this field if it exists
    if (errorTimers[name]) {
      clearTimeout(errorTimers[name]);
      setErrorTimers((prev) => {
        const newTimers = { ...prev };
        delete newTimers[name];
        return newTimers;
      });
    }
  };

  // Function to set errors with timeout
  const setErrorWithTimeout = (fieldName, errorMessage, duration = 5000) => {
    // Longer duration for password and authentication errors (15 seconds)
    const errorDuration =
      fieldName === "password" ||
        fieldName === "general" ||
        fieldName === "email"
        ? 15000
        : duration;

    setErrors((prev) => ({ ...prev, [fieldName]: errorMessage }));

    // Clear any existing timer for this field
    if (errorTimers[fieldName]) {
      clearTimeout(errorTimers[fieldName]);
    }

    // Set new timer
    const timerId = setTimeout(() => {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
      setErrorTimers((prev) => {
        const newTimers = { ...prev };
        delete newTimers[fieldName];
        return newTimers;
      });
    }, errorDuration);

    // Store the timer
    setErrorTimers((prev) => ({ ...prev, [fieldName]: timerId }));
  };

  // Thay đổi cách quản lý các thông báo lỗi để đảm bảo chúng tồn tại đủ lâu
  const handleSubmit = (e) => {
    e.preventDefault();
    // Kiểm tra validation phía client
    if (!formData.email) {
      setErrorWithTimeout("email", "Vui lòng nhập email.");
      return;
    }
    if (!formData.password) {
      setErrorWithTimeout("password", "Vui lòng nhập mật khẩu.");
      return;
    }
    console.log(inviteToken)
    // Gọi mutation login
    login(formData, {
      onSuccess: (data) => {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        if (inviteToken) {
          setLinkInvite(`/accept-invite/${inviteToken}`);
        } else if (invitationWorkspace) {
          // Giải mã và xử lý invitationWorkspace
          const decoded = decodeURIComponent(decodeURIComponent(invitationWorkspace));
          const [prefix, workspaceId, token] = decoded.split(":");
          if (prefix === "workspace" && workspaceId && token) {
            setLinkInvite(`/invite/${workspaceId}/${token}`);
          } else {
            setLinkInvite(null); // Nếu dữ liệu không hợp lệ
          }
        } else {
          setLinkInvite(null);
        }
      },
      onError: (err) => {
        console.error("Lỗi đăng nhập:", err);
        // Đảm bảo lỗi đăng nhập được hiển thị đủ lâu
        if (err.response && err.response.status === 401) {
          // Kiểm tra lỗi cụ thể từ server (nếu có)
          const errorData = err.response.data;
          // Nếu lỗi liên quan đến email không tồn tại
          if (errorData && errorData.email) {
            setErrorWithTimeout("email", "Email không tồn tại.");
          } else if (errorData && errorData.password) {
            setErrorWithTimeout("password", "Mật khẩu không đúng.");
          } else {
            // Thông báo lỗi chung nếu không xác định được lỗi cụ thể
            setErrorWithTimeout(
              "general",
              "Tài khoản hoặc mật khẩu không chính xác."
            );
          }
        } else if (err.response && err.response.status === 422) {
          // Xử lý lỗi validation
          const validationErrors = err.response.data.errors;
          if (validationErrors) {
            if (validationErrors.email) {
              setErrorWithTimeout("email", validationErrors.email[0]);
            }
            if (validationErrors.password) {
              setErrorWithTimeout("password", validationErrors.password[0]);
            }
          }
        } else if (err.response && err.response.status === 404) {
          // Lỗi email không tồn tại
          setErrorWithTimeout("email", "Email không tồn tại trong hệ thống.");
        } else {
          // Xử lý các lỗi khác
          setErrorWithTimeout(
            "general",
            "Có lỗi xảy ra. Vui lòng thử lại sau."
          );
        }
      },
    });
  };



  return (
    <section
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("${anh4}")`,
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
                onClick={() => navigate("/forgort-password")}
                className="text-xs text-teal-600 hover:text-teal-800 transition"
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
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 ml-1">
                {errors.password}
              </p>
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
          >
            Đăng ký
          </button>
        </p>
      </div>
    </section>
  );
};

export default LoginForm;

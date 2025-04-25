import React, { useEffect, useState } from "react";
import { useUpdatePass } from "../../hooks/useUser";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import anh4 from "../../assets/anh4.jpg";

const UpdatePass = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [email, setEmail] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [message, setMessage] = useState("");
  const { mutate: updatepass, isLoading } = useUpdatePass();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailFromURL = params.get("email");
    if (emailFromURL) {
      setEmail(emailFromURL);
    }
  }, [location]);

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu");
      return;
    }
    if (!confirmpassword) {
      setConfirmPasswordError("Vui lòng nhập lại mật khẩu");
      return;
    }
    if (password !== confirmpassword) {
      setConfirmPasswordError("Mật khẩu nhập lại không khớp");
      return;
    }

    updatepass(
      { email, password },
      {
        onSuccess: () => {
          toast.success("Đổi mật khẩu thành công!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          setPassword("");
          setConfirmpassword("");
          navigate("/login");
        },
        onError: (err) =>
          setError(
            err?.response?.data?.error || "Có lỗi sảy ra vui lòng thử lại"
          ),
      }
    );
  };

  return (
    <section
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("${anh4}")`,
      }}
    >
      <div className="w-full max-w-xs bg-white rounded-md p-4 shadow-lg">
        {/* Logo */}
        <div className="flex justify-center mb-3">
          <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-center mb-3 text-gray-800">
          Đổi mật khẩu mới
        </h3>

        <form onSubmit={handleUpdateSubmit} className="space-y-3">
          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className={`w-full rounded-md border py-1.5 px-2 text-xs placeholder-gray-400 outline-none focus:ring-1 focus:ring-blue-500 transition-all ${
                  passwordError ? "border-red-500" : "border-gray-300"
                }`}
              />
              <span className="absolute right-2 top-1.5 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3 h-3"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                  ></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
            </div>
            {passwordError && (
              <p className="text-red-500 text-xs mt-1">{passwordError}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmpassword"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                type="password"
                id="confirmpassword"
                name="confirmpassword"
                autoComplete="new-password"
                value={confirmpassword}
                onChange={(e) => setConfirmpassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className={`w-full rounded-md border py-1.5 px-2 text-xs placeholder-gray-400 outline-none focus:ring-1 focus:ring-blue-500 transition-all ${
                  confirmPasswordError ? "border-red-500" : "border-gray-300"
                }`}
              />
              <span className="absolute right-2 top-1.5 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3 h-3"
                >
                  <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4zm0 2a2 2 0 0 1 2 2v2H10V6a2 2 0 0 1 2-2zm-8 6h16v10H4V10z"></path>
                </svg>
              </span>
            </div>
            {confirmPasswordError && (
              <p className="text-red-500 text-xs mt-1">
                {confirmPasswordError}
              </p>
            )}
          </div>

          {/* Success Message */}
          {message && (
            <div className="bg-green-50 p-1.5 rounded">
              <p className="text-green-600 text-xs text-center">{message}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-3 bg-teal-600 text-white py-1.5 px-2 rounded text-xs hover:bg-teal-700 disabled:opacity-50 transition-colors font-medium shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-3 text-center">
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center px-3 py-1.5 text-teal-600 font-medium text-xs hover:text-teal-800 hover:underline transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3 h-3 mr-1.5 text-teal-600"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    </section>
  );
};

export default UpdatePass;

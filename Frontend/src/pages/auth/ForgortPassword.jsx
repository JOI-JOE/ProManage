import { useState } from "react";
import { useForgotPassword } from "../../hooks/useUser";
import { useNavigate } from "react-router-dom";
import FormLabel from "@mui/material/FormLabel";
import anh4 from "../../assets/anh4.jpg";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { mutate: forgotpass, isLoading } = useForgotPassword();

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email) {
      setError("Vui lòng nhập email của bạn");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Vui lòng nhập email hợp lệ");
      return;
    }
    console.log(email);

    forgotpass(
      { email },
      {
        onSuccess: () => {
          navigate(`/verify-code?email=${email}`);
        },
        onError: (err) => {
          setError(
            err?.response?.data?.error || "Có lỗi sảy ra vui lòng thử lại"
          );
        },
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
        {/* Logo Placeholder */}
        <div className="flex justify-center mb-3">
          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-teal-500"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-center mb-1 text-gray-800">
          Quên mật khẩu
        </h3>

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <div className="relative">
              <input
                type="text"
                id="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                className={`w-full rounded-md border py-1.5 px-2 text-xs placeholder-gray-400 outline-none focus:ring-1 focus:ring-blue-500 transition-all ${
                  error ? "border-red-500" : "border-gray-300"
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
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
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
            {isLoading ? "Đang gửi..." : "Gửi Email"}
          </button>
        </form>

        {/* Back to Login Link */}
        <button
          onClick={() => navigate("/login")}
          className="flex items-center justify-center w-full mt-2 py-1 text-teal-600 hover:text-teal-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-2.5 h-2.5 mr-1"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span className="text-xs">Quay lại đăng nhập</span>
        </button>
      </div>
    </section>
  );
};

export default ForgotPassword;

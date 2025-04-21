// VerifyCodePage.jsx
import { FormLabel } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useCheckCode, useForgotPassword } from "../../hooks/useUser";
import { useLocation, useNavigate } from "react-router-dom";

const VerifyCodePage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { mutate: checkcode, isLoading } = useCheckCode();
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailFromURL = params.get('email');
    if (emailFromURL) {
      setEmail(emailFromURL);  // Lưu email vào state
    }
  }, [location]);
  // console.log(email)

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    

    if (!code) {
      setError("Vui lòng nhập mã code");
      return;
    }
    checkcode({ email, code },
      {
        onSuccess: () => 
          
          navigate(`/update-password?email=${email}`),
        onError: (err) => {
          setError(err?.response?.data?.error || "Có lỗi xảy ra. Vui lòng thử lại!");
        },

      }


    )

    // Logic xác nhận mã code, ví dụ: gửi tới API
    // mutate(code, {
    //   onSuccess: () => setMessage("Code is valid!"),
    //   onError: (err) => setError("Invalid code."),
    // });
  };

  return (
    <section className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg p-8 shadow-lg">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <h2 className="text-2xl font-bold text-blue-500">ProManage</h2>
        </div>

        {/* Title */}


        <form onSubmit={handleCodeSubmit} >
          {/* Email Field */}
          <FormLabel htmlFor="email">Code:</FormLabel>
          <div className="mb-4">
            <input
              type="text"
              name="code"
              autoComplete="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code"
              className={`w-full rounded-md border py-2 px-4 text-base placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : "border-gray-300"
                }`}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          {/* Success Message */}
          {message && <p className="text-green-600 text-sm mb-4 text-center">{message}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 bg-gray-800 text-white p-3 rounded-md hover:bg-gray-900 disabled:opacity-50 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Code"}
          </button>
        </form>

        {/* Back to Login Link */}
        <p className="text-center mt-4">
          <button
            onClick={() => navigate("/login")}
            className="text-blue-500 hover:underline text-sm cursor-pointer"
          >
            Back to Sign in
          </button>
        </p>
      </div>
    </section>
  );
};

export default VerifyCodePage;

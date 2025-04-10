import { useState } from "react";
import { useForgotPassword } from "../../hooks/useUser";
import { useNavigate } from "react-router-dom";
import FormLabel from '@mui/material/FormLabel';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { mutate:forgotpass, isLoading } = useForgotPassword();

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
    console.log(email)

    forgotpass({email}, {
      
      onSuccess: () => {
        navigate(`/verify-code?email=${email}`)
      },
      onError: (err) =>
       {
        setError(err?.response?.data?.error || "Có lỗi sảy ra vui lòng thử lại");
       }
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
        <h3 className="text-3xl font-semibold text-center mb-6">Forgot Password</h3>

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <FormLabel htmlFor="email">Email</FormLabel>
          <div className="mb-4">
            <input
              type="text"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={`w-full rounded-md border py-2 px-4 text-base placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? "border-red-500" : "border-gray-300"
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
            {isLoading ? "Sending..." : "Send Email"}
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

export default ForgotPassword;
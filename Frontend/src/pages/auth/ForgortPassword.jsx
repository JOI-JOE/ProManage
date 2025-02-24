import { useState } from "react";
import { useForgotPassword } from "../../hooks/useUser";
import { Navigate, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { mutate, isLoading, isSuccess, isError } = useForgotPassword();

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // mutate(email, {
    //   onSuccess: (data) =>
    //     setMessage("Vui lòng kiểm tra email để đặt lại mật khẩu!"),
    //   onError: (err) => setError("Có lỗi xảy ra. Vui lòng thử lại!"),
    // });
    mutate(email, {
      onSuccess: () => setMessage("Vui lòng kiểm tra email để đặt lại mật khẩu!"),
      onError: (err) => setError(err?.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại!"),
    });
  };

  return (
    <section className="bg-[#1693E1] min-h-screen flex items-center justify-center">
      <div className="container mx-auto">
        <div className="flex justify-center">
          <div className="w-full max-w-[525px] rounded-lg bg-white py-16 px-10 text-center sm:px-12 md:px-[60px]">
            <div className="mb-10 text-center md:mb-16 text-xl font-bold">
              TRELLO
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className={`w-full rounded-md border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-primary ${
                    error ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
              </div>

              <div className="mb-10">
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-indigo-500 hover:bg-indigo-700 rounded-md text-white disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang gửi..." : "Gửi mật khẩu mới"}
                </button>
              </div>
            </form>

            {message && <p className="text-green-600">{message}</p>}
            {error && <p className="text-red-600">{error}</p>}

            <button
              onClick={() => navigate("/login")} // Sử dụng navigate đã khai báo ở trên
              className="text-blue-500 hover:underline"
            >
              Quay về trang đăng nhập
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;

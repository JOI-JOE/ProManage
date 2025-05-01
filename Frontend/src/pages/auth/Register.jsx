import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRegister } from "../../hooks/useUser";
import anh4 from "../../assets/anh4.jpg";
import { useStateContext } from "../../contexts/ContextProvider";

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
  const location = useLocation();
  const { setToken } = useStateContext();


  // Lấy email và token từ query string
  const query = new URLSearchParams(location.search);
  const inviteEmail = query.get("email") || "";
  const inviteToken = query.get("token") || "";
  console.log("inviteEmail", inviteEmail);
  console.log("inviteToken", inviteToken);


  // Cập nhật email từ query string khi component mount
  useEffect(() => {
    if (inviteToken) {
      localStorage.setItem("inviteToken", inviteToken);
    }
    if (inviteEmail) {
      setFormData((prev) => ({ ...prev, email: inviteEmail }));
    }
  }, [inviteToken, inviteEmail]);
  

  const { mutate, isLoading } = useRegister();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Hàm chuyển đổi thông báo lỗi sang tiếng Việt
  const translateErrorMessage = (fieldName, message) => {
    // Danh sách các thông báo lỗi thường gặp và bản dịch
    const errorTranslations = {
      // Các lỗi chung
      "The field is required.": "Trường này là bắt buộc.",
      "This field is required.": "Trường này là bắt buộc.",
      "Please fill out this field.": "Vui lòng điền vào trường này.",

      // Lỗi liên quan đến email
      "The email must be a valid email address.": "Email không đúng định dạng.",
      "The email has already been taken.": "Email này đã được sử dụng.",
      "Please enter a valid email address.":
        "Vui lòng nhập địa chỉ email hợp lệ.",

      // Lỗi liên quan đến mật khẩu
      "The password must be at least 8 characters.":
        "Mật khẩu phải có ít nhất 8 ký tự.",
      "The password confirmation does not match.":
        "Xác nhận mật khẩu không khớp.",
      "The password confirmation must match.":
        "Xác nhận mật khẩu phải trùng khớp.",

      // Lỗi liên quan đến tên người dùng
      "The user name has already been taken.":
        "Tên đăng nhập này đã được sử dụng.",
      "The user name must be at least 3 characters.":
        "Tên đăng nhập phải có ít nhất 3 ký tự.",
      "The user name may not be greater than 20 characters.":
        "Tên đăng nhập không được vượt quá 20 ký tự.",

      // Lỗi liên quan đến họ tên
      "The full name must be at least 3 characters.":
        "Họ và tên phải có ít nhất 3 ký tự.",
      "The full name may not be greater than 50 characters.":
        "Họ và tên không được vượt quá 50 ký tự.",

      "The password field confirmation does not match.":
        "Xác nhận mật khẩu không khớp.",
      "Password confirmation does not match password.":
        "Mật khẩu xác nhận không trùng với mật khẩu.",
      "The two password fields didn't match.":
        "Hai trường mật khẩu không khớp nhau.",
      "Passwords do not match.": "Các mật khẩu không trùng khớp.",
      "Password and confirm password do not match.":
        "Mật khẩu và xác nhận mật khẩu không trùng khớp.",

      "The user name field is required.": "Trường tên đăng nhập là bắt buộc.",
      "The email field is required.": "Trường email là bắt buộc.",
      "The password field is required.": "Trường mật khẩu là bắt buộc.",
      "The full name field is required.": "Trường họ và tên là bắt buộc.",
      "The password confirmation field is required.":
        "Trường xác nhận mật khẩu là bắt buộc.",
      "Field is required.": "Trường này là bắt buộc.",
    };

    // Nếu có bản dịch cho thông báo lỗi, sử dụng nó
    if (errorTranslations[message]) {
      return errorTranslations[message];
    }

    // Nếu không có bản dịch, giữ nguyên thông báo
    return message;
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setErrors({});
    // Nếu có inviteToken mà email không khớp, bỏ qua inviteToken
    let effectiveInviteToken = inviteToken;
    // if (inviteToken && formData.email !== inviteEmail) {
    //   setErrors((prev) => ({
    //     ...prev,
    //     email: 'Email phải khớp với email trong lời mời.',
    //   }));
    //   effectiveInviteToken = null; // Bỏ inviteToken nếu email không khớp
    // } else {
    //   setErrors({});
    // }

    mutate(formData, {
      onSuccess: (data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          // const storedInviteToken = localStorage.getItem("inviteToken");
          if (effectiveInviteToken) {
            // localStorage.removeItem("inviteToken");
            setTimeout(() => {
              navigate(`/accept-invite/${effectiveInviteToken}`);
            }, 50); // Delay nhẹ để đảm bảo Router mount kịp
          } else {
            navigate("/home");
          }
        }
      },
      onError: (error) => {
        if (error.response?.data?.errors) {
          // Dịch các thông báo lỗi sang tiếng Việt
          const translatedErrors = {};

          for (const field in error.response.data.errors) {
            translatedErrors[field] = error.response.data.errors[field].map(
              (msg) => translateErrorMessage(field, msg)
            );
          }

          setErrors(translatedErrors);
        } else {
          setErrors({ general: "Có lỗi xảy ra, vui lòng thử lại!" });
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
      <div className="w-full max-w-xs rounded-md p-5 shadow-md bg-white bg-opacity-95">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Tạo tài khoản</h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="Tên đăng nhập"

              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              className={`w-full rounded border bg-white h-9 px-3 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-100 transition ${errors.user_name ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.user_name && (
              <p className="text-red-500 text-xs mt-0.5 ml-1">
                {errors.user_name[0]}
              </p>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Họ và tên"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className={`w-full rounded border bg-white h-9 px-3 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-100 transition ${errors.full_name ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.full_name && (
              <p className="text-red-500 text-xs mt-0.5 ml-1">
                {errors.full_name[0]}
              </p>
            )}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!!inviteEmail}
              className={`w-full rounded border bg-white h-9 px-3 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-100 transition ${errors.email ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-0.5 ml-1">
                {errors.email[0]}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Mật khẩu"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full rounded border bg-white h-9 px-3 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-100 transition ${errors.password ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-0.5 ml-1">
                {errors.password[0]}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              className={`w-full rounded border bg-white h-9 px-3 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-100 transition ${errors.password_confirmation
                ? "border-red-500"
                : "border-gray-300"
                }`}
            />
            {errors.password_confirmation && (
              <p className="text-red-500 text-xs mt-0.5 ml-1">
                {errors.password_confirmation[0]}
              </p>
            )}
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded text-xs">
              {errors.general}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-teal-600 text-white font-medium py-1.5 px-3 text-xs rounded hover:bg-teal-700 transition shadow-sm disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
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
              "Đăng ký"
            )}
          </button>
        </form>

        <p className="text-center mt-4 text-xs text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-teal-600 font-medium hover:text-teal-800 transition"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
// VerifyCodePage.jsx
import { FormLabel } from "@mui/material";
import React, { useEffect, useState } from "react";
import {  useUpdatePass } from "../../hooks/useUser";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const UpdatePass = () => {
   const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmpassword] = useState('');

  const [email, setEmail] = useState('');
  const [passwordError, setPasswordError] = useState(''); // Lỗi cho password
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [message, setMessage] = useState('');
    const { mutate:updatepass, isLoading } = useUpdatePass();
    const location = useLocation();
    useEffect(() => {
      const params = new URLSearchParams(location.search);
      const emailFromURL = params.get('email');
      if (emailFromURL) {
        setEmail(emailFromURL);  // Lưu email vào state
      }
    }, [location]);
    // console.log(email)
  
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
    updatepass({email,password},
      {
        onSuccess: () => {
          toast.success("Đổi mật khẩu thành công!", {
            position: "top-right", // Góc trên bên phải
            autoClose: 3000, // Tự động đóng sau 3 giây
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          setPassword("");
          setConfirmpassword("");
           navigate("/login"); // Uncomment nếu muốn chuyển hướng
        },
        onError: (err) =>
          setError(err?.response?.data?.error || "Có lỗi sảy ra vui lòng thử lại"),
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

 
         <form onSubmit={handleUpdateSubmit} >
           {/* Email Field */}
           <FormLabel htmlFor="email">Password</FormLabel>
           <div className="mb-4">
             <input
               type="password"
               name="password"
               autoComplete="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               placeholder="Enter your password"
               className={`w-full rounded-md border py-2 px-4 text-base placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 ${
                passwordError ? "border-red-500" : "border-gray-300"
               }`}
             />
             {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
           </div>
           <FormLabel htmlFor="email">Confirm password</FormLabel>
           <div className="mb-4">
             <input
               type="password"
               name="confirmpassword"
               autoComplete="confirmpassword"
               value={confirmpassword}
               onChange={(e) => setConfirmpassword(e.target.value)}
               placeholder="Enter your confirmpassword"
               className={`w-full rounded-md border py-2 px-4 text-base placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 ${
                confirmPasswordError ? "border-red-500" : "border-gray-300"
               }`}
             />
             {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
           </div>
 
           {/* Success Message */}
           {message && <p className="text-green-600 text-sm mb-4 text-center">{message}</p>}
 
           {/* Submit Button */}
           <button
             type="submit"
             className="w-full mt-4 bg-gray-800 text-white p-3 rounded-md hover:bg-gray-900 disabled:opacity-50 cursor-pointer"
             disabled={isLoading}
           >
             {isLoading ? "Sending..." : "Send Password"}
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

export default UpdatePass;

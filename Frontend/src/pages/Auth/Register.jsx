// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Authen from "../../Apis/Authen";
// // import axios from "axios";

// const Register = () => {
//   const [formData, setFormData] = useState({
//     full_name: "",
//     user_name: "",
//     email: "",
//     password: "",
//     password_confirmation: "",
//   });
//   const [errors, setErrors] = useState({});
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//     setErrors({ ...errors, [e.target.name]: "" }); // Xóa lỗi khi nhập lại
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await Authen.post("/register", formData); // Lưu response

//       const token = response.data.token; // Lấy token từ response
//       localStorage.setItem("token", token); // Lưu token vào localStorage

//       alert("Đăng ký thành công");
//       navigate("/"); // Chuyển hướng sau khi lưu token
//     } catch (error) {
//       // console.log(error)
//       if (error.response && error.response.data.errors) {
//         setErrors(error.response.data.errors); // Cập nhật lỗi từ API
//       } else {
//         alert("Có lỗi xảy ra, vui lòng thử lại!");
//       }
//     }
//   };

//   return (
//     <section className="bg-[#1693E1] min-h-screen flex items-center justify-center">
//       <div className="w-full max-w-[525px] bg-white rounded-lg p-10 text-center shadow-lg">
//         <h2 className="mb-5">TRELLO</h2>
//         <form onSubmit={handleRegister}>
//           <input
//             type="text"
//             placeholder="User Name"
//             name="user_name"
//             onChange={handleChange}
//             className="w-full border rounded-md p-3 mb-3"
//           />
//           {errors.user_name && (
//             <p className="text-red-500 text-sm">{errors.user_name[0]}</p>
//           )}

//           <input
//             type="text"
//             placeholder="Full Name"
//             name="full_name"
//             onChange={handleChange}
//             className="w-full border rounded-md p-3 mb-3"
//           />
//           {errors.full_name && (
//             <p className="text-red-500 text-sm">{errors.full_name[0]}</p>
//           )}

//           <input
//             type="email"
//             placeholder="Email"
//             name="email"
//             onChange={handleChange}
//             className="w-full border rounded-md p-3 mb-3"
//           />
//           {errors.email && (
//             <p className="text-red-500 text-sm">{errors.email[0]}</p>
//           )}

//           <input
//             type="password"
//             placeholder="Password"
//             name="password"
//             onChange={handleChange}
//             className="w-full border rounded-md p-3 mb-3"
//           />
//           {errors.password && (
//             <p className="text-red-500 text-sm">{errors.password[0]}</p>
//           )}

//           <input
//             type="password"
//             placeholder="Password Confirmation"
//             name="password_confirmation"
//             onChange={handleChange}
//             className="w-full border rounded-md p-3 mb-3"
//           />
//           {errors.password_confirmation && (
//             <p className="text-red-500 text-sm">
//               {errors.password_confirmation[0]}
//             </p>
//           )}

//           <button
//             type="submit"
//             className="w-full bg-indigo-500 text-white p-3 rounded-md hover:bg-indigo-700"
//           >
//             Register
//           </button>
//         </form>

//         <p className="mt-4">
//           Already have an account?{" "}
//           <Link to="/login" className="text-indigo-500 hover:underline">
//             Sign In
//           </Link>
//         </p>
//       </div>
//     </section>
//   );
// };

// export default Register;

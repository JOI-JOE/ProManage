import React, { useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import Authen from "../../Apis/Authen";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "", // Thêm lỗi chung (ví dụ: không kết nối server)
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({ ...errors, [e.target.name]: "" }); // Xóa lỗi khi nhập lại
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await Authen.post('/login', formData); // Lưu response
      const token = response?.data?.token;
      const role = response?.data?.user?.role;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role) // Lưu token vào localStorage
     if(token && role){
      if(role === 'admin'){
        navigate('/dashboard');
      }else{
        navigate('/');
      }
      alert('Đăng nhập thành công');
     }else{
      alert('Có lỗi xảy ra trong quá trình tìm token và role');
     }
     
     
      // navigate('/'); // Chuyển hướng sau khi lưu token
      // console.log(role);
      
    } catch (error) {
      if (error.response) {
        // Kiểm tra mã lỗi và thông điệp từ API
        if (error.response.status === 404) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            email: "Email không tồn tại", // Lỗi email không tồn tại
          }));
        } else if (error.response.status === 401) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            password: "Mật khẩu không đúng", // Lỗi mật khẩu sai
          }));
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            general: error.response.data.message || "Có lỗi xảy ra",
          }));
        }
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          general: "Không thể kết nối với server",
        }));
      }
    }
  };


  // const handleGitHubLogin = (e) => {
  //  e.preventDefault();
  //   window.location.href = "http://localhost:8000/auth/redirect";
  // };

  return (
    <section className="bg-[#1693E1] min-h-screen flex items-center justify-center">
  <div className="container mx-auto">
    <div className="flex justify-center">
      <div className="w-full max-w-[525px] rounded-lg bg-white py-16 px-10 text-center sm:px-12 md:px-[60px]">
        <div className="mb-10 text-center md:mb-16">TRELLO</div>
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full rounded-md border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-primary focus-visible:shadow-none"
            />
            {errors.email && <span className="text-red-400 text-sm">{errors.email}</span>}
          </div>

          <div className="mb-6">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full rounded-md border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-primary focus-visible:shadow-none"
            />
            {errors.password && <span className="text-red-400 text-sm">{errors.password}</span>}
          </div>

          <div className="mb-10">
            <button type="submit" className="w-full px-4 py-3 bg-indigo-500 hover:bg-indigo-700 rounded-md text-white">
              Login
            </button>
          </div>
        </form>

        {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}

        {/* <button onClick={handleGitHubLogin} className="flex items-center justify-center w-full px-4 py-2 text-white bg-gray-900 rounded-lg shadow-md hover:bg-gray-800 transition duration-300">
          <IoLogoGithub size={20} className="mr-2" />
          Login with GitHub
        </button> */}

        <Link to="/forgot-password" className="mt-4 block text-base text-[#adadad] hover:text-primary hover:underline">
          Forgot Password?
        </Link>

        <p className="text-base text-[#adadad] mt-2">
          Don't have an account?
          <Link to="/register" className="text-primary hover:underline ml-1">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  </div>
</section>

  );
};

export default Login;
import React, { useEffect, useState } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { Navigate, Outlet } from "react-router-dom";
// import { getUser } from "../../api/models/user";
import { getUser } from "../../api/models/userApi";

const DefaultLayout = () => {
  const { token, setUser } = useStateContext(); // Lấy token và setUser từ context
  const [isLoading, setIsLoading] = useState(true); // Trạng thái loading
  const [error, setError] = useState(null); // Trạng thái lỗi

  // useEffect(() => {
  //     const fetchUser = async () => {
  //         if (token) {
  //             try {
  //                 const user = await getUser(token); // Gọi API lấy thông tin người dùng
  //                 setUser(user); // Lưu thông tin người dùng vào context
  //                 console.log(user)
  //             } catch (err) {
  //                 console.error("Lỗi lấy thông tin người dùng:", err);
  //                 setError(err); // Lưu lỗi
  //             } finally {
  //                 setIsLoading(false); // Kết thúc loading
  //             }
  //         } else {
  //             setIsLoading(false); // Nếu không có token, cũng kết thúc loading
  //         }
  //     };

  //     fetchUser();
  // }, [token, setUser]);

  //     if (!token) {
  //         return <Navigate to="/login" />;
  //     }

  //     if (isLoading) {
  //         return <div>Đang tải thông tin người dùng...</div>;
  //     }

  //     if (error) {
  //         return <div>Lỗi: {error.message}</div>; // Hoặc thông báo lỗi thân thiện hơn
  //     }

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default DefaultLayout;

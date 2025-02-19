import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token"); // Kiểm tra người dùng có đăng nhập không
  const userRole = localStorage.getItem("role"); // Lấy quyền user

  if (!token) {
    return <Navigate to="/login" replace />; // Nếu chưa đăng nhập, chuyển hướng đến Login
  }

  // Nếu có danh sách quyền, kiểm tra role
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  //   const userRole = localStorage.getItem("role"); // Giả sử role được lưu trong localStorage

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />; // Nếu không có quyền, quay về trang Home
  }

  return <Outlet />;
};

export default ProtectedRoute;

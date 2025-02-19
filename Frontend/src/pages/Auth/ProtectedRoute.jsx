import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const userRole = localStorage.getItem("role"); // Giả sử role được lưu trong localStorage

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />; // Nếu không có quyền, quay về trang Home
  }

  return <Outlet />;
};

export default ProtectedRoute;

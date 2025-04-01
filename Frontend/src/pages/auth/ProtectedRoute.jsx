// import { Navigate, Outlet } from "react-router-dom";

// const GuestRoute = () => {
//   const token = localStorage.getItem("token"); // Kiểm tra xem có token không

//   return token ? <Navigate to="/" /> : <Outlet />;
// };

// export default GuestRoute;

import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/home" />;
    }

    return <Outlet />;
};

export default ProtectedRoute;

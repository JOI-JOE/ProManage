import { Navigate , Outlet } from "react-router-dom";

const GuestRoute = () => {
    const token = localStorage.getItem('token'); // Kiểm tra xem có token không

    return token ? <Navigate to="/" /> : <Outlet />;
};

export default GuestRoute;

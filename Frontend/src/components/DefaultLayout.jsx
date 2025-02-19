import React from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { Navigate, Outlet } from "react-router-dom";

const DefaultLayout = () => {
    const { token } = useStateContext();

    // Nếu chưa đăng nhập, chuyển hướng đến /login/google
    if (!token) {
        return <Navigate to="/login/google" />;
    }
    return (
        <div>
            <div>Đây là layout chính</div>
            <Outlet />
        </div>
    );
};

export default DefaultLayout;

import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";

const GuestLayout = () => {
    const { token } = useStateContext();
    // Nếu đã đăng nhập, chuyển hướng đến /w/lam9424/home
    if (token) {
        return <Navigate to={`/home`} />;
    }
    return (
        <div>
            <Outlet />
        </div>
    );
};

export default GuestLayout;

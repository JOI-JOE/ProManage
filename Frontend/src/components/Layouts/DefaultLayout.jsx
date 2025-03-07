import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import AppBar from "../Navigation/AppBar";

const DefaultLayout = () => {
    // const { token } = useStateContext(); // Lấy token và setUser từ context
    // if (!token) {
    //     return <Navigate to="/login" />;
    // }

    return (
        <>
            <div>
                <Outlet />
            </div>
        </>
    );
};

export default DefaultLayout;

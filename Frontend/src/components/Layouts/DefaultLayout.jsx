import React from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { Navigate, Outlet } from "react-router-dom";
import AppBar from "../Navigation/AppBar";

const DefaultLayout = () => {
    const { token } = useStateContext(); // Lấy token và setUser từ context

    if (!token) {
        return <Navigate to="/login" />;
    }

    return (
        <div>
            {/* <AppBar/> */}
            <Outlet />
        </div>
    );
};

export default DefaultLayout;

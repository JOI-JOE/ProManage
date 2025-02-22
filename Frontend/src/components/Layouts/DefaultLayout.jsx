import React from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { Navigate, Outlet } from "react-router-dom";

const DefaultLayout = () => {
    const { token } = useStateContext(); // Lấy token và setUser từ context

    if (!token) {
        return <Navigate to="/login" />;
    }

    return (
        <div>
            <Outlet />
        </div>
    );
};

export default DefaultLayout;

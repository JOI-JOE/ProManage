import React, { memo, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AppBar from "../Navigation/AppBar";
import { MeProvider } from "../../contexts/MeContext";
import { useStateContext } from "../../contexts/ContextProvider";


const DefaultLayout = () => {
    const navigate = useNavigate();
    const { token } = useStateContext();
    useEffect(() => {
        if (!token) {
            navigate('/login')
        }
    }, [token, navigate])

    return (
        <MeProvider>
            <AppBar />
            <Outlet />
        </MeProvider>
    );
};

export default DefaultLayout;

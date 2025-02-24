import React from 'react'
import { Box, Container } from "@mui/material";
import AppBar from '../components/Navigation/AppBar';
import SideBar from '../components/Navigation/SideBar';
import { Outlet } from "react-router-dom";
// import { useStateContext } from '../contexts/ContextProvider';
import { useUser } from "../hooks/useUser";

const Dashboard = () => {
    const { data: user, isLoading, isError, error } = useUser(); // Sử dụng useUser

    if (isLoading) {
        return <div>Đang tải thông tin người dùng...</div>;
    }

    if (isError) {
        return <div>Lỗi: {error.message}</div>; // Hoặc thông báo lỗi thân thiện hơn
    }

    const workspaces = user.workspaces
    return (
        <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
            <AppBar username={user.user_name} email={user.email} />
            <Box sx={{ display: "flex" }}>
                <SideBar workspaces={workspaces} username={user.user_name} />
                <Box sx={{ width: "81%" }}>
                    <Outlet />
                </Box>
            </Box>
        </Container>
    )
}

export default Dashboard
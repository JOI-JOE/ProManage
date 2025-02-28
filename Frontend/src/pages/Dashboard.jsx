import React from 'react';
import { Box, Container } from "@mui/material";
import AppBar from '../components/Navigation/AppBar';
import SideBar from '../components/Navigation/SideBar';
import { Outlet } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useWorkspaces } from "../hooks/useWorkspace";

const Dashboard = () => {
    // Lấy thông tin người dùng
    const { data: user, isLoading: isUserLoading, isError: isUserError, error: userError } = useUser();

    // Lấy danh sách workspaces
    const { data: workspaces, isLoading: isWorkspacesLoading, isError: isWorkspacesError, error: workspacesError } = useWorkspaces();

    // Hiển thị loading nếu đang tải dữ liệu
    if (isUserLoading || isWorkspacesLoading) {
        return <div>Đang tải thông tin...</div>;
    }

    return (
        <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
            {/* Truyền thông tin người dùng vào AppBar */}
            <AppBar username={user.user_name} email={user.email} />

            <Box sx={{ display: "flex" }}>
                {/* Truyền danh sách workspaces và thông tin người dùng vào SideBar */}
                <SideBar workspaces={workspaces} username={user.user_name} />

                {/* Phần nội dung chính */}
                <Box sx={{ width: "81%" }}>
                    <Outlet />
                </Box>
            </Box>
        </Container>
    );
};

export default Dashboard;
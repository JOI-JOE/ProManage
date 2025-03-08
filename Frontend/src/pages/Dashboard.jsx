import React, { useContext, memo } from 'react';
import { Box, Container } from "@mui/material";
import SideBar from '../components/Navigation/SideBar';
import { Outlet } from "react-router-dom";
import { useGetWorkspaces } from "../hooks/useWorkspace";

const Dashboard = () => {

    const { data: workspaces, isLoading: isWorkspacesLoading, isError: isWorkspacesError, error: workspacesError } = useGetWorkspaces();

    if (isWorkspacesLoading) {
        return <div>Đang tải thông tin...</div>;
    }

    if (isWorkspacesError) {
        return <div>Lỗi tải dữ liệu.</div>;
    }

    return (
        <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
            <Box sx={{ display: "flex" }}>
                <SideBar workspaces={workspaces} /> {/* Use MemoizedSideBar */}
                <Box sx={{ width: "81%" }}>
                    <Outlet />
                </Box>
            </Box>
        </Container>
    );
};

export default Dashboard;
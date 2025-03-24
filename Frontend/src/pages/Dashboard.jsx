import { useDispatch } from 'react-redux';
import React, { useEffect } from 'react';
import { Box, Container } from "@mui/material";
import SideBar from '../components/Navigation/SideBar';
import { Outlet } from "react-router-dom";
import { useUserOverviewData } from '../hooks/useUser';
import { useGetWorkspaces } from "../hooks/useWorkspace";
import { setUser, setWorkspaces, setWorkspaceId, setBoardId, setError } from "../redux/slices/userSlice";
import { setStarredBoards } from '../redux/slices/starredBoardsSlice';
import { setBoards } from '../redux/slices/boardSlice';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { userInfo, userDashboard, isLoading, error } = useUserOverviewData();
    const { data: workspaces, isLoading: isWorkspacesLoading, isError: isWorkspacesError, error: workspacesError } = useGetWorkspaces();

    useEffect(() => {
        // Dispatch user info
        if (userInfo) {
            dispatch(setUser(userInfo.user));
            dispatch(setWorkspaces(userInfo.workspaces));
            dispatch(setWorkspaceId(userInfo.workspace_id));
            dispatch(setBoardId(userInfo.board_id));
        }
    }, [dispatch, userInfo]);

    useEffect(() => {
        // Dispatch userDashboard info
        if (userDashboard) {
            dispatch(setStarredBoards(userDashboard.boardStars));
            dispatch(setBoards(userDashboard.boards));
        }
    }, [dispatch, userDashboard]);

    if (error) {
        return <div>Lỗi tải thông tin người dùng: {error.message}</div>;
    }

    if (isWorkspacesLoading || isLoading) {
        return <div>Đang tải thông tin...</div>;
    }

    if (isWorkspacesError) {
        return <div>Lỗi tải workspaces: {workspacesError.message}</div>;
    }

    return (
        <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
            <Box sx={{ display: "flex" }}>
                <SideBar workspaces={workspaces} /> {/* Sử dụng SideBar */}
                <Box sx={{ width: "81%" }}>
                    <Outlet />
                </Box>
            </Box>
        </Container>
    );
};

export default Dashboard;

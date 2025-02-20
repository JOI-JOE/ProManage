import React from 'react'
import { Box, Container } from "@mui/material";
import AppBar from '../components/Navigation/AppBar';
import SideBar from '../components/Navigation/SideBar';
import { Outlet } from "react-router-dom";

const Dashboard = () => {
    return (
        <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
            <AppBar />
            <Box sx={{ display: "flex" }}>
                <SideBar />
                <Box sx={{ width: "81%" }}>
                    <Outlet />
                </Box>
            </Box>
        </Container>
    )
}

export default Dashboard
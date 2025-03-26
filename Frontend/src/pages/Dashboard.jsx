import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect } from 'react';
import { Box, Container } from "@mui/material";
import SideBar from '../components/Navigation/SideBar';
import { Outlet } from "react-router-dom";

const Dashboard = () => {
    
    return (
        <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
            <Box sx={{ display: "flex" }}>
                <SideBar /> {/* Sử dụng SideBar */}
                <Box sx={{ width: "81%" }}>
                    <Outlet />
                </Box>
            </Box>
        </Container>
    );
};

export default Dashboard;

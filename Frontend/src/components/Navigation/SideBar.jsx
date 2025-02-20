import React, { useState } from "react";
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderIcon from "@mui/icons-material/Folder";
import HomeIcon from "@mui/icons-material/Home";
import { Link } from "react-router-dom";
import WorkspaceMenu from "./WorkspaceMenu";

const workspaceData = [
    {
        id: 1,
        name: 'Vito',
        display_name: "vu109",
    },
    {
        id: 2,
        name: 'Vu',
        display_name: "vito109",
    }
]

const SideBar = () => {

    const [username, setUsername] = useState('vito109'); // Ví dụ: username được lấy từ state 

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: "19%",
                position: "absolute",
                right: "63%",
                transform: "translateX(-37%)",
                marginTop: "25px",
                "& .MuiDrawer-paper": {
                    boxSizing: "border-box",
                    color: "#ffffff",
                    position: "relative",
                    overflowY: "auto",
                    borderRight: "none",
                },
            }}
        >
            <List sx={{ borderBottom: "1px solid #D3D3D3" }}>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to={`/u/${username}/boards`}>
                        <ListItemIcon sx={{ color: "black" }}>
                            <DashboardIcon />
                        </ListItemIcon>
                        <ListItemText primary="Bảng" sx={{ color: "black" }} />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon sx={{ color: "black" }}>
                            <FolderIcon />
                        </ListItemIcon>
                        <ListItemText primary="Mẫu" sx={{ color: "black" }} />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon sx={{ color: "black" }}>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary="Trang chủ" sx={{ color: "black" }} />
                    </ListItemButton>
                </ListItem>
            </List>

            <Typography sx={{ ml: 2, mt: 2, color: "gray", fontSize: "14px" }}>
                Các không gian làm việc
            </Typography>

            {/* Truyền workspace vào WorkspaceMenu */}
            {workspaceData.map((item) => (
                <div key={item.id}>
                    <WorkspaceMenu workspace={item} />
                </div>
            ))}

        </Drawer>
    );
};

export default SideBar;

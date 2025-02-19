import React, { useEffect, useState } from 'react'
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Avatar, Typography, Collapse } from '@mui/material'
import { ExpandLess, ExpandMore } from '@mui/icons-material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import ViewKanbanIcon from '@mui/icons-material/ViewKanban'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import ViewStreamIcon from '@mui/icons-material/ViewStream'
import PeopleIcon from '@mui/icons-material/People'
import SettingsIcon from '@mui/icons-material/Settings'
import AddIcon from '@mui/icons-material/Add'
import { Link } from 'react-router-dom'
import axios from 'axios';  // Thêm import axios
import Authen from '../../../../Apis/Authen';
 


function WorkspaceMenu() {
    const [openSettings, setOpenSettings] = useState(false)
    const [hoveredItem, setHoveredItem] = useState(null)
    const [workspaces, setWorkspaces] = useState([]); // State để lưu workspace
    const [loading, setLoading] = useState(true); // State để kiểm tra trạng thái loading
    const [error, setError] = useState(null); // State để lưu lỗi (nếu có)
    

    const toggleSettings = () => {
        setOpenSettings(!openSettings)
    }

    const handleMouseEnter = (item) => {
        setHoveredItem(item)
    }

    const handleMouseLeave = () => {
        setHoveredItem(null)
    }

    
    useEffect(() => {
      // Gọi API để lấy danh sách workspace
      const fetchWorkspaces = async () => {
        try {
          const token = localStorage.getItem("token"); // Lấy token từ localStorage
          console.log(token)
          const response = await Authen.get("/workspaces"); 
          console.log(response.data);
          setWorkspaces(response.data.data); // Lưu dữ liệu workspace vào state
          setLoading(false);
        } catch (err) {
          setError("Có lỗi khi lấy dữ liệu.");
          setLoading(false);
        }
      };
  
      fetchWorkspaces();
    }, []);

    return (
        <div id="workspace_1">
   {loading && <p>Loading...</p>}
   {error && <p>{error}</p>}
          {workspaces.map((workspace) => (

  <ListItemButton key={workspace.id} onClick={toggleSettings} sx={{ display: "flex", justifyContent: "space-between" }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <ListItemIcon sx={{ color: "black" }}>
        <Avatar sx={{ bgcolor: "#5D87FF" }}>
          {workspace.name} {/* Hiển thị chữ cái đầu của tên workspace */}
        </Avatar>
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography fontWeight="bold" sx={{ whiteSpace: "nowrap", color: "black" }}>
            {workspace.name} {/* Hiển thị tên workspace */}
          </Typography>
        }
      />
    </Box>

    {openSettings ? (
      <ExpandLess sx={{ color: "black" }} />
    ) : (
      <ExpandMore sx={{ color: "black" }} />
    )}
  </ListItemButton>
  
))}

            {/* Danh sách con - Hiển thị khi mở */}
            <Collapse in={openSettings} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 4 }}>
                    <List>
                        <ListItemButton component={Link} to="/listworkspaceconten">
                            <ListItemIcon sx={{ color: "black" }}>
                                <ViewKanbanIcon />
                            </ListItemIcon>
                            <ListItemText primary="Bảng" sx={{ color: "black" }} />
                        </ListItemButton>
                        <ListItemButton>
                            <ListItemIcon sx={{ color: "black" }}>
                                <FavoriteBorderIcon />
                            </ListItemIcon>
                            <ListItemText primary="Điểm nổi bật" sx={{ color: "black" }} />
                        </ListItemButton>

                        <ListItemButton
                            onMouseEnter={() => handleMouseEnter("Hình")}
                            onMouseLeave={handleMouseLeave}
                        >
                            <ListItemIcon sx={{ color: "black" }}>
                                <ViewStreamIcon />
                            </ListItemIcon>
                            <ListItemText primary="Hình" sx={{ color: "black" }} />
                            {hoveredItem === "Hình" && (
                                <ChevronRightIcon sx={{ color: "gray" }} />
                            )}
                        </ListItemButton>

                        <ListItemButton
                            onMouseEnter={() => handleMouseEnter("Thành viên")}
                            onMouseLeave={handleMouseLeave}
                        >
                            <ListItemIcon sx={{ color: "black" }}>
                                <PeopleIcon />
                            </ListItemIcon>
                            <ListItemText primary="Thành viên" sx={{ color: "black" }} />
                            <AddIcon sx={{ color: "gray" }} />
                            {hoveredItem === "Thành viên" && (
                                <ChevronRightIcon sx={{ color: "gray" }} />
                            )}
                        </ListItemButton>

                        <ListItemButton
                            onMouseEnter={() => handleMouseEnter("Cài đặt")}
                            onMouseLeave={handleMouseLeave}
                        >
                            <ListItemIcon sx={{ color: "black" }}>
                                <SettingsIcon />
                            </ListItemIcon>
                            <ListItemText primary="Cài đặt" sx={{ color: "black" }} />
                            {hoveredItem === "Cài đặt" && (
                                <ChevronRightIcon sx={{ color: "gray" }} />
                            )}
                        </ListItemButton>
                    </List>
                </Box>
            </Collapse>
        </div>
    )
}

export default WorkspaceMenu
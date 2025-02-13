import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  Avatar,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import AddIcon from "@mui/icons-material/Add";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FolderIcon from "@mui/icons-material/Folder";
import HomeIcon from "@mui/icons-material/Home";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ViewStreamIcon from "@mui/icons-material/ViewStream";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useState } from "react";
import { Link } from "react-router-dom";

const SideBar1 = () => {
  const [openSettings, setOpenSettings] = React.useState(false);

  const toggleSettings = () => {
    setOpenSettings(!openSettings);
  };

  const [hoveredItem, setHoveredItem] = useState(null);

  const handleMouseEnter = (item) => {
    setHoveredItem(item);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };
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
          <ListItemButton component={Link} to="/">
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

      {/* Phần toggle mở rộng danh sách */}

      <ListItemButton
        onClick={toggleSettings}
        sx={{ display: "flex", justifyContent: "space-between" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ListItemIcon sx={{ color: "black" }}>
            <Avatar sx={{ bgcolor: "#5D87FF" }}>K</Avatar>
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                fontWeight="bold"
                sx={{ whiteSpace: "nowrap", color: "black" }}
              >
                Trello Không gian làm việc
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
              <ListItemIcon sx={{ color: "Black" }}>
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
              // sx={{ pl: 4 }}
              onMouseEnter={() => handleMouseEnter("Cài đặt")}
              onMouseLeave={handleMouseLeave}
            >
              <ListItemIcon sx={{ color: "Black" }}>
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
    </Drawer>
  );
};

export default SideBar1;

import * as React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Collapse,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import AddIcon from "@mui/icons-material/Add";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FolderIcon from "@mui/icons-material/Folder";

const SideBar2 = () => {
  const [openSettings, setOpenSettings] = React.useState(false);

  const toggleSettings = () => {
    setOpenSettings(!openSettings);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: "19%",
        height: (theme) =>
          `calc(${theme.trello.boardBarHeight} + ${theme.trello.boardContentHeight})`,
        borderTop: "1px solid #D3D3D3",

        "& .MuiDrawer-paper": {
          boxSizing: "border-box",
          bgcolor: "white",
          color: "#ffffff",
          position: "relative",
          overflowY: "auto", // Cho phép cuộn nếu nội dung quá dài

          "&::-webkit-scrollbar": {
            width: "6px", // Giảm kích thước scrollbar
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#B6BBBF", // Màu của thanh cuộn
            borderRadius: "6px", // Làm thanh cuộn bo tròn
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#ECF0F1", // Màu khi hover
          },
          "&::-webkit-scrollbar-track": {
            m: 2,
          },
        },
      }}
    >
      {/* Tiêu đề */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          bgcolor: "white",
          borderBottom: "1px solid #D3D3D3",
        }}
      >
        <Avatar sx={{ bgcolor: "#5D87FF" }}>K</Avatar>
        <Box>
          <Typography
            variant="body1"
            sx={{ fontWeight: "bold", color: "black" }}
          >
            Không gian làm việc của bạn...
          </Typography>
        </Box>
      </Box>

      {/* Danh sách điều hướng */}
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ color: "black", fontSize: "small" }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Bảng" sx={{ color: "black" }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ color: "black" }}>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Thành viên" sx={{ color: "black" }} />
            <AddIcon sx={{ color: "gray" }} />
          </ListItemButton>
        </ListItem>

        {/* Cài đặt không gian làm việc */}
        <ListItemButton onClick={toggleSettings}>
          <ListItemIcon sx={{ color: "black" }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText
            primary="Các cài đặt Không gian làm việc"
            sx={{ color: "black" }}
          />
          {openSettings ? (
            <ExpandLess sx={{ color: "black" }} />
          ) : (
            <ExpandMore sx={{ color: "black" }} />
          )}
        </ListItemButton>

        {/* Collapse: hiển thị hoặc ẩn danh sách con (animation mở rộng / thu nhỏ). */}
        <Collapse in={openSettings} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: "black" }}>
                <ViewKanbanIcon />
              </ListItemIcon>
              <ListItemText
                primary="Các cài đặt không gian làm việc"
                sx={{ color: "black" }}
              />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: "black" }}>
                <UpgradeIcon />
              </ListItemIcon>
              <ListItemText
                primary="Nâng cấp không gian làm việc"
                sx={{ color: "black" }}
              />
            </ListItemButton>
          </List>
        </Collapse>
      </List>

      {/* Các bảng làm việc */}
      <Typography sx={{ ml: 2, mt: 2, color: "gray", fontSize: "14px" }}>
        Các bảng của bạn
      </Typography>
      <List sx={{}}>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ color: "black" }}>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText
              primary="Test 1 "
              sx={{
                color: "black",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ color: "Black" }}>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText primary="Test" sx={{ color: "black" }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};
export default SideBar2;

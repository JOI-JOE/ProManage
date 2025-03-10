import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
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
import WorkspaceContext from "../../../../contexts/WorkspaceContext";

const SideBar = () => {
  const { currentWorkspace, isLoading, error } = useContext(WorkspaceContext); const [openSettings, setOpenSettings] = useState(false);

  const toggleSettings = () => {
    setOpenSettings(!openSettings);
  };
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: "19%",
        height: (theme) =>
          `calc( ${theme.trello.boardContentHeight} + ${theme.trello.boardBarHeight} )`,
        borderTop: "1px solid #ffffff",
        "& .MuiDrawer-paper": {
          boxSizing: "border-box",
          bgcolor: "#000",
          color: "#ffffff",
          position: "relative",
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#B6BBBF",
            borderRadius: "6px",
          },
          "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#ECF0F1" },
          "&::-webkit-scrollbar-track": { m: 2 },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          bgcolor: "#292929",
        }}
      >
        <Avatar sx={{ bgcolor: "#5D87FF" }}>K</Avatar>
        <Box>
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            {currentWorkspace?.display_name}
          </Typography>
        </Box>
      </Box>

      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to={`/w/${currentWorkspace?.name}`}>
            <ListItemIcon sx={{ color: "white" }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Bảng" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to={`/w/${currentWorkspace?.name}/members`}
          >
            <ListItemIcon sx={{ color: "white" }}>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Thành viên" />
            <AddIcon sx={{ color: "gray" }} />
          </ListItemButton>
        </ListItem>

        <ListItemButton onClick={toggleSettings}>
          <ListItemIcon sx={{ color: "white" }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Cài đặt Không gian làm việc" />
          {openSettings ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openSettings} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: "white" }}>
                <ViewKanbanIcon />
              </ListItemIcon>
              <ListItemText primary="Cài đặt không gian làm việc" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: "white" }}>
                <UpgradeIcon />
              </ListItemIcon>
              <ListItemText primary="Nâng cấp không gian làm việc" />
            </ListItemButton>
          </List>
        </Collapse>
      </List>

      <Typography sx={{ ml: 2, mt: 2, color: "gray", fontSize: "14px" }}>
        Các bảng của bạn
      </Typography>

      <List sx={{ p: 0.5 }}>
        {currentWorkspace?.boards?.map((board) => (
          <ListItem key={board.id} disablePadding sx={{ p: 1 }}>
            <ListItemButton
              component={Link}
              to={`/b/${board.id}/${board.name}`}
              sx={{
                backgroundColor:
                  board.id === Number(board.id) ? "#ffffff33" : "transparent",
                "&:hover": { backgroundColor: "#ffffff22" },
                borderRadius: "6px",
              }}
            >
              <ListItemIcon sx={{ color: "white" }}>
                <FolderIcon />
              </ListItemIcon>
              <ListItemText
                primary={board.name}
                sx={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default SideBar;

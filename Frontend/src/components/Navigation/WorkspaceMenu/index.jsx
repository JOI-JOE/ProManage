import React, { useState } from 'react'
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

import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ViewStreamIcon from "@mui/icons-material/ViewStream";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import Authen from "../../../../Apis/Authen";

function WorkspaceMenu() {
  const [openSettings, setOpenSettings] = useState({}); // Lưu trạng thái mở của từng workspace
  const [hoveredItem, setHoveredItem] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toggle trạng thái mở của workspace
  const toggleSettings = (workspaceId) => {
    setOpenSettings((prev) => ({
      ...prev,
      [workspaceId]: !prev[workspaceId],
    }));
  };

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await Authen.get("/workspaces");
        setWorkspaces(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Có lỗi khi lấy dữ liệu.");
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);


    return (
        <div id="workspace-main">
            <ListItemButton key="workspace-item" onClick={toggleSettings} sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <ListItemIcon sx={{ color: "black" }}>
                        <Avatar sx={{ bgcolor: "#5D87FF" }}>
                            L {/* Hiển thị chữ cái đầu của tên workspace */}
                        </Avatar>
                    </ListItemIcon>
                    <ListItemText
                        primary={
                            <Typography fontWeight="bold" sx={{ whiteSpace: "nowrap", color: "black" }}>
                                {workspace.name}
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

            <Collapse in={openSettings} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 4 }}>
                    <List>
                        <ListItemButton component={Link} to={`/w/${workspace.display_name}/home`}>
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
                  onMouseEnter={() => setHoveredItem("Cài đặt")}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <ListItemIcon sx={{ color: "black" }}>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Cài đặt" sx={{ color: "black" }} />
                  {hoveredItem === "Cài đặt" && <ChevronRightIcon sx={{ color: "gray" }} />}
                </ListItemButton>
              </List>
            </Box>
          </Collapse>
        </div>
      ))}
    </div>
  );
}

export default WorkspaceMenu;

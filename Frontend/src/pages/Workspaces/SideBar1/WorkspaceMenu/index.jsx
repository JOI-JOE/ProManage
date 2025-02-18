import React, { useEffect, useState } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Collapse,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  ViewKanban as ViewKanbanIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ViewStream as ViewStreamIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';

function WorkspaceMenu() {
  const [openSettings, setOpenSettings] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleSettings = () => {
    setOpenSettings(!openSettings);
  };

  const handleMouseEnter = (item) => {
    setHoveredItem(item);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  useEffect(() => {
    const fetchWorkspaces = async () => {
      const token = localStorage.getItem("token");
      console.log(token);
     
      if (token) {
        try {
          const response = await axios.get("http://127.0.0.1:8000/api/workspaces", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true, // Đảm bảo cookie được gửi cùng yêu cầu
          });
          setWorkspaces(response.data.data); // Lưu danh sách workspace vào state
          setLoading(false);
        } catch (err) {
          setError("Có lỗi khi lấy dữ liệu.");
          setLoading(false);
        }
      } else {
        setError("Chưa có token. Vui lòng đăng nhập.");
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  return (
    <div id="workspace_1">
      <ListItemButton onClick={toggleSettings} sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ListItemIcon sx={{ color: "black" }}>
            <Avatar sx={{ bgcolor: "#5D87FF" }}>K</Avatar>
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography fontWeight="bold" sx={{ whiteSpace: "nowrap", color: "black" }}>
                Trello Không gian làm việc
              </Typography>
            }
          />
        </Box>

        {openSettings ? <ExpandLess sx={{ color: "black" }} /> : <ExpandMore sx={{ color: "black" }} />}
      </ListItemButton>

      {/* Danh sách workspace - Hiển thị khi mở */}
      <Collapse in={openSettings} timeout="auto" unmountOnExit>
        <Box sx={{ pl: 4 }}>
          {loading ? (
            <Typography sx={{ color: "gray" }}>Đang tải...</Typography>
          ) : error ? (
            <Typography sx={{ color: "red" }}>{error}</Typography>
          ) : workspaces.length === 0 ? (
            <Typography sx={{ color: "gray" }}>Không có workspace nào</Typography>
          ) : (
            <List>
              {workspaces.map((workspace) => (
                <ListItemButton key={workspace.id} component={Link} to={`/workspaces/${workspace.id}`}>
                  <ListItemIcon sx={{ color: "black" }}>
                    <ViewKanbanIcon />
                  </ListItemIcon>
                  <ListItemText primary={workspace.name} sx={{ color: "black" }} />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </Collapse>
    </div>
  );
}

export default WorkspaceMenu;

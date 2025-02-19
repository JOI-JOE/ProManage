import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Button,
  Popover,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import PeopleIcon from "@mui/icons-material/People";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ViewStreamIcon from "@mui/icons-material/ViewStream";
import SettingsIcon from "@mui/icons-material/Settings";
import SignalCellularAltOutlinedIcon from "@mui/icons-material/SignalCellularAltOutlined";
import LockIcon from "@mui/icons-material/Lock";
import GroupsIcon from "@mui/icons-material/Groups";
import PublicIcon from "@mui/icons-material/Public";
import { Link } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import { Grid } from "@mui/material"; // Nếu bạn dùng Material-UI

const colors = ["#E3F2FD", "#64B5F6", "#1565C0", "#283593", "#8E24AA"];

const WorkspaceConten = () => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [boardTitle, setBoardTitle] = useState("");
  const [selectedBg, setSelectedBg] = useState(null);
  const [workspace, setWorkspace] = useState("default");

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setOpenPopover(true);
  };

  const handleChange = (e) => {
    setBoardTitle(e.target.value);
  };

  const handleClose = () => {
    setOpenPopover(false);
    setAnchorEl(null);
  };

  const handleCreateBoard = () => {
    alert(`🎉 Bảng "${boardTitle}" đã được tạo thành công!`);
    handleClose();
  };

  return (
    <Box
      sx={{
        width: "60%",
        padding: "20px",
        marginLeft: "auto",
        marginTop: "25px",
      }}
    >
      {/* Danh sách bảng Trello */}
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
        <AccessTimeIcon sx={{ marginRight: "8px" }} />
        <Typography variant="h6">Đã xem gần đây</Typography>
      </Box>

      <List sx={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <ListItem sx={{ width: "auto", padding: 0 }}>
          <Box
            component={Link}
            to="/boardconten"
            sx={{
              width: "180px",
              height: "100px",
              backgroundColor: "#9c2750",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              // justifyContent: "space-between",
              // padding: "10px",
              // position: "relative",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              "&:hover": { backgroundColor: "#9A436D" },
            }}
            onMouseEnter={() => setHoveredItem(1)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <PeopleIcon
              sx={{
                color: "white",
                marginRight: "3px",
                marginTop: "70px",
              }}
            />
            <Typography
              sx={{
                color: "white",
                fontWeight: "bold",
                // marginBottom: "2px",
                // marginRight: "10px",
                // marginLeft: "10px",
                textAlign: "center",
              }}
            >
              Bảng Trello của tôi
            </Typography>
            {hoveredItem === 1 && (
              <StarBorderIcon
                sx={{
                  color: "white",
                  position: "absolute",
                  right: "10px",
                  top: "70px",
                }}
              />
            )}
          </Box>
        </ListItem>
      </List>

      {/* Các không gian làm việc của bạn */}
      <Typography
        variant="h6"
        sx={{
          marginTop: "50px",
          marginBottom: "10px",
          fontWeight: "bold",
          textTransform: "uppercase",
        }}
      >
        CÁC KHÔNG GIAN LÀM VIỆC CỦA BẠN
      </Typography>

      <ListItem
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 0",
          gap: " 20px",
        }}
      >
        {/* Avatar & Tiêu đề */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Avatar sx={{ bgcolor: "#5D87FF" }}>K</Avatar>
          <Typography fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
            Trello Không gian làm việc
          </Typography>
        </Box>

        {/* Các nút chức năng */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Button
            variant="outlined"
            sx={{
              backgroundColor: "#F8F9FA",
              height: "36px",
              borderRadius: "8px",
              color: "#172B4D",
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <DashboardIcon fontSize="small" />
            Bảng
          </Button>

          <Button
            variant="outlined"
            sx={{
              backgroundColor: "#F8F9FA",
              height: "36px",
              width: "130px",
              borderRadius: "8px",
              color: "#172B4D",
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <ViewStreamIcon fontSize="small" />
            Dạng xem
          </Button>

          <Button
            variant="outlined"
            sx={{
              backgroundColor: "#F8F9FA",
              height: "36px",
              width: "160px",
              borderRadius: "8px",
              color: "#172B4D",
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <PeopleIcon fontSize="small" />
            Thành viên (1)
          </Button>

          <Button
            variant="outlined"
            sx={{
              backgroundColor: "#F8F9FA",
              height: "36px",
              width: "120px",
              borderRadius: "8px",
              color: "#172B4D",
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <SettingsIcon fontSize="small" />
            Cài đặt
          </Button>

          <Button
            variant="contained"
            sx={{
              backgroundColor: "#EDEBFC",
              height: "36px",
              width: "140px",
              borderRadius: "8px",
              color: "#8250DF",
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <SignalCellularAltOutlinedIcon fontSize="small" />
            Nâng cấp
          </Button>
        </Box>
      </ListItem>

      {/* Danh sách bảng Trello */}
      <List sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <ListItem sx={{ width: "auto", padding: 0 }}>
          <Box
            component={Link}
            to="/boardconten"
            sx={{
              width: "180px",
              height: "100px",
              backgroundColor: "#9c2750",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              "&:hover": { backgroundColor: "#9A436D" },
            }}
            onMouseEnter={() => setHoveredItem(2)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Typography sx={{ color: "white", fontWeight: "bold" }}>
              Bảng Trello của tôi
            </Typography>
            {hoveredItem === 2 && (
              <StarBorderIcon
                sx={{
                  color: "white",
                  position: "absolute",
                  right: "10px",
                  top: "70px",
                }}
              />
            )}
          </Box>
        </ListItem>

        <ListItem sx={{ width: "auto", padding: 0 }}>
          <Box
            sx={{
              width: "180px",
              height: "100px",
              backgroundColor: "#EDEBFC",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              "&:hover": { backgroundColor: "#DCDFE4" },
            }}
            onClick={handleOpen}
          >
            <Typography sx={{ color: "Black", fontWeight: "bold" }}>
              Tạo bảng mới
            </Typography>
          </Box>
        </ListItem>
      </List>

      {/* Nút xem tất cả các bảng đã đóng */}
      <Button
        variant="outlined"
        sx={{
          backgroundColor: "#EDEBFC",
          height: "30px",
          width: "250px",
          marginTop: "40px",
        }}
      >
        Xem tất cả các bảng đã đóng
      </Button>

      {/* Popover (hiện cạnh nút nhấn) */}
      <Popover
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box
          sx={{
            width: 350,
            p: 2,
            borderRadius: "8px",
            bgcolor: "white",
            boxShadow: 3,
          }}
        >
          <Typography variant="h6" fontWeight="bold" textAlign="center">
            Tạo bảng
          </Typography>

          {/* Chọn hình nền */}
          <Box
            sx={{
              width: "100%",
              height: "100px",
              background: selectedBg,
              borderRadius: "8px",
            }}
          />

          <Typography variant="subtitle1" mt={2} fontWeight="bold">
            Phông nền
          </Typography>

          <Grid container spacing={1} mt={1}>
            {colors.map((color, index) => (
              <Grid item key={index}>
                <Box
                  sx={{
                    width: "50px",
                    height: "35px",
                    backgroundColor: color,
                    borderRadius: "4px",
                    cursor: "pointer",
                    border: selectedBg === color ? "2px solid #007BFF" : "none",
                  }}
                  onClick={() => setSelectedBg(color)}
                />
              </Grid>
            ))}
          </Grid>

          <IconButton
            onClick={handleClose}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" mt={2} fontWeight="bold">
            Tiêu đề bảng <span style={{ color: "red" }}>*</span>
          </Typography>

          {/* Ô nhập tiêu đề */}
          <TextField
            fullWidth
            label="Tiêu đề bảng"
            variant="outlined"
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            error={boardTitle.trim() === ""}
            helperText={
              boardTitle.trim() === "" ? "👋 Tiêu đề bảng là bắt buộc" : ""
            }
            sx={{ marginBottom: 2 }}
          />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
            Không gian làm việc
          </Typography>
          <Select
            fullWidth
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
            sx={{ marginBottom: 2 }}
          >
            <MenuItem value="workspace1">Workspace 1</MenuItem>
            <MenuItem value="workspace2">Workspace 2</MenuItem>
          </Select>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
            Quyền xem
          </Typography>
          <Select
            fullWidth
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
            sx={{ marginBottom: 2 }}
          >
            <MenuItem value="default">Không gian làm việc</MenuItem>
            <MenuItem value="private">
              <LockIcon fontSize="small" />
              Riêng tư
            </MenuItem>
            <MenuItem value="workspace">
              <GroupsIcon fontSize="small" />
              Không gian làm việc
            </MenuItem>
            <MenuItem value="public">
              <PublicIcon fontSize="small" />
              Công khai
            </MenuItem>
          </Select>

          {/* Nút tạo bảng */}
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateBoard}
              disabled={boardTitle.trim() === ""}
            >
              Tạo bảng
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default WorkspaceConten;

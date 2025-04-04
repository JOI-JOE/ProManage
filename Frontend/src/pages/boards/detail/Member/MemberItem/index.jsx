import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Popover,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
// import CloseIcon from "@mui/icons-material/Close";
// import CheckIcon from "@mui/icons-material/Check";

const MemberItem = ({ member }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuEl, setMenuEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (event) => {
    setMenuEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px",
        // borderBottom: "1px solid #333",
        // borderTop: "1px solid #333",
        background: "#ffffff",
        // borderRadius: "8px",
        marginBottom: "8px",
      }}
    >
      {/* Thông tin thành viên */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar
          sx={{
            bgcolor: "#0079BF",
            width: "35px",
            height: "35px",
            fontSize: "0.9rem",
            fontWeight: "bold",
          }}
        >
          {member?.name?.charAt(0)}
        </Avatar>
        <Box>
          <Typography fontWeight="bold" sx={{ color: "#172B4D" }}>
            {member?.name}
          </Typography>
          <Typography variant="body2" sx={{ color: "gray" }}>
            @{member.email} <br />
            {member.last_active}
            {/* @{member.email} • */}
          </Typography>
        </Box>
      </Box>

      {/* Nút thao tác */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Button
          variant="contained"
          onClick={handleClick}
          size="small"
          sx={{ fontSize: "0.7rem", padding: "2px 6px", ml: 1.5 }}
        >
          Xem bảng thông tin (1)
        </Button>

        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Box sx={{ p: 2, width: 250 }}>
            <Typography fontWeight="bold">Bảng thông tin</Typography>
            <Typography variant="body2">
              {member?.name} là thành viên của:
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <Avatar src={member.avatar} sx={{ width: 30, height: 30 }} />
              <Typography variant="body2">Tên bảng</Typography>
            </Box>
          </Box>
        </Popover>

        <Button
          sx={{ fontSize: "0.7rem" }}
          variant="outlined"
          size="small"
          startIcon={<HelpOutlineIcon />}
        >
          {member.member_type === "admin" ? "Quản trị viên" : "Thành viên"}
        </Button>

        <Button
          sx={{ fontSize: "0.7rem", padding: "2px 6px" }}
          variant="outlined"
          color="error"
          size="small"
        >
          Rời khỏi
        </Button>

        <Button onClick={handleMenuClick} size="small">
          <MoreVertIcon />
        </Button>

        <Menu
          anchorEl={menuEl}
          open={Boolean(menuEl)}
          onClose={handleMenuClose}
        >
          <MenuItem sx={{ fontSize: "0.789rem" }} onClick={handleMenuClose}>
            Quản trị viên
          </MenuItem>
          <MenuItem sx={{ fontSize: "0.789rem" }} onClick={handleMenuClose}>
            Loại bỏ
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default MemberItem
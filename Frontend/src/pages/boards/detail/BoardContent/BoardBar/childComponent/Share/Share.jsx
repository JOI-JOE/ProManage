import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const ShareBoardDialog = ({ open, onClose }) => {
  const [roleAnchorEl, setRoleAnchorEl] = useState(null);
  const [selectedRole, setSelectedRole] = useState("Quản trị viên");
  const [link, setLink] = useState("");

  const handleOpenRoleMenu = (event) => {
    setRoleAnchorEl(event.currentTarget);
  };

  const handleCloseRoleMenu = (role) => {
    if (role) setSelectedRole(role);
    setRoleAnchorEl(null);
  };

  const handleCreateLink = () => {
    // Giả lập tạo liên kết
    setLink("https://example.com/share-link");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chia sẻ bảng</DialogTitle>
      <DialogContent>
        {/* Nhập email hoặc tên */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Địa chỉ email hoặc tên"
          size="small"
          sx={{
            marginBottom: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
            "& input::placeholder": {
              fontSize: "0.765rem", // Chỉnh kích thước chữ trong placeholder
            },
            "& input": {
              fontSize: "0.8rem", // Chỉnh kích thước chữ khi nhập vào
            },
          }}
        />

        {/* Chia sẻ bằng liên kết */}
        <Box display="flex" alignItems="center">
          <FormControlLabel
            control={<Switch />}
            label="Chia sẻ bảng này bằng liên kết"
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "teal",
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "teal",
              },
            }}
          />
          <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: "pointer", ml: 1 }}
            onClick={handleCreateLink}
          >
            Tạo liên kết
          </Typography>
        </Box>

        {link && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Liên kết: {link}
          </Typography>
        )}

        {/* Thành viên của bảng */}
        <Typography
          variant="subtitle1"
          sx={{ marginTop: 2, fontWeight: "bold" }}
        >
          Thành viên của bảng thông tin
        </Typography>

        <Box
          display="flex"
          alignItems="center"
          gap={2}
          mt={1}
          sx={{ p: 1, borderRadius: 2, backgroundColor: "#f4f5f7" }}
        >
          <Avatar alt="Người dùng" />
          <Box flexGrow={1}>
            <Typography fontWeight="bold">
              Pham Thi Hong Ngat (FPL HN) (bạn)
            </Typography>
            <Typography variant="body2" color="textSecondary">
              @phamthihongngatfplhn
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Quản trị viên Không gian làm việc
            </Typography>
          </Box>

          {/* Chọn quyền */}
          <Button
            variant="outlined"
            size="small"
            endIcon={<ExpandMoreIcon />}
            onClick={handleOpenRoleMenu}
            sx={{
              fontSize: "0.765rem", // Chỉnh kích thước chữ của nút "Quản trị viên"
            }}
          >
            {selectedRole}
          </Button>

          {/* Menu chọn quyền */}
          <Menu
            anchorEl={roleAnchorEl}
            open={Boolean(roleAnchorEl)}
            onClose={() => handleCloseRoleMenu(null)}
            MenuListProps={{
              sx: {
                "& .MuiMenuItem-root": {
                  fontSize: "0.8rem", // Chỉnh kích thước chữ của các mục trong Menu
                },
              },
            }}
          >
            <MenuItem onClick={() => handleCloseRoleMenu("Quản trị viên")}>
              Quản trị viên
            </MenuItem>
            <MenuItem onClick={() => handleCloseRoleMenu("Thành viên")}>
              Thành viên
            </MenuItem>

            <MenuItem onClick={() => handleCloseRoleMenu("Rời bảng")}>
              Rời bảng
            </MenuItem>
          </Menu>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "flex-end", px: 3, pb: 2 }}>
        <Button onClick={onClose} color="secondary">
          Đóng
        </Button>
        <Button
          variant="contained"
          color="primary"
          sx={{
            backgroundColor: "teal",
            "&:hover": {
              backgroundColor: "#22a6b3", // Giữ nguyên màu nền khi hover
            },
          }}
        >
          Chia sẻ
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareBoardDialog;

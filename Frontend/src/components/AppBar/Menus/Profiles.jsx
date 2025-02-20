import * as React from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Logout from "@mui/icons-material/Logout";
import axios from "axios";
import Typography from "@mui/material/Typography";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItemSelect from "@mui/material/MenuItem";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import CloseIcon from "@mui/icons-material/Close";
import { ListItemIcon } from "@mui/material";

export default function ProfileMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [themeAnchorEl, setThemeAnchorEl] = React.useState(null);
  const [openWorkspaceModal, setOpenWorkspaceModal] = React.useState(false);
  const [openInviteModal, setOpenInviteModal] = React.useState(false);
  const [selectedTheme, setSelectedTheme] = React.useState("system");
  const [workspaceName, setWorkspaceName] = React.useState("");
  const [workspaceType, setWorkspaceType] = React.useState("");

  const open = Boolean(anchorEl);
  const themeOpen = Boolean(themeAnchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const token = localStorage.getItem("token");

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.removeItem("token"); // Xóa token trên client
      localStorage.removeItem("role");
      window.location.reload(); // Reload trang hoặc chuyển hướng
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleThemeClick = (event) => {
    setThemeAnchorEl(event.currentTarget);
  };

  const handleThemeClose = () => {
    setThemeAnchorEl(null);
  };

  const handleThemeChange = (event) => {
    setSelectedTheme(event.target.value);
  };

  const handleOpenWorkspaceModal = () => {
    setOpenWorkspaceModal(true);
    handleClose();
  };

  const handleCloseWorkspaceModal = () => {
    setOpenWorkspaceModal(false);
    setWorkspaceName(""); // Reset tên không gian làm việc
    setWorkspaceType(""); // Reset loại không gian làm việc
  };

  const handleContinue = () => {
    if (workspaceName && workspaceType) {
      setOpenWorkspaceModal(false);
      setOpenInviteModal(true);
      setWorkspaceName("");
      setWorkspaceType("");
    }
  };

  return (
    <React.Fragment>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <Tooltip title="Tài khoản">
          <IconButton onClick={handleClick} size="small">
            <Avatar sx={{ bgcolor: "#00A3BF", width: 35, height: 35 }}>
              TT
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Avatar
            sx={{ width: 40, height: 40, margin: "auto", bgcolor: "#00A3BF" }}
          >
            TT
          </Avatar>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", mt: 1, color: "black" }}
          >
            Nguyễn Thu Trang
          </Typography>
          <Typography variant="body2" sx={{ color: "black" }}>
            nttrang303204@gmail.com
          </Typography>
        </Box>
        <Divider />
        <MenuItem>Chuyển đổi Tài khoản</MenuItem>
        <MenuItem>
          Quản lý tài khoản{" "}
          <SettingsIcon fontSize="small" sx={{ ml: "auto" }} />
        </MenuItem>
        <Divider />
        <Typography
          variant="body2"
          sx={{ px: 2, fontWeight: "bold", color: "text.secondary" }}
        >
          ProManage
        </Typography>
        <MenuItem>Hồ sơ và Hiển thị</MenuItem>
        <MenuItem>Hoạt động</MenuItem>
        <MenuItem>Thẻ</MenuItem>
        <MenuItem>Cài đặt</MenuItem>
        <MenuItem onClick={handleThemeClick}>
          Chủ đề <ArrowRightIcon fontSize="small" sx={{ ml: "auto" }} />
        </MenuItem>
        <Menu
          anchorEl={themeAnchorEl}
          open={themeOpen}
          onClose={handleThemeClose}
        >
          <RadioGroup value={selectedTheme} onChange={handleThemeChange}>
            <MenuItem>
              <FormControlLabel
                value="light"
                control={<Radio />}
                label="Màu sáng"
              />
            </MenuItem>
            <MenuItem>
              <FormControlLabel value="dark" control={<Radio />} label="Tối" />
            </MenuItem>
            <MenuItem>
              <FormControlLabel
                value="system"
                control={<Radio />}
                label="Hệ thống so khớp"
              />
            </MenuItem>
          </RadioGroup>
        </Menu>
        <Divider sx={{ my: 2 }} />
        <MenuItem onClick={handleOpenWorkspaceModal}>
          <PeopleIcon sx={{ mr: 2 }} /> Tạo Không gian làm việc
        </MenuItem>

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
        <Divider />
       
        <MenuItem>Trợ giúp</MenuItem>
        <MenuItem>Phím tắt</MenuItem>
        <Divider sx={{ marginY: "10px" }} />
        <MenuItem>Đăng xuất</MenuItem>
      </Menu>

      {/* Modal Tạo Không gian làm việc */}
      <Modal open={openWorkspaceModal} onClose={handleCloseWorkspaceModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "#F4F5F7",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            color: "black",
          }}
        >
          <IconButton
            onClick={handleCloseWorkspaceModal}
            sx={{ position: "absolute", top: 8, right: 8, color: "black" }}
          >
            <CloseIcon />
          </IconButton>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", mb: 1, color: "black", fontSize: "27px" }}
          >
            Hãy xây dựng một Không gian làm việc
          </Typography>
          <Typography
            variant="body2"
            sx={{ mb: 2, color: "D6D7D9", fontSize: "15px" }}
          >
            Tăng năng suất của bạn bằng cách giúp mọi người dễ dàng truy cập
            bảng ở một vị trí.
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", mb: 1, color: "black" }}
          >
            Tên Không gian làm việc
          </Typography>
          <TextField
            fullWidth
            placeholder="Công ty của bạn"
            variant="outlined"
            sx={{ mb: 1, color: "black" }}
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)} // Cập nhật giá trị
          />

          <Typography variant="body2" sx={{ mb: 4, color: "black" }}>
            Đây là tên của công ty, nhóm hoặc tổ chức của bạn.
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", mb: 1, color: "black" }}
          >
            Loại Không gian làm việc
          </Typography>

          <Select
            fullWidth
            value={workspaceType}
            onChange={(e) => setWorkspaceType(e.target.value)}
            displayEmpty
            sx={{ mb: 2 }}
          >
            <MenuItem value="" disabled>
              Chọn...
            </MenuItem>
            <MenuItem value="crm">Kinh doanh CRM</MenuItem>
            <MenuItem value="smallbiz">Doanh nghiệp nhỏ</MenuItem>
            <MenuItem value="hr">Nhân sự</MenuItem>
            <MenuItem value="it">Kỹ thuật-CNTT</MenuItem>
            <MenuItem value="education">Giáo dục</MenuItem>
            <MenuItem value="marketing">Marketing</MenuItem>
            <MenuItem value="management">Điều hành</MenuItem>
            <MenuItem value="other">Khác</MenuItem>
          </Select>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", mb: 1, color: "black" }}
          >
            Mô tả Không gian làm việc (Tùy chọn)
          </Typography>
          <TextField
            fullWidth
            placeholder="Nhóm của chúng tôi tổ chức mọi thứ ở đây"
            variant="outlined"
            sx={{ mb: 1, color: "black" }}
          />
          <Typography variant="body2" sx={{ mb: 4, color: "black" }}>
            Đưa các thành viên của bạn vào bảng với mô tả ngắn về Không gian làm
            việc của bạn.
          </Typography>

          <Button
            fullWidth
            variant="contained"
            onClick={handleContinue}
            disabled={!workspaceName || !workspaceType}
          >
            Tiếp tục
          </Button>
        </Box>
      </Modal>

      {/* Modal Mời Thành Viên */}
      <Modal open={openInviteModal} onClose={() => setOpenInviteModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "white",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          {/* Nút đóng */}
          <IconButton
            onClick={() => setOpenInviteModal(false)}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>

          {/* Tiêu đề */}
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", mb: 1, fontSize: "27px" }}
          >
            Mời nhóm của bạn
          </Typography>

          {/* Phần mô tả */}
          <Typography variant="body2" sx={{ mb: 2 }}>
            Mời tối đa 9 người khác bằng liên kết hoặc nhập tên hoặc email của
            họ.
          </Typography>

          {/* 🔹 Thêm dòng "Các thành viên Không gian làm việc" ở góc trái */}
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
            Các thành viên Không gian làm việc
          </Typography>

          {/* Ô nhập email */}
          <TextField
            fullWidth
            placeholder="ví dụ: calrissian@cloud.ci"
            variant="outlined"
            sx={{ mb: 2 }}
          />

          {/* Nút Mời */}
          <Button fullWidth variant="contained" disabled>
            Mời vào Không gian làm việc
          </Button>

          {/* 🔹 Chuyển "Tôi sẽ thực hiện sau" thành link */}
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              mt: 2,
              color: "blue",
              cursor: "pointer",
              textDecoration: "underline", // Làm cho nó trông giống link
            }}
            onClick={() => setOpenInviteModal(false)} // Đóng modal khi nhấn vào
          >
            Tôi sẽ thực hiện sau
          </Typography>
        </Box>
      </Modal>
    </React.Fragment>
  );
}

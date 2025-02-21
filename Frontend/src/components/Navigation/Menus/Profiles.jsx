import * as React from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Logout from "@mui/icons-material/Logout";
import Typography from "@mui/material/Typography";
import SettingsIcon from "@mui/icons-material/Settings";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useNavigate } from "react-router-dom";

import { useLogout } from "../../../hooks/useUser";
import { useStateContext } from "../../../contexts/ContextProvider";
import CreateWorkspace from "../../CreateWorkspace";



export default function ProfileMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [themeAnchorEl, setThemeAnchorEl] = React.useState(null);
  const [selectedTheme, setSelectedTheme] = React.useState("system");


  const open = Boolean(anchorEl);
  const themeOpen = Boolean(themeAnchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
  const navigate = useNavigate();

  // Lấy thông tin user từ hook
  const { user } = useStateContext();
  // Hook logout
  const { mutate: logout, isLoading: logoutLoading } = useLogout();

  // Xử lý logout
  const handleLogout = () => {
    logout(null, {
      onSuccess: () => {
        console.log("Đăng xuất thành công!");
        navigate("/login"); // Điều hướng về trang login
      },
      onError: (error) => {
        console.error("Lỗi khi đăng xuất:", error);
        alert("Đã có lỗi xảy ra khi đăng xuất. Vui lòng thử lại sau.");
      },
    });
  }

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
          </Typography>
          <Typography variant="body2" sx={{ color: "black" }}>
            {user.email}
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
        {/* <MenuItem onClick={handleOpenWorkspaceModal}>
          <PeopleIcon sx={{ mr: 2 }} /> Tạo Không gian làm việc
        </MenuItem> */}
        <CreateWorkspace />


        <Divider />


        <MenuItem>Trợ giúp</MenuItem>
        <MenuItem>Phím tắt</MenuItem>
        <Divider sx={{ marginY: "10px" }} />
        <MenuItem onClick={handleLogout}>
          Đăng xuất
        </MenuItem>
      </Menu>

    </React.Fragment>
  );
}

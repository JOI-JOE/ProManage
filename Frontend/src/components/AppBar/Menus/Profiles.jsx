import * as React from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import PaletteIcon from "@mui/icons-material/Palette";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";

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

  return (
    <React.Fragment>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <Tooltip title="Tài khoản">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ padding: 0 }}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main" }}>
              TT
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 280,
            overflow: "visible",
            mt: 1.5,
            borderRadius: 2,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Avatar sx={{ width: 50, height: 50, margin: "auto" }}>TT</Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mt: 1 }}>
            Trang Nguyễn Thu
          </Typography>
          <Typography variant="body2" color="text.secondary">
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
          TRELLO
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
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 2,
              width: 220,
              position: "absolute",
              left: -220,
              paddingLeft: "30px",
            },
          }}
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
        <MenuItem>
          <PeopleIcon sx={{ mr: 1 }} /> Tạo Không gian làm việc
        </MenuItem>
        <Divider />
        <MenuItem>Trợ giúp</MenuItem>
        <MenuItem>Phím tắt</MenuItem>
        <MenuItem sx={{ borderTop: "1px solid #ddd", marginY: "10px" }}>
          Đăng xuất
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}

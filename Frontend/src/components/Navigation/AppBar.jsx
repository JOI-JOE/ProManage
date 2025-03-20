import {
  Badge,
  Box,
  Button,
  TextField,
  Tooltip,
  Typography,
  Popover,
  IconButton,
  Switch,
  Select,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
} from "@mui/material";
import AppsIcon from "@mui/icons-material/Apps";
import trelloLogo from "~/assets/trello.svg?react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SvgIcon from "@mui/material/SvgIcon";
import Workspace from "./Menus/Workspace";
import Started from "./Menus/Started";
import Template from "./Menus/Template";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Profile from "./Menus/Profiles";
import { Link } from "react-router-dom";
import { useState } from "react";
import Recent from "./Menus/Recent";
import { useMe } from "../../contexts/MeContext";
import useNotifications from "../../hooks/useNotification";

const AppBar = () => {
  const { user } = useMe();
  const { notifications, isLoading, error } = useNotifications(user?.id);
  console.log(notifications);

  const [searchText, setSearchText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [showUnread, setShowUnread] = useState(false);

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);

  // Mở menu cài đặt khi bấm vào icon ba chấm
  const handleSettingsOpen = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };
  // Đóng menu cài đặt
  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };
  return (
    <Box
      px={2}
      sx={{
        width: "100%",
        height: (theme) => theme.trello.appBarHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "secondary.main",
        overflowX: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <AppsIcon sx={{ color: "secondary.contrastText", fontSize: "24px" }} />
        <Box
          component={Link}
          // Link fix cứng
          to={`/u/${user?.user_name}/boards`}
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <SvgIcon
            component={trelloLogo}
            inheritViewBox
            fontSize="24px"
            sx={{ color: "secondary.contrastText" }}
          />
          <Typography
            variant="span"
            sx={{
              fontWeight: "bold",
              color: "secondary.contrastText",
              fontSize: "18px",
            }}
          >
            Pro Manage
          </Typography>
        </Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
          <Workspace />
          <Recent />
          <Started />
          <Template />
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          marginLeft: "auto",
        }}
      >
        <TextField
          autoComplete="off"
          id="outlined-search"
          label="Search..."
          type="search"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputLabelProps={{
            sx: { fontSize: "14px", color: "white" }, // Giảm kích thước chữ label
          }}
          InputProps={{
            sx: {
              height: 35,
              width: 210,
              backgroundColor: "black",
              borderRadius: "8px",
              color: "white",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
              },

              "& .MuiInputBase-input": {
                // color: "white",
                fontSize: "13px",
                // padding: "4px 8px",
              },
            },
          }}
        />

        <Tooltip title="Notification">
          <IconButton onClick={handleClick}>
            <Badge badgeContent={2} color="error">
              <NotificationsNoneIcon sx={{ color: "white" }} />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Help">
          <HelpOutlineIcon
            sx={{
              fontSize: "medium",
              cursor: "pointer",
              color: "secondary.contrastText",
            }}
          />
        </Tooltip>
        {/* dữ liệu trong profile */}
        <Profile fullName={user?.full_name} email={user?.email} />

        {/* Popover hiển thị thông báo */}
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <Box sx={{ width: 400, padding: 2, height: 350 }}>
            {/* Tiêu đề + Nút tắt mở + Icon ba chấm */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                Thông báo
              </Typography>

              {/* Box chứa nút Switch và icon 3 chấm */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Switch
                  checked={showUnread}
                  onChange={() => setShowUnread(!showUnread)}
                />

                {/* Icon ba chấm */}
                <IconButton onClick={handleSettingsOpen}>
                  <MoreVertIcon />
                </IconButton>

                {/* Menu cài đặt */}
                <Menu
                  anchorEl={settingsAnchorEl}
                  open={Boolean(settingsAnchorEl)}
                  onClose={handleSettingsClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                >
                  <Box sx={{ padding: 2, width: 300 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ textAlign: "center" }}
                    >
                      Cài đặt thông báo
                    </Typography>

                    {/* Chọn tần suất thông báo */}
                    <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", mb: 1, color: "black" }}
                      >
                        Tần xuất thông báo qua email
                      </Typography>
                      <Select defaultValue="never">
                        <MenuItem value="never">Không bao giờ</MenuItem>
                        <MenuItem value="periodic">Định kỳ</MenuItem>
                        <MenuItem value="immediate">Ngay lập tức</MenuItem>
                      </Select>
                    </FormControl>

                    <MenuItem>Cho phép thông báo trên Desktop</MenuItem>
                    <MenuItem>Tất cả cài đặt thông báo</MenuItem>
                  </Box>
                </Menu>
              </Box>
            </Box>

            {/* Nội dung thông báo */}
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {notifications?.data?.length === 0 ? (
                  <p>Không có thông báo</p>
                ) : (
                  notifications?.data?.map((notif) => (
                    <div
                      key={notif.id}
                      style={{
                        margin: "10px 0",
                        padding: "10px",
                        border: "1px solid #ccc",
                        backgroundColor: notif.read_at ? "#f9f9f9" : "#e0f7fa", // Chưa đọc: màu xanh nhạt
                      }}
                    >
                      <p>{notif.data.message}</p>
                      <Link
                        to={`/b/${notif.data.board_id}/${notif.data.board_name}`}
                      >
                        Xem bảng
                      </Link>
                    </div>
                  ))
                )}
              </Typography>
            </Box>
          </Box>
        </Popover>
      </Box>
    </Box>
  );
};

export default AppBar;

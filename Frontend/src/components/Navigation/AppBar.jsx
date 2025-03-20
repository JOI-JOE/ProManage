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
  CircularProgress
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
import AddToPhotosIcon from "@mui/icons-material/AddToPhotos";
import Profile from "./Menus/Profiles";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Recent from "./Menus/Recent";
import { useUser } from "../../hooks/useUser";
import useNotifications from "../../hooks/useNotification";
import useSearch from "../../hooks/useSearch";
// import useNotifications from "../../hooks/useNotification";

const AppBar = ({ username, email }) => {
  const { data: user } = useUser();
  const userId = user?.id;
  const { notifications, isLoading, error } = useNotifications(userId);
  console.log(notifications);

  const [searchText, setSearchText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [showUnread, setShowUnread] = useState(false);

  const [query, setQuery] = useState('');

  const { searchResults, isLoadingSearch, errorSearch } = useSearch(searchText, userId);

  useEffect(() => {
    // Cập nhật kết quả tìm kiếm khi có thay đổi trong searchText
  }, [searchText]);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

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
          to={`/u/${username}/boards`}
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
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <TextField
        autoComplete="off"
        id="outlined-search"
        label="Search..."
        type="search"
        size="small"
        value={searchText}
        onChange={handleSearchChange}
        InputLabelProps={{
          sx: { fontSize: '14px', color: 'white' }, // Giảm kích thước chữ label
        }}
        InputProps={{
          sx: {
            height: 40,
            width: 280,
            backgroundColor: '#1a1a1a', // Nền tối
            borderRadius: '30px', // Viền bo tròn giống Trello
            color: 'white',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent', // Ẩn viền mặc định
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#00C2A0', // Màu viền khi hover
            },
            '& .MuiInputBase-input': {
              fontSize: '14px',
              padding: '8px 12px',
            },
          },
        }}
      />

      {isLoading && <CircularProgress size={24} sx={{ color: 'white', marginTop: '10px' }} />}
      {error && <p style={{ color: 'red' }}>Lỗi khi tìm kiếm. Vui lòng thử lại.</p>}

      {searchText && !isLoading && !error && searchResults && (
        <Box sx={{ width: '100%', paddingTop: '20px', backgroundColor: '#2e2e2e', borderRadius: '10px', padding: '10px' }}>
          <h3 style={{ color: 'white' }}>Kết quả tìm kiếm:</h3>

          {/* Kiểm tra nếu boards tồn tại và có phần tử */}
          {Array.isArray(searchResults.boards) && searchResults.boards.length > 0 && (
            <Box sx={{ marginBottom: '15px' }}>
              <h4 style={{ color: '#00C2A0' }}>Bảng:</h4>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {searchResults.boards.map((board) => (
                  <li key={board.id} style={{ color: 'white', padding: '5px 0', borderBottom: '1px solid #444' }}>
                    {board.name}
                  </li>
                ))}
              </ul>
            </Box>
          )}

          {/* Kiểm tra nếu cards tồn tại và có phần tử */}
          {Array.isArray(searchResults.cards) && searchResults.cards.length > 0 && (
            <Box sx={{ marginBottom: '15px' }}>
              <h4 style={{ color: '#00C2A0' }}>Thẻ:</h4>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {searchResults.cards.map((card) => (
                  <li key={card.id} style={{ color: 'white', padding: '5px 0', borderBottom: '1px solid #444' }}>
                    {card.title}
                  </li>
                ))}
              </ul>
            </Box>
          )}

          {/* Kiểm tra nếu users tồn tại và có phần tử */}
          {Array.isArray(searchResults.users) && searchResults.users.length > 0 && (
            <Box sx={{ marginBottom: '15px' }}>
              <h4 style={{ color: '#00C2A0' }}>Người dùng:</h4>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {searchResults.users.map((user) => (
                  <li key={user.id} style={{ color: 'white', padding: '5px 0', borderBottom: '1px solid #444' }}>
                    {user.user_name}
                  </li>
                ))}
              </ul>
            </Box>
          )}

          {/* Trường hợp không có kết quả tìm kiếm */}
          {(!Array.isArray(searchResults.boards) || searchResults.boards.length === 0) &&
           (!Array.isArray(searchResults.cards) || searchResults.cards.length === 0) &&
           (!Array.isArray(searchResults.users) || searchResults.users.length === 0) && 
            <p style={{ color: 'white' }}>Không tìm thấy kết quả nào.</p>}
        </Box>
      )}
    </Box>


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
        <Profile email={email} />

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

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
  CircularProgress,
  Avatar,
  Collapse,
} from "@mui/material";
import AppsIcon from "@mui/icons-material/Apps";
import trelloLogo from "~/assets/trello.svg?react";
import SvgIcon from "@mui/material/SvgIcon";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Profile from "./Menus/Profiles";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Workspace from "./Menus/Workspace";
import Recent from "./Menus/Recent";
import Started from "./Menus/Started";
import Template from "./Menus/Template";
import useNotifications from "../../hooks/useNotification";
import useSearch from "../../hooks/useSearch";
// import useNotifications from "../../hooks/useNotification";
import { formatTime } from "../../../utils/dateUtils";
import { useMe } from "../../contexts/MeContext";


const AppBar = ({ username, email }) => {
  // const { data: user } = useUser();
  const { user, } = useMe();
  const userId = user?.id;
  const { notifications } = useNotifications(userId);

  const [searchText, setSearchText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [showUnread, setShowUnread] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [unreadCount, setUnreadCount] = useState(notifications?.data?.length || 0);
  const [lastSeenTime, setLastSeenTime] = useState(new Date());

  useEffect(() => {
    setUnreadCount(notifications?.data?.length || 0);
  }, [notifications]);

  const [query, setQuery] = useState('');

  const { searchResults, isLoadingSearch, errorSearch } = useSearch(searchText, userId);
  const searchRef = useRef(null);


  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleClickOutside = (e) => {
    // Kiểm tra nếu click ngoài vùng search thì đóng kết quả
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setSearchText("");
    }
  };

  useEffect(() => {
    // Cập nhật kết quả tìm kiếm khi có thay đổi trong searchText
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // setUnreadCount(0);
    setLastSeenTime(new Date());
  };

  const newNotificationsCount = notifications?.data?.filter((notif) => {
    return new Date(notif.created_at) > new Date(lastSeenTime);
  }).length || 0;

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleGroup = (cardId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const groupedNotifications = notifications?.data
    ?.filter((notif) => (showUnread ? notif.read_at === null : true))
    .filter((notif) =>
      notif.data.message.toLowerCase().includes(searchText.toLowerCase())
    )
    .reduce((acc, notif) => {
      const cardId = notif.data.card_id;
      if (!acc[cardId]) {
        acc[cardId] = {
          cardTitle: notif.data.card_title,
          boardName: notif.data.board_name,
          listName: notif.data.list_name,
          cardUrl: `/b/${notif.data.board_id}/${notif.data.board_name}/c/${notif.data.card_id}/${notif.data.card_title}`,
          notifications: [],
        };
      }
      acc[cardId].notifications.push(notif);
      return acc;
    }, {});

  // Sắp xếp thông báo theo thời gian (mới nhất trước)
  Object.values(groupedNotifications || {}).forEach((group) => {
    group.notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  });

  return (
    <Box
      px={2}
      sx={{
        width: "100%",
        height: (theme) => theme.trello.appBarHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "secondary.main"
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <AppsIcon sx={{ color: "secondary.contrastText", fontSize: "24px" }} />
        <Box
          component={Link}
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
          {/* <Recent /> */}
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
        {/* Bọc ô tìm kiếm và kết quả trong một box có position: relative */}
        <Box sx={{ position: "relative", width: "280px" }} ref={searchRef}>
          <TextField
            autoComplete="off"
            id="outlined-search"
            label="Search..."
            type="search"
            size="small"
            value={searchText}
            onChange={handleSearchChange}
            InputLabelProps={{ sx: { fontSize: "14px", color: "white" } }}
            InputProps={{
              sx: {
                height: 40,
                width: 280,
                backgroundColor: "#1a1a1a",
                borderRadius: "30px",
                color: "white",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#00C2A0" },
                "& .MuiInputBase-input": { fontSize: "14px", padding: "8px 12px" },
              },
            }}
          />

          {isLoadingSearch && <CircularProgress size={24} sx={{ color: "white", marginTop: "10px" }} />}
          {errorSearch && <p style={{ color: "red" }}>Lỗi khi tìm kiếm. Vui lòng thử lại.</p>}

          {searchText && !isLoadingSearch && !errorSearch && searchResults && (
            <Box
              sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                width: "100%",
                backgroundColor: "#2e2e2e",
                borderRadius: "10px",
                padding: "10px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
                zIndex: 10,
              }}
            >
              <h3 style={{ color: "white" }}>Kết quả tìm kiếm:</h3>

              {Array.isArray(searchResults.boards) && searchResults.boards.length > 0 && (
                <Box sx={{ marginBottom: "15px" }}>
                  <h4 style={{ color: "#00C2A0" }}>Bảng:</h4>
                  <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                    {searchResults.boards.map((board) => (
                      <li
                        key={board.id}
                        style={{
                          color: "white",
                          padding: "5px 0",
                          borderBottom: "1px solid #444",
                          cursor: "pointer",
                        }}
                        onClick={() => setSearchText("")} // Đóng kết quả sau khi chọn
                      >
                        {board.name}
                      </li>
                    ))}
                  </ul>
                </Box>
              )}

              {Array.isArray(searchResults.cards) && searchResults.cards.length > 0 && (
                <Box sx={{ marginBottom: "15px" }}>
                  <h4 style={{ color: "#00C2A0" }}>Thẻ:</h4>
                  <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                    {searchResults.cards.map((card) => (
                      <li
                        key={card.id}
                        style={{
                          color: "white",
                          padding: "5px 0",
                          borderBottom: "1px solid #444",
                          cursor: "pointer",
                        }}
                        onClick={() => setSearchText("")}
                      >
                        {card.title}
                      </li>
                    ))}
                  </ul>
                </Box>
              )}

              {Array.isArray(searchResults.users) && searchResults.users.length > 0 && (
                <Box sx={{ marginBottom: "15px" }}>
                  <h4 style={{ color: "#00C2A0" }}>Người dùng:</h4>
                  <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                    {searchResults.users.map((user) => (
                      <li
                        key={user.id}
                        style={{
                          color: "white",
                          padding: "5px 0",
                          borderBottom: "1px solid #444",
                          cursor: "pointer",
                        }}
                        onClick={() => setSearchText("")}
                      >
                        {user.user_name}
                      </li>
                    ))}
                  </ul>
                </Box>
              )}

              {(!Array.isArray(searchResults.boards) || searchResults.boards.length === 0) &&
                (!Array.isArray(searchResults.cards) || searchResults.cards.length === 0) &&
                (!Array.isArray(searchResults.users) || searchResults.users.length === 0) && (
                  <p style={{ color: "white" }}>Không tìm thấy kết quả nào.</p>
                )}
            </Box>
          )}
        </Box>



        <Tooltip title="Notification">
          <IconButton onClick={handleClick}>
            <Badge
              badgeContent={newNotificationsCount}
              color="error"
            >
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

        <Profile email={user?.email} />

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Box sx={{ width: 400, p: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                Thông báo
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography fontSize={14}>Chỉ hiển thị chưa đọc</Typography>
                <Switch
                  checked={showUnread}
                  onChange={() => setShowUnread(!showUnread)}
                  size="small"
                />
              </Box>
            </Box>

            <TextField
              size="small"
              fullWidth
              placeholder="Tìm kiếm thông báo..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{
                mb: 2,
                "& input": { fontSize: "14px" },
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />

            <Box
              sx={{
                maxHeight: 300,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {Object.values(groupedNotifications || {}).length === 0 && (
                <Typography textAlign="center" mt={4}>
                  Không có thông báo
                </Typography>
              )}

              {Object.values(groupedNotifications || {}).map((group) => {
                const firstNotification = group.notifications[0]; // Thông báo đầu tiên (mới nhất)
                const remainingNotifications = group.notifications.slice(1); // Các thông báo còn lại

                return (
                  <Box
                    key={group.cardUrl}
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                      backgroundColor: "#f7faff",
                      p: 1.5,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        component="a"
                        href={group.cardUrl}
                        fontWeight="bold"
                        fontSize={14}
                        sx={{
                          color: "#0c66e4",
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {group.cardTitle}
                      </Typography>
                      {remainingNotifications.length > 0 && ( // Chỉ hiển thị nút nếu có thông báo còn lại
                        <IconButton
                          onClick={() => toggleGroup(group.cardUrl)}
                          size="small"
                        >
                          {expandedGroups[group.cardUrl] ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>
                      )}
                    </Box>
                    <Typography fontSize={12} color="gray" mb={1}>
                      {group.boardName}: {group.listName}
                    </Typography>

                    {/* Luôn hiển thị thông báo đầu tiên */}
                    {firstNotification && (
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "center",
                          mb: 1,
                          borderBottom: "1px solid #eee",
                          pb: 1,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: "#5f6368",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: 14,
                          }}
                        >
                          {firstNotification.data.by_user?.full_name
                            ?.charAt(0)
                            .toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography fontWeight="bold" fontSize={13}>
                            {firstNotification.data.by_user?.full_name}
                          </Typography>
                          <Typography fontSize={12} color="text.secondary">
                            {firstNotification.data.message} —{" "}
                            {formatTime(firstNotification.created_at) ||
                              "1 giờ trước"}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* Hiển thị các thông báo còn lại khi mở rộng */}
                    {remainingNotifications.length > 0 && (
                      <Collapse in={expandedGroups[group.cardUrl]}>
                        {remainingNotifications.map((notif) => (
                          <Box
                            key={notif.id}
                            sx={{
                              display: "flex",
                              gap: 1,
                              alignItems: "center",
                              mb: 1,
                              borderBottom: "1px solid #eee",
                              pb: 1,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: "#5f6368",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: 14,
                              }}
                            >
                              {notif.data.by_user?.full_name
                                ?.charAt(0)
                                .toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography fontWeight="bold" fontSize={13}>
                                {notif.data.by_user?.full_name}
                              </Typography>
                              <Typography fontSize={12} color="text.secondary">
                                {notif.data.message} —{" "}
                                {formatTime(notif.created_at) || "1 giờ trước"}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Collapse>
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* <Box mt={2} textAlign="center">
              <Button size="small" variant="text" sx={{ color: "#1976d2" }}>
                Hiển Thị Hoạt Động Thẻ Trước
              </Button>
            </Box> */}
          </Box>
        </Popover>
      </Box>
    </Box>
  );
};

export default AppBar;
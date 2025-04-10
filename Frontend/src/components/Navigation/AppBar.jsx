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
import { useUser } from "../../hooks/useUser";
import useNotifications from "../../hooks/useNotification";
import useSearch from "../../hooks/useSearch";
import { formatTime } from "../../../utils/dateUtils";
import { useRecentBoards } from "../../hooks/useBoard";

const AppBar = ({ username, email }) => {
  const { data: user } = useUser();
  const userId = user?.id;
  const { notifications } = useNotifications(userId);

  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false); // Thêm state để theo dõi focus
  const [anchorEl, setAnchorEl] = useState(null);
  const [showUnread, setShowUnread] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [unreadCount, setUnreadCount] = useState(
    notifications?.data?.length || 0
  );
  const [lastSeenTime, setLastSeenTime] = useState(new Date());

  useEffect(() => {
    setUnreadCount(notifications?.data?.length || 0);
  }, [notifications]);

  const { searchResults, isLoadingSearch, errorSearch } = useSearch(
    searchText,
    userId
  );

  const searchRef = useRef(null);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleClickOutside = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setSearchText("");
      setIsFocused(false); // Đóng dropdown khi click ngoài
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setLastSeenTime(new Date());
  };

  const newNotificationsCount =
    notifications?.data?.filter((notif) => {
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

  Object.values(groupedNotifications || {}).forEach((group) => {
    group.notifications.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  });

  
  // Lấy dữ liệu từ useRecentBoards hook
  const { data: recentBoards, isLoading: isLoadingRecent, error: errorRecent } = useRecentBoards();


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
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <AppsIcon sx={{ color: "secondary.contrastText", fontSize: "24px" }} />
        <Box
          component={Link}
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
        {/* Bọc ô tìm kiếm và kết quả trong một box có position: relative */}
        <Box sx={{ position: "relative", width: "480px" }} ref={searchRef}>
          <TextField
            autoComplete="off"
            id="outlined-search"
            label="Search..."
            type="search"
            size="small"
            value={searchText}
            onChange={handleSearchChange}
            onFocus={() => setIsFocused(true)} // Khi focus vào input
            onBlur={() => setIsFocused(false)} // Khi rời focus
            InputLabelProps={{ sx: { fontSize: "14px", color: "white" } }}
            InputProps={{
              sx: {
                height: 40,
                width: 480,
                backgroundColor: "#1a1a1a",
                borderRadius: "30px",
                color: "white",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#00C2A0",
                },
                "& .MuiInputBase-input": {
                  fontSize: "14px",
                  padding: "8px 12px",
                },
              },
            }}
          />

          {isLoadingSearch && (
            <Box sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
            }}
            > 
              <CircularProgress
                size={24}
                sx={{ color: "white", marginTop: "10px", }}
              />
              <Typography sx={{ color: "white", ml: 2 }}>
                Đang tìm kiếm...
              </Typography>
            </Box>
          )}
          {errorSearch && (
            <p style={{ color: "red" }}>Lỗi khi tìm kiếm. Vui lòng thử lại.</p>
          )}

          {/* Hiển thị bảng gần đây hoặc kết quả tìm kiếm */}
          {(isFocused || searchText) && !isLoadingSearch && !errorSearch && (
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
              {/* Hiển thị bảng gần đây nếu không có từ khóa tìm kiếm */}
              {!searchText && isFocused && (
                <Box sx={{ marginBottom: "15px" }}>
                  <Typography variant="h6" sx={{ color: "#00C2A0", mb: 1,ml:2 }}>
                    Các bảng thông tin gần đây
                  </Typography>
                  {isLoadingRecent ? (
                    <Box sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "20px",
                    }}
                    > 
                      <CircularProgress
                        size={24}
                        sx={{ color: "white", marginTop: "10px", }}
                      />
                      <Typography sx={{ color: "white", ml: 2 }}>
                        Đang tìm kiếm...
                      </Typography>
                    </Box>
                  ) : errorRecent ? (
                    <Typography sx={{ color: "red" }}>
                      Lỗi khi tải bảng gần đây. Vui lòng thử lại.
                    </Typography>
                  ) : !recentBoards?.data || recentBoards?.data?.length === 0 ? (
                    <Typography sx={{ color: "white" }}>
                      Không có bảng gần đây nào.
                    </Typography>
                  ) : (
                    <Box sx={{  borderRadius: "6px", p: 1 }}>
                      {recentBoards?.data?.map((board) => (
                        <Box
                          key={board.id}
                          component={Link}
                          to={`/b/${board.id}/${board.name}`} // Adjust based on your data
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            color: "white",
                            textDecoration: "none",
                            padding: "8px 12px",
                            borderRadius: "4px",
                            "&:hover": {
                              backgroundColor: "#3A3E48",
                            },
                          }}
                          onClick={() => {
                            setSearchText("");
                            setIsFocused(false); // Close dropdown after selection
                          }}
                        >
                          {/* Thumbnail/Avatar */}
                          <Avatar
                            src={board.thumbnail || ""}
                            alt={board.board_name}
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "4px",
                              mr: 2,
                              background: board.thumbnail
                                ? board.thumbnail.startsWith("#")
                                  ? board.thumbnail
                                  : `url(${board.thumbnail}) center/cover no-repeat`
                                : "#1693E1",
                            }}
                          >
                            {!board.thumbnail && board.board_name?.charAt(0)?.toUpperCase()}
                          </Avatar>

                          {/* Board Name and Workspace */}
                          <Box>
                            <Typography variant="body1" sx={{ color: "white", fontWeight: 500 }}>
                              {board.board_name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "gray" }}>
                              {board.workspace_display_name || "No workspace"}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                  
                </Box>
              )}

              {/* Hiển thị kết quả tìm kiếm nếu có từ khóa */}
              {searchText && searchResults && (
                <>
                  {Array.isArray(searchResults.boards) && searchResults.boards.length > 0 && (
                    <Box >
                      <h5 style={{ color: "#00C2A0",fontSize:"14px",marginLeft:"20px" }}>Bảng:</h5>
                      <Box sx={{ marginBottom: "15px", marginTop:"20px", marginLeft:"20px" }} 
                      style={{ listStyle: "none", paddingLeft: 0 }}>
                        {searchResults.boards.map((board) => (
                          <li
                            key={board.id}
                            style={{
                              color: "white",
                              padding: "5px 0",
                              borderBottom: "1px solid #444",
                              cursor: "pointer",
                              "&:hover": {
                              backgroundColor: "#3A3E48",
                            },
                              
                            }}
                            onClick={() => {
                              setSearchText("");
                              setIsFocused(false); // Đóng dropdown sau khi chọn
                            }}
                          >
                            <Box
                              component={Link}
                              to={`/b/${board.id}/${board.name}`}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                color: "white",
                                textDecoration: "none",
                                "&:hover": {
                              backgroundColor: "#3A3E48",
                            },
                              }}
                            >
                              {/* Thumbnail/Avatar cho Board */}
                              <Avatar
                                src={board.thumbnail || ""}
                                alt={board.name}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: "4px",
                                  mr: 2,
                                  background: board.thumbnail
                                    ? board.thumbnail.startsWith("#")
                                      ? board.thumbnail
                                      : `url(${board.thumbnail}) center/cover no-repeat`
                                    : "#1693E1",
                                }}
                              >
                                {!board.thumbnail && board.name?.charAt(0)?.toUpperCase()}
                              </Avatar>
                              {/* <Typography variant="body1" sx={{ color: "white" }}>
                                {board.name}
                              </Typography> */}
                              <Box>
                                <Typography variant="body1" sx={{ color: "white", fontWeight: 500 }}>
                                  {board.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "gray" }}>
                                  {board.workspace_display_name || "No workspace"}
                                </Typography>
                              </Box>
                            </Box>
                          </li>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {Array.isArray(searchResults.cards) && searchResults.cards.length > 0 && (
                    <Box>
                      <h5 style={{ color: "#00C2A0",fontSize:"14px",marginLeft:"20px" }}>Thẻ:</h5>
                      <Box sx={{ marginBottom: "15px", marginTop:"10px", marginLeft:"20px"  }} >

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
                            onClick={() => {
                              setSearchText("");
                              setIsFocused(false);
                            }}
                            >
                            <Box
                              component={Link}
                              to={`/b/${card.board_id}/${card.board_name}/c/${card.id}/${card.title}`}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                color: "white",
                                textDecoration: "none",
                                "&:hover": {
                                  backgroundColor: "#3A3E48",
                                },
                              }}
                              >
                              {/* Icon hình card thay vì thumbnail */}
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  mr: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  backgroundColor: "#1693E1",
                                  borderRadius: "4px",
                                  
                                }}
                              >
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  >
                                  <rect
                                    x="4"
                                    y="4"
                                    width="16"
                                    height="16"
                                    rx="2"
                                    fill="white"
                                    />
                                  <path
                                    d="M8 8H16V10H8V8ZM8 12H14V14H8V12Z"
                                    fill="#1693E1"
                                    />
                                </svg>
                              </Box>
                              {/* <Typography variant="body1" sx={{ color: "white" }}>
                                {card.title}
                              </Typography> */}
                              <Box>
                                <Typography variant="body1" sx={{ color: "white", fontWeight: 500 }}>
                                  {card.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "gray" }}>
                                  {card.board_name || "No workspace"} : {card.listboard_name || "No List Board"}
                                </Typography>
                              </Box>
                            </Box>
                          </li>
                        ))}
                      </ul>
                      </Box>
                    </Box>
                  )}

                  {(!Array.isArray(searchResults.boards) || searchResults.boards.length === 0) &&
                    (!Array.isArray(searchResults.cards) || searchResults.cards.length === 0) && (
                        <p style={{ color: "white" }}>Không tìm thấy kết quả nào.</p>
                    )}
                </>
              )}
            </Box>
          )}
        </Box>

        <Tooltip title="Notification">
          <IconButton onClick={handleClick}>
            <Badge badgeContent={newNotificationsCount} color="error">
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
                const firstNotification = group.notifications[0];
                const remainingNotifications = group.notifications.slice(1);

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
                      {remainingNotifications.length > 0 && (
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
          </Box>
        </Popover>
      </Box>
    </Box>
  );
};

export default AppBar;
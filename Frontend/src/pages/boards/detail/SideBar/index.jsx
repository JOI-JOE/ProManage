

import React, { useCallback, useContext, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  Grid,
  TextField,
  Select,
  Button,
  ListSubheader,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LockIcon from "@mui/icons-material/Lock";
import GroupsIcon from "@mui/icons-material/Groups";
import PublicIcon from "@mui/icons-material/Public";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import AddIcon from "@mui/icons-material/Add";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FolderIcon from "@mui/icons-material/Folder";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WorkspaceContext from "../../../../contexts/WorkspaceContext";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CloseIcon from "@mui/icons-material/Close";
import { useCreateBoard, useImageUnsplash, useToggleBoardClosed } from "../../../../hooks/useBoard";
import { useGetBoardMembers, useGuestBoards } from "../../../../hooks/useInviteBoard";
import { useCheckMemberInWorkspace, useGetWorkspaces } from "../../../../hooks/useWorkspace";
import { useUser } from "../../../../hooks/useUser";
import { createBoard } from "../../../../api/models/boardsApi";
import { useColor } from "../../../../hooks/useColor";

const SideBar = () => {
  const { boardId } = useParams();
  const { data: user } = useUser();
  // console.log(boardId);
  const { data: guestBoards } = useGuestBoards();
  // console.log(guestBoards);
  const { currentWorkspace } = useContext(WorkspaceContext);
  const { data: boardMembers = [] } = useGetBoardMembers(boardId);


  const currentUserId = user?.id;

  const isMember = Array.isArray(boardMembers?.data)
    ? boardMembers.data.some(member =>
      member.id === currentUserId && member.pivot.role === "member"
    )
    : false;


  const adminCount = boardMembers?.data?.filter((m) => m.pivot.role === "admin").length;
  // console.log(adminCount);

  // useMemberJoinedListener(user?.id)



  const foundWorkspace = guestBoards?.find((workspace) =>
    workspace.boards.some((board) => board.id === boardId)
  );

  const { data: checkMember } = useCheckMemberInWorkspace(foundWorkspace?.workspace_id, user?.id);
  // console.log(foundWorkspace);

  let isGuest = false;
  if (foundWorkspace) {
    isGuest = true;
  }
  // console.log(isGuest);

  // const activeData = foundWorkspace || currentWorkspace;

  const [openSettings, setOpenSettings] = useState(false);
  // const invitedWorkspace = currentWorkspace?.boards?.some(board => board.id == boardId) ? currentWorkspace : null;
  // console.log(invitedWorkspace);

  // console.log(currentWorkspace);
  const toggleSettings = () => {
    setOpenSettings(!openSettings);
  };

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [boardTitle, setBoardTitle] = useState("");
  const [selectedBg, setSelectedBg] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [viewPermission, setViewPermission] = useState("");

  const { data: workspaces, isLoading: isLoadingWorkspaces, error } = useGetWorkspaces();
  const memoizedWorkspaces = useMemo(() => workspaces ?? [], [workspaces]);

  const { data: colors, isLoading: isLoadingColors, errorColors } = useColor();

  const { mutate: createBoard, isLoading: isCreatingBoard } = useCreateBoard();

  const handleMenuOpen = (event, boardId) => {
    setMenuAnchor(event.currentTarget);
    setSelectedBoardId(boardId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedBoardId(null);
  };

  const { mutate: toggleBoardClosed } = useToggleBoardClosed(); // Use hook

  const handleCloseBoard = (boardId) => {
    toggleBoardClosed(boardId); // Gọi hook để thay đổi trạng thái đóng bảng
    handleMenuClose();
  };
  const [openPopover, setOpenPopover] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const {
    mutate: fetchUnsplashImages,
    data: unsplashImages,
    isLoading: unsplashingImages,
  } = useImageUnsplash();

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setOpenPopover(true);
    fetchUnsplashImages(); // Gọi API lấy ảnh
  };


  const handleClose = () => {
    setOpenPopover(false);
    setAnchorEl(null);
  };

  const handleSelectBg = (bg) => {
    setSelectedBg(bg); // Nếu là mã màu, gán trực tiếp
  };

  const handleCreateBoard = useCallback(() => {
    if (!boardTitle.trim()) {
      alert("Vui lòng nhập tiêu đề bảng!");
      return;
    }

    const boardData = {
      name: boardTitle,
      thumbnail: selectedBg,
      workspace_id: workspace,
      visibility: viewPermission,
    };

    createBoard(boardData, {
      onSuccess: (data) => {
        console.log(data);
        // alert(`🎉 Bảng "${boardTitle}" đã được tạo thành công!`);
        handleClose();
      },
      onError: (error) => {
        alert(`❌ Lỗi khi tạo bảng: ${error.message}`);
      },
    });

    console.log("📩 Dữ liệu gửi lên API:", boardData);
  }, [boardTitle, selectedBg, workspace, viewPermission, createBoard, handleClose]);


  return (
    <Drawer
      variant="permanent"
      sx={{
        width: "19%",
        height: (theme) =>
          `calc( ${theme.trello.boardContentHeight} + ${theme.trello.boardBarHeight} )`,
        borderTop: "1px solid #ffffff",
        "& .MuiDrawer-paper": {
          boxSizing: "border-box",
          bgcolor: "#000",
          color: "#ffffff",
          position: "relative",
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#B6BBBF",
            borderRadius: "6px",
          },
          "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#ECF0F1" },
          "&::-webkit-scrollbar-track": { m: 2 },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          bgcolor: "#292929",
        }}
      >
        <Avatar sx={{ bgcolor: "#5D87FF" }}>K</Avatar>
        <Box>
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            {isGuest
              ? foundWorkspace?.workspace_name
              : currentWorkspace?.display_name}
          </Typography>
        </Box>
      </Box>

      {!isGuest && (
        <List>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to={`/w/${currentWorkspace?.name}`}
            >
              <ListItemIcon sx={{ color: "white" }}>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Bảng" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to={`/w/${currentWorkspace?.name}/members`}
            >
              <ListItemIcon sx={{ color: "white" }}>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Thành viên" />
              <AddIcon sx={{ color: "gray" }} />
            </ListItemButton>
          </ListItem>

          <ListItemButton onClick={toggleSettings}>
            <ListItemIcon sx={{ color: "white" }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Cài đặt Không gian làm việc" />
            {openSettings ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse in={openSettings} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon sx={{ color: "white" }}>
                  <ViewKanbanIcon />
                </ListItemIcon>
                <ListItemText
                  component={Link}
                  to={`/w/${currentWorkspace?.name}/account`}
                  primary="Cài đặt không gian làm việc"
                />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon sx={{ color: "white" }}>
                  <UpgradeIcon />
                </ListItemIcon>
                <ListItemText primary="Nâng cấp không gian làm việc" />
              </ListItemButton>
            </List>
          </Collapse>
        </List>
      )}

      {!isGuest && (
        // <Box sx={{ width: 250, height: "100vh" }}>
          <List>
            {/* Các mục khác trong sidebar (nếu có) */}

            {/* Nhóm "Xem không gian làm việc" */}
            {!isGuest && (
              <Box>
                <ListSubheader
                  sx={{
                    bgcolor: "black",
                    color: "white",
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                    pt: 2, // Khoảng cách phía trên
                  }}
                >
                  Xem không gian làm việc
                </ListSubheader>

                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    to={`/w/${currentWorkspace?.name}/table-view`}
                  >
                    <ListItemIcon sx={{ color: "white" }}>
                      <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Bảng" />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    to={`/w/${currentWorkspace?.name}/calendar`}
                  >
                    <ListItemIcon sx={{ color: "white" }}>
                      <CalendarMonthIcon />
                    </ListItemIcon>
                    <ListItemText primary="Calendar" />
                  </ListItemButton>
                </ListItem>
              </Box>
            )}
          </List>
       
      )}
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ px: 2, mt: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '15px' }}>
          Các bảng của bạn
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          {!isMember && (
            <IconButton size="small" onClick={handleOpen}>
              <AddIcon fontSize="small" sx={{ color: '#fff' }} />
            </IconButton>
          )}
        </Box>
      </Box>

      <List sx={{ p: 0.5 }}>
        {(isGuest ? foundWorkspace : currentWorkspace)?.boards
          .filter((board) => board.closed === 0)
          .map((board) => (
            <ListItem
              key={board.id}
              disablePadding
              sx={{ p: 1, display: "flex", alignItems: "center" }}
            >
              {/* Phần tên bảng dẫn link */}
              <ListItemButton
                component={Link}
                to={`/b/${board.id}/${board.name}`}
                sx={{
                  flexGrow: 1,
                  backgroundColor:
                    board.id === Number(board.id) ? "#ffffff33" : "transparent",
                  "&:hover": { backgroundColor: "#ffffff22" },
                  borderRadius: "6px",
                }}
              >
                <ListItemIcon sx={{ color: "white" }}>
                  <FolderIcon />
                </ListItemIcon>
                <ListItemText
                  primary={board.name}
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                />
              </ListItemButton>

              {/* Nút ... mở dropdown, tách riêng hoàn toàn */}
              <IconButton
                onClick={(e) => handleMenuOpen(e, board.id)}
                sx={{ color: "white", ml: "auto" }}
              >
                <MoreVertIcon />
              </IconButton>

              {/* Dropdown menu của từng bảng */}
              <Menu
                anchorEl={menuAnchor}
                open={selectedBoardId === board.id}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                sx={{
                  "& .MuiPaper-root": {
                    backgroundColor: "#2e2e2e",
                    color: "white",
                    borderRadius: "8px",
                    minWidth: "300px",
                  },
                }}
              >
                <MenuItem
                  disabled
                  sx={{
                    fontWeight: "bold",
                    fontSize: "1rem",
                    opacity: 1,
                    textAlign: "center",
                    justifyContent: "center",
                    color: "#fff",
                    padding: "12px 16px",
                  }}
                >
                  {board.name}
                </MenuItem>

                {(adminCount >= 2 || isMember) && (
                  [
                    {
                      text: "Rời khỏi bảng",
                      icon: <ExitToAppIcon />,
                      color: "#ff4d4d",
                    },
                  ].map((item, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => console.log(item.text)}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px 16px",
                        "&:hover": { backgroundColor: item.color, color: "white" },
                      }}
                    >
                      {item.text}
                      {item.icon}
                    </MenuItem>
                  ))
                )}


                {!isMember && (
                  [
                    { text: "Đóng bảng", icon: <CloseIcon />, color: "#ff4d4d" },
                  ].map((item, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => handleCloseBoard(board.id)}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px 16px",
                        "&:hover": { backgroundColor: item.color, color: "white" },
                      }}
                    >
                      {item.text}
                      {item.icon}
                    </MenuItem>
                  ))
                )}

              </Menu>
            </ListItem>
          ))}
      </List>

      {isGuest && checkMember?.is_member === false && (
        <Box sx={{ p: 2, bgcolor: "#292929", mt: 9.5, borderRadius: "8px" }}>
          <Typography variant="body2" sx={{ fontSize: "13px", color: "#ccc" }}>
            Bạn đang là Khách của không gian làm việc này, muốn xem thêm bảng và thành viên khác hãy gửi yêu cầu cho quản trị viên không gian làm việc này.
          </Typography>
          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 1,
              bgcolor: "#1976d2",
              color: "white",
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": {
                bgcolor: "#1565c0",
              },
            }}
            onClick={() => {
              // Gọi API yêu cầu tham gia không gian làm việc ở đây
              console.log("Yêu cầu tham gia không gian làm việc");
            }}
          >
            Yêu cầu tham gia không gian làm việc
          </Button>
        </Box>
      )}

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
          {selectedBg && (
            <Box
              sx={{
                width: "100%",
                height: "100px",
                background: selectedBg.startsWith("#")
                  ? selectedBg
                  : `url(${selectedBg}) center/cover no-repeat`,
                borderRadius: "8px",
              }}
            />
          )}

          {/* <Typography variant="subtitle1" mt={2} fontWeight="bold">
            Phông nền
          </Typography>



          {colors?.length > 0 ? (
            <Grid container spacing={1} mt={1}>
              {colors.map((color) => (
                <Grid item key={color.id}>
                  <Box
                    sx={{
                      width: "50px",
                      height: "35px",
                      backgroundColor: color.hex_code,
                      borderRadius: "4px",
                      cursor: "pointer",
                      border:
                        selectedBg === color.hex_code ? "2px solid #007BFF" : "none",
                    }}
                    onClick={() => handleSelectBg(color.hex_code)}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>Không có màu nào khả dụng</Typography>
          )} */}

          <Typography variant="subtitle1" mt={2} fontWeight="bold">
            Ảnh từ Unsplash
          </Typography>

          {/* Ảnh từ Unsplash */}
          <Grid container spacing={1} mt={1}>
            {unsplashImages?.map((image, index) => (
              <Grid item key={index}>
                <Box
                  component="img"
                  src={image.urls.small}
                  sx={{
                    width: "50px",
                    height: "35px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    border:
                      selectedBg === image.urls.small
                        ? "2px solid #007BFF"
                        : "none",
                  }}
                  onClick={() => handleSelectBg(image.urls.small)}
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

          {isLoadingWorkspaces ? (
            <Typography>Đang tải...</Typography>
          ) : error ? (
            <Typography color="error">Lỗi tải workspace</Typography>
          ) : (
            <Select
              fullWidth
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
              sx={{ marginBottom: 2 }}
            >
              {(memoizedWorkspaces ?? []).map((ws) => (
                <MenuItem key={ws.id} value={ws.id}>
                  {ws.name}
                </MenuItem>
              ))}
            </Select>
          )}

          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
            Quyền xem
          </Typography>
          <Select
            fullWidth
            value={viewPermission}
            onChange={(e) => setViewPermission(e.target.value)}
            sx={{ marginBottom: 2 }}
          >
            {/* <MenuItem value="default">Không gian làm việc</MenuItem> */}
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

          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateBoard}
              disabled={isCreatingBoard || boardTitle.trim() === ""}
            >
              {isCreatingBoard ? "Đang tạo..." : "Tạo bảng"}
            </Button>
          </Box>
        </Box>
      </Popover>
    </Drawer>


  );
};

export default SideBar;



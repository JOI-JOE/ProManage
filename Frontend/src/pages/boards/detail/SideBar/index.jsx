import React, { useContext, useState } from "react";
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
  Button,
  ListSubheader,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
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
import { useToggleBoardClosed } from "../../../../hooks/useBoard";
import { useGetBoardMembers, useGuestBoards } from "../../../../hooks/useInviteBoard";
import { useCheckMemberInWorkspace, useGetWorkspaces } from "../../../../hooks/useWorkspace";
import { useUser } from "../../../../hooks/useUser";

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
  // console.log(foundWorkspace);
  const { data: checkMember } = useCheckMemberInWorkspace(foundWorkspace?.workspace_id, user?.id);

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
    <Box sx={{ width: 250,  height: "100vh" }}>
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
        </Box>
      <Typography sx={{ ml: 2, mt: 2, color: "gray", fontSize: "14px" }}>
        Các bảng của bạn
      </Typography>

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
      {/* 👇 Nút yêu cầu tham gia đặt cuối cùng, luôn nằm dưới */}
   {isGuest && checkMember?.is_member === false && (
    <Box sx={{ p: 2, bgcolor: "#292929", mt: 9.5, borderRadius: "8px" }}>
      <Typography variant="body2" sx={{ fontSize: "13px", color: "#ccc" }}>
  Bạn đang là Khách của không gian làm việc này, muốn xem thêm bảng và thành viên khác hãy gửi yêu cầu cho quản trị viên không gian làm việc này. 
</Typography>
      <Button
        fullWidth
        variant="contained"
        sx={{
          mt:1,
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

    </Drawer>
  );
};

export default SideBar;

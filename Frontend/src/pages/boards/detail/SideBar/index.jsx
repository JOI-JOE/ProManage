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
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CloseIcon from "@mui/icons-material/Close";
import { useToggleBoardClosed } from "../../../../hooks/useBoard";
import { useGetBoardMembers, useGuestBoards } from "../../../../hooks/useInviteBoard";
import { useGetWorkspaces } from "../../../../hooks/useWorkspace";
import { useWorkspace } from "../../../../contexts/WorkspaceContext";
import { useMe } from "../../../../contexts/MeContext";

const SideBar = ({ board }) => {
  const { boardIds } = useMe();
  const { boardId, workspaceName } = useParams();
  const { workspaces } = useWorkspace();

  const workspace = workspaces.find((ws) => ws.id === board?.workspace_id)
  const boards = workspace?.boards || [];
  const isMemberWorkspace = workspace?.joined === 1;
  const isMemberBoard = boardIds.includes(Number(boardId));

  console.log(isMemberWorkspace, 'thành viên không gina')
  console.log(isMemberBoard, 'thành viên bảng')

  // console.log(boardId);
  // const { data: guestBoards } = useGuestBoards();
  // console.log(guestBoards);
  // const { currentWorkspace } = useContext(WorkspaceContext);
  // const { data: boardMembers = [] } = useGetBoardMembers(boardId);

  // const currentUserId = user?.id;

  // const isMember = Array.isArray(boardMembers?.data)
  //   ? boardMembers.data.some(member =>
  //     member.id === currentUserId && member.pivot.role === "member"
  //   )
  //   : false;

  // const adminCount = boardMembers?.data?.filter((m) => m.pivot.role === "admin").length;
  // console.log(adminCount);

  // useMemberJoinedListener(user?.id)



  // const foundWorkspace = guestBoards?.find((workspace) =>
  //   workspace.boards.some((board) => board.id === boardId)
  // );
  // console.log(foundWorkspace);

  // let isGuest = false;
  // if (foundWorkspace) {
  //   isGuest = true;
  // }
  // console.log(isGuest);

  // const activeData = foundWorkspace || currentWorkspace;

  // const [openSettings, setOpenSettings] = useState(false);
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

  const { mutate: toggleBoardClosed } = useToggleBoardClosed();
  const handleCloseBoard = (boardId) => {
    toggleBoardClosed(boardId);
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
            {/* {isGuest
              ? foundWorkspace?.workspace_name
              : currentWorkspace?.display_name} */}
            {workspace?.display_name}
          </Typography>
        </Box>
      </Box>

      {isMember && (
        <></>
        // <List>
        //   <ListItem disablePadding>
        //     <ListItemButton
        //       component={Link}
        //       to={`/w/${selectedWorkspace?.name}`}
        //     >
        //       <ListItemIcon sx={{ color: "white" }}>
        //         <DashboardIcon />
        //       </ListItemIcon>
        //       <ListItemText primary="Bảng" />
        //     </ListItemButton>
        //   </ListItem>

        //   <ListItem disablePadding>
        //     <ListItemButton
        //       component={Link}
        //       to={`/w/${selectedWorkspace?.name}/members`}
        //     >
        //       <ListItemIcon sx={{ color: "white" }}>
        //         <PeopleIcon />
        //       </ListItemIcon>
        //       <ListItemText primary="Thành viên" />
        //       <AddIcon sx={{ color: "gray" }} />
        //     </ListItemButton>
        //   </ListItem>

        //   <ListItemButton onClick={toggleSettings}>
        //     <ListItemIcon sx={{ color: "white" }}>
        //       <SettingsIcon />
        //     </ListItemIcon>
        //     <ListItemText primary="Cài đặt Không gian làm việc" />
        //     {openSettings ? <ExpandLess /> : <ExpandMore />}
        //   </ListItemButton>

        //   <Collapse in={openSettings} timeout="auto" unmountOnExit>
        //     <List component="div" disablePadding>
        //       <ListItemButton sx={{ pl: 4 }} component={Link} to={`/w/${selectedWorkspace?.name}/account`}>
        //         <ListItemIcon sx={{ color: "white" }}>
        //           <ViewKanbanIcon />
        //         </ListItemIcon>
        //         <ListItemText primary="Cài đặt không gian làm việc" />
        //       </ListItemButton>
        //       <ListItemButton sx={{ pl: 4 }}>
        //         <ListItemIcon sx={{ color: "white" }}>
        //           <UpgradeIcon />
        //         </ListItemIcon>
        //         <ListItemText primary="Nâng cấp không gian làm việc" />
        //       </ListItemButton>
        //     </List>
        //   </Collapse>
        // </List>
      )}
      {isMember && (
        <Box>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to={`/w/${workspace?.name}/calendar`}
            >
              <ListItemIcon sx={{ color: "white" }}>
                <CalendarMonthIcon />
              </ListItemIcon>
              <ListItemText primary="Calendar" />
            </ListItemButton>
          </ListItem>
        </Box>
      )}
      <Typography sx={{ ml: 2, mt: 2, color: "gray", fontSize: "14px" }}>
        Các bảng của bạn
      </Typography>
      <List sx={{ p: 0.5 }}>
        {workspace?.boards.map((board) => {
          const isCurrent = board.id === Number(board.id); // Cần kiểm tra lại điều kiện này
          const isSelected = selectedBoardId === board.id;

          return (
            <ListItem
              key={board.id}
              disablePadding
              sx={{ p: 1, display: "flex", alignItems: "center" }}
            >
              <ListItemButton
                component={Link}
                to={`/b/${board.id}/${board.name}`}
                sx={{
                  flexGrow: 1,
                  backgroundColor: isCurrent ? "#ffffff33" : "transparent",
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

              <IconButton
                onClick={(e) => handleMenuOpen(e, board.id)}
                sx={{ color: "white", ml: "auto" }}
              >
                <MoreVertIcon />
              </IconButton>

              <Menu
                anchorEl={menuAnchor}
                open={isSelected}
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
                  <MenuItem
                    onClick={() => console.log("Rời khỏi bảng")}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 16px",
                      "&:hover": { backgroundColor: "#ff4d4d", color: "white" },
                    }}
                  >
                    Rời khỏi bảng
                    <ExitToAppIcon />
                  </MenuItem>
                )}

                {!isMember && (
                  <MenuItem
                    onClick={() => handleCloseBoard(board.id)}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 16px",
                      "&:hover": { backgroundColor: "#ff4d4d", color: "white" },
                    }}
                  >
                    Đóng bảng
                    <CloseIcon />
                  </MenuItem>
                )}
              </Menu>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

export default SideBar;
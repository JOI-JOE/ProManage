import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CloseIcon from "@mui/icons-material/Close";
import { useToggleBoardClosed } from "../../../../hooks/useBoard";
import { useBoard } from "../../../../contexts/BoardContext";
import { useWorkspace } from "../../../../contexts/WorkspaceContext";
import PrivateSideBar from "./component/PrivateSideBar";
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import LogoLoading from "../../../../components/LogoLoading";

// Custom hook chứa toàn bộ logic
const useSideBarLogic = () => {
  const { workspaces, guestWorkspaces } = useWorkspace();
  const { workspaceName } = useParams();
  const { workspace, isActive, boardLoading, listLoading } = useBoard();
  const { mutate: toggleBoardClosed } = useToggleBoardClosed();

  // State cho UI
  const [openSettings, setOpenSettings] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [workspaceState, setWorkspaceState] = useState({
    currentWorkspace: null,
    boards: [],
  });

  // Callback cho UI
  const toggleSettings = useCallback(() => setOpenSettings((prev) => !prev), []);
  const handleMenuOpen = useCallback((event, boardId) => {
    setMenuAnchor(event.currentTarget);
    setSelectedBoardId(boardId);
  }, []);
  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
    setSelectedBoardId(null);
  }, []);
  const handleCloseBoard = useCallback(
    (boardId) => {
      toggleBoardClosed(boardId);
      handleMenuClose();
    },
    [toggleBoardClosed, handleMenuClose]
  );

  const workspacesData = useMemo(() => {
    const memberWorkspaces = (workspaces || []).map((ws) => ({
      ...ws,
      boards: ws.boards || [],
      isMember: true,
    }));
    const guestWorkspacesList = (guestWorkspaces || []).map((ws) => ({
      ...ws,
      boards: ws.boards || [],
      isMember: false,
    }));
    return [...memberWorkspaces, ...guestWorkspacesList];
  }, [workspaces, guestWorkspaces]);

  const findWorkspace = useCallback(
    (id, name) => workspacesData.find((ws) => (id ? ws.id === id : ws.name === name)) || null,
    [workspacesData]
  );

  useEffect(() => {
    const id = workspace?.id;
    const name = workspaceName;
    const foundWorkspace = findWorkspace(id, name);

    if (foundWorkspace && foundWorkspace !== workspaceState.currentWorkspace) {
      setWorkspaceState({
        currentWorkspace: foundWorkspace,
        boards: foundWorkspace.boards || [],
      });
    }
  }, [workspaceName, workspace?.id, findWorkspace, workspaceState.currentWorkspace]);

  const isMember = workspaceState.currentWorkspace?.isMember || false;

  return {
    openSettings,
    toggleSettings,
    menuAnchor,
    selectedBoardId,
    handleMenuOpen,
    handleMenuClose,
    handleCloseBoard,
    currentWorkspace: workspaceState.currentWorkspace,
    boards: workspaceState.boards,
    isMember,
    isActive,
    boardLoading,
    listLoading,
  };
};

// Component chính giữ nguyên giao diện CSS
const SideBar = () => {
  const {
    openSettings,
    toggleSettings,
    menuAnchor,
    selectedBoardId,
    handleMenuOpen,
    handleMenuClose,
    handleCloseBoard,
    currentWorkspace,
    boards,
    isMember,
    isActive,
    boardLoading,
    listLoading,
  } = useSideBarLogic();

  {
    // listLoading || !currentWorkspace 
    if (boardLoading) {
      <LogoLoading />
    }


    if (isActive === "request_access" && !isMember) {
      return (
        <PrivateSideBar />
      )
    }

    return (
      <Drawer
        variant="permanent"
        sx={{
          width: "19%",
          height: (theme) => `calc(${theme.trello.boardContentHeight} + ${theme.trello.boardBarHeight})`,
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

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, bgcolor: "#292929" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {!currentWorkspace ? (
              <>
                <Avatar
                  sx={{
                    bgcolor: "hsl(0deg 0% 92.16%)",
                    color: "gray",
                    width: 40,  // Đặt chiều rộng
                    height: 40, // Đặt chiều cao
                    borderRadius: '8px', // Bo góc nhẹ nếu cần
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PeopleRoundedIcon />
                </Avatar>
                <Typography variant="body1" sx={{ fontWeight: "bold", color: "gray" }}>
                  Không gian làm việc
                </Typography>
              </>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: "hsl(0deg 0% 92.16%)",
                    color: "gray",
                    width: 40,  // Đặt chiều rộng
                    height: 40, // Đặt chiều cao
                    borderRadius: '8px', // Bo góc nhẹ nếu cần
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  K
                </Avatar>
                <Typography variant="body1" sx={{ fontWeight: "bold", color: "gray" }}>
                  {currentWorkspace?.display_name}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <List id="controller-for-member-worksace">
          {(currentWorkspace?.memberships?.length > 0 || isMember) && (
            <>
              <ListItem disablePadding>
                <ListItemButton component={Link} to={`/w/${currentWorkspace?.name}`}>
                  <ListItemIcon sx={{ color: "white" }}>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="Bảng" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton component={Link} to={`/w/${currentWorkspace?.name}/members`}>
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
                    <ListItemText component={Link} to={`/w/${currentWorkspace?.name}/account`} primary="Cài đặt không gian làm việc" />
                  </ListItemButton>
                  <ListItemButton sx={{ pl: 4 }}>
                    <ListItemIcon sx={{ color: "white" }}>
                      <UpgradeIcon />
                    </ListItemIcon>
                    <ListItemText primary="Nâng cấp không gian làm việc" />
                  </ListItemButton>
                </List>
              </Collapse>
            </>
          )}
        </List>

        <List sx={{ p: 0.5 }}>
          {boards?.length > 0 && (
            <Box id="my-board">
              <Typography sx={{ ml: 2, mt: 2, color: "gray", fontSize: "14px" }}>Các bảng của bạn</Typography>
              {boards.map((board) => (
                <ListItem key={board.id} disablePadding sx={{ p: 1, display: "flex", alignItems: "center" }}>
                  <ListItemButton
                    component={Link}
                    to={`/b/${board.id}/${board.name}`}
                    sx={{
                      flexGrow: 1,
                      backgroundColor: board.id === selectedBoardId ? "#ffffff33" : "transparent",
                      "&:hover": { backgroundColor: "#ffffff22" },
                      borderRadius: "6px",
                    }}
                  >
                    <ListItemIcon sx={{ color: "white" }}>
                      <FolderIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={board.name}
                      sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                    />
                  </ListItemButton>

                  <IconButton onClick={(e) => handleMenuOpen(e, board.id)} sx={{ color: "white", ml: "auto" }}>
                    <MoreVertIcon />
                  </IconButton>

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
                    <MenuItem disabled sx={{ fontWeight: "bold", fontSize: "1rem", opacity: 1, textAlign: "center", justifyContent: "center", color: "#fff", padding: "12px 16px" }}>
                      {board.name}
                    </MenuItem>
                    {[{ text: "Rời khỏi bảng", icon: <ExitToAppIcon />, color: "#ff4d4d" }].map((item, index) => (
                      <MenuItem
                        key={index}
                        onClick={() => console.log(item.text)} // Thay bằng logic tương ứng nếu cần
                        sx={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", "&:hover": { backgroundColor: item.color, color: "white" } }}
                      >
                        {item.text}
                        {item.icon}
                      </MenuItem>
                    ))}
                    {[{ text: "Đóng bảng", icon: <CloseIcon />, color: "#ff4d4d" }].map((item, index) => (
                      <MenuItem
                        key={index}
                        onClick={() => handleCloseBoard(board.id)}
                        sx={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", "&:hover": { backgroundColor: item.color, color: "white" } }}
                      >
                        {item.text}
                        {item.icon}
                      </MenuItem>
                    ))}
                  </Menu>
                </ListItem>
              ))}
            </Box>
          )}
        </List>
      </Drawer>
    );
  };
}

export default SideBar;
import React, { useContext, useEffect, useMemo, useState } from "react";
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
import AddIcon from "@mui/icons-material/Add";
import FolderIcon from "@mui/icons-material/Folder";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import { useToggleBoardClosed } from "../../../../hooks/useBoard";
import { useWorkspace } from "../../../../contexts/WorkspaceContext";
import { useMe } from "../../../../contexts/MeContext";
import LogoLoading from "../../../../components/Common/LogoLoading";
import WorkspaceAvatar from "../../../../components/Common/WorkspaceAvatar";
import { useSendJoinRequest } from "../../../../hooks/useWorkspaceInvite";
import CreateBoard from "../../../../components/CreateBoard";
import PrivateSideBar from "../Private/PrivateSideBar";


const SideBar = ({ board, isLoadingBoard }) => {
  const { boardId, workspaceId } = useParams();
  const { boardIds, pendingIds } = useMe();
  const { workspaces, guestWorkspaces, isLoading } = useWorkspace();

  // Workspace hiện tại
  const currentWorkspace = useMemo(() => {
    if (board?.workspace_id) {
      // Ưu tiên tìm trong workspaces
      const ws = workspaces.find((ws) => ws.id === board.workspace_id);
      if (ws) return ws;
      // Nếu không có, tìm trong guestWorkspaces
      return guestWorkspaces.find((ws) => ws.id === board.workspace_id);
    }

    if (workspaceId) {
      const ws = workspaces.find((ws) => ws.id === workspaceId);
      if (ws) return ws;

      return guestWorkspaces.find((ws) => ws.id === workspaceId);
    }
    return null;
  }, [workspaces, guestWorkspaces, board?.workspace_id, workspaceId]);

  // Là admin board?
  const isAdminBoard = useMemo(() => {
    const boardInfo = boardIds?.find((b) => b.id === board?.id);
    return boardInfo?.is_admin || boardInfo?.role === 'admin';
  }, [boardIds, boardId, boardIds?.find(b => b.id === board?.id)?.role]);


  // Là thành viên workspace?
  const isMemberWorkspace = currentWorkspace?.joined === 1;
  const isBoardMember = boardIds?.some((b) => b.id === boardId);


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

  const { mutate: toggleBoardClosed } = useToggleBoardClosed(currentWorkspace?.id);
  const handleCloseBoard = (boardId) => {
    toggleBoardClosed(boardId);
    handleMenuClose();
  };

  const [isPendingWorkspace, setIsPendingWorkspace] = useState(false);

  useEffect(() => {
    setIsPendingWorkspace(pendingIds?.some((ws) => ws.id === board?.workspace_id));
  }, [pendingIds, board?.workspace_id]); // Chạy lại mỗi khi pendingIds hoặc workspace_id thay đổi

  const { mutate: sendRequestAttends, isLoading: loadingJoind, isError, error } = useSendJoinRequest();

  const handleJoinRequest = async () => {
    try {
      await sendRequestAttends({ workspaceId: board.workspace_id });
      // Cập nhật lại state khi yêu cầu tham gia đã được gửi
      setIsPendingWorkspace(true);
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu tham gia bảng:", error);
    }
  };

  // Function tạo board 
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenCreateBoard = (event) => {
    setAnchorEl(event.currentTarget);
    setShowCreateBoard(true);
  };

  const handleCloseCreateBoard = () => {
    setShowCreateBoard(false);
    setAnchorEl(null);
  };

  // trường hợp chúng ta không phải thành  viên của bảng và không phải thành viên của workspace 

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
      {isLoading || isLoadingBoard ? (
        <Box sx={{ p: 2 }}>
          <LogoLoading />
        </Box>
      ) : !isBoardMember && !isMemberWorkspace ? (
        <PrivateSideBar />
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 2,
              bgcolor: "#292929",
            }}
          >
            <WorkspaceAvatar workspace={currentWorkspace} />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {currentWorkspace?.display_name}
              </Typography>
            </Box>
          </Box>

          {isMemberWorkspace && (
            <List>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to={`/w/${currentWorkspace?.id}`}
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
                  to={`/w/${currentWorkspace?.id}/members`}
                >
                  <ListItemIcon sx={{ color: "white" }}>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Thành viên" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to={`/w/${currentWorkspace?.id}/account`}
                >
                  <ListItemIcon sx={{ color: "white" }}>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Cài đặt không gian làm việc" />
                </ListItemButton>
              </ListItem>
              <ListItemText
              />
            </List>
          )}

          <List>
            {isMemberWorkspace && (
              <Box>
                <ListSubheader
                  sx={{
                    bgcolor: "black",
                    color: "white",
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                    // pt: 2,
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

          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ px: 2, mt: 2 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '15px' }}>
              Các bảng của bạn
            </Typography>
            {isMemberWorkspace && (
              <IconButton
                onClick={handleOpenCreateBoard}
                sx={{
                  bgcolor: "#e0e0e0",
                  borderRadius: "8px",
                  p: "6px",
                  ":hover": {
                    bgcolor: "#bdbdbd",
                  },
                }}
              >
                <AddIcon sx={{ fontSize: 20, color: "#424242" }} />
              </IconButton>
            )}

            <CreateBoard
              workspaceId={currentWorkspace?.id} // Truyền workspaceId nếu cần
              open={showCreateBoard}
              anchorEl={anchorEl}
              onClose={handleCloseCreateBoard}
            />
          </Box>

          <List sx={{ p: 0.5 }}>
            {currentWorkspace?.boards
              ?.filter((board) => board.closed === false)
              .map((board) => {
                const isCurrent = board.id === boardId;
                const isBoardAdmin = board.role === "admin";
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
                    {isBoardAdmin && (
                      <>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, board.id)}
                          sx={{ color: "white", ml: "auto" }}
                        >
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
                          {/* Tên board */}
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
                              pointerEvents: "none", // để chắc chắn không cho tương tác
                            }}
                          >
                            {board.name}
                          </MenuItem>

                          <MenuItem
                            onClick={() => handleCloseBoard(board.id)}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "10px 16px",
                              "&:hover": {
                                backgroundColor: "#ff4d4d",
                                color: "#fff",
                              },
                            }}
                          >
                            Đóng bảng
                            <CloseIcon />
                          </MenuItem>
                        </Menu>
                      </>

                    )}


                  </ListItem>
                );
              })}
          </List>

          {!isMemberWorkspace && isBoardMember && (
            <Box
              sx={{
                position: "absolute",
                bottom: 16,
                left: 0,
                right: 0,
                px: 2,
                zIndex: 1300,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#292929",
                  borderRadius: "8px",
                  maxWidth: 400,
                  width: "100%",
                }}
              >
                {isPendingWorkspace ? (
                  <>
                    <Typography variant="body2" sx={{ fontSize: "13px", color: "#ccc" }}>
                      Bạn đã gửi yêu cầu tham gia bảng này. Vui lòng chờ quản trị viên phê duyệt.
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" sx={{ fontSize: "13px", color: "#ccc" }}>
                      Bạn là thành viên của không gian làm việc này nhưng chưa tham gia bảng này. Hãy gửi yêu cầu cho quản trị viên để tham gia bảng.
                    </Typography>

                    {
                      loadingJoind ? (
                        <LogoLoading />
                      ) : (
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
                          onClick={handleJoinRequest}
                          disabled={loadingJoind} // Vô hiệu hoá nút khi đang gửi yêu cầu
                        >
                          Yêu cầu tham gia bảng
                        </Button>
                      )
                    }
                    {isError && <Typography color="error">{error?.message || "Đã xảy ra lỗi khi gửi yêu cầu tham gia bảng."}</Typography>}
                  </>
                )}
              </Box>
            </Box>
          )}

        </>
      )}

    </Drawer>
  );
};

export default SideBar;
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
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
import { useBoard } from "../../../../contexts/BoardContext";
import { useWorkspace } from "../../../../contexts/WorkspaceContext";
import LogoLoading from "../../../../components/LogoLoading";
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';


const SideBar = () => {

  const [openSettings, setOpenSettings] = useState(false);
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
  const { data } = useWorkspace();
  const { workspaceName } = useParams();
  const { workspace, isActive, boardLoading, listLoading } = useBoard();

  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [boards, setBoards] = useState([]);

  // Cache dữ liệu workspaces từ data
  const workspacesData = useMemo(() => {
    const memberWorkspaces = (data?.workspaces || []).map(ws => ({
      ...ws,
      boards: ws.boards || [],
      isMember: true,
    }));
    const guestWorkspaces = (data?.guestWorkspaces || []).map(ws => ({
      ...ws,
      boards: ws.boards || [],
      isMember: false,
    }));
    return [...memberWorkspaces, ...guestWorkspaces];
  }, [data]);

  // Hàm tìm workspace theo id hoặc name
  const findWorkspace = useCallback(
    (id, name) => {
      return workspacesData.find(ws => (id ? ws.id === id : ws.name === name)) || null;
    },
    [workspacesData]
  );

  // Cập nhật currentWorkspace và boards dựa trên workspaceName hoặc workspace.id
  useEffect(() => {
    let foundWorkspace = null;

    if (workspaceName) {
      foundWorkspace = findWorkspace(null, workspaceName);
    } else if (workspace?.id) {
      foundWorkspace = findWorkspace(workspace.id, null);
    }

    if (foundWorkspace && foundWorkspace !== currentWorkspace) {
      setCurrentWorkspace(foundWorkspace);
      setBoards(foundWorkspace.boards || []);
    }
  }, [workspaceName, workspace?.id, findWorkspace, currentWorkspace]);

  // Kiểm tra user có phải là member của workspace hiện tại không
  const isMember = currentWorkspace?.isMember || false;

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
      {listLoading || !boards || !currentWorkspace ? (
        <LogoLoading />
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box>
                {isActive === 'request_access' ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ bgcolor: 'hsl(0deg 0% 92.16%)', color: 'gray' }}>
                      <LockOutlinedIcon />
                    </Avatar>
                    <Typography variant="body1" sx={{ fontWeight: "bold", color: "gray" }}>
                      Không gian làm việc riêng tư
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ bgcolor: "#5D87FF" }}>K</Avatar>
                    <Typography variant="body1" sx={{ fontWeight: "bold", color: "gray" }}>
                      {currentWorkspace?.display_name}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>


          <List id="controller-for-member-worksace">
            {workspace?.memberships && workspace?.memberships?.length > 0 || isMember ? (
              <>
                {/* Hiển thị bảng trong workspace */}
                <ListItem disablePadding>
                  <ListItemButton component={Link} to={`/w/${currentWorkspace?.name}`}>
                    <ListItemIcon sx={{ color: "white" }}>
                      <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Bảng" />
                  </ListItemButton>
                </ListItem>

                {/* Hiển thị danh sách thành viên trong workspace */}
                <ListItem disablePadding>
                  <ListItemButton component={Link} to={`/w/${currentWorkspace?.name}/members`}>
                    <ListItemIcon sx={{ color: "white" }}>
                      <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Thành viên" />
                    <AddIcon sx={{ color: "gray" }} />
                  </ListItemButton>
                </ListItem>

                {/* Hiển thị phần cài đặt cho workspace */}
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
              </>
            ) : (
              // Nếu người dùng không phải là thành viên của workspace
              <ListItem disablePadding>
                {isActive === 'request_access' ? (
                  <Box sx={{
                    p: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    mb: 2
                  }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '12px',
                        lineHeight: '16px',
                        mb: 1
                      }}
                    >
                      Vì bạn không phải là thành viên của Không gian làm việc này nên bạn không thể thấy các bảng hoặc thông tin khác của Không gian làm việc này.
                    </Typography>

                    <Box sx={{ display: 'flex', m: 2 }}>
                      <HomeRoundedIcon sx={{ marginRight: '8px' }} />
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '12px',
                          lineHeight: '16px'
                        }}
                      >
                        Để xem các Không gian làm việc và các bảng mà bạn là thành viên, bạn có thể <Link href="/" sx={{ color: '#579dff', textDecoration: 'underline' }}>truy cập trang chủ</Link> của mình.
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  null
                )}
              </ListItem>
            )}
          </List>



          <List sx={{ p: 0.5 }}>
            {boards && boards.length > 0 && (
              <Box id="my-board">
                <Typography sx={{ ml: 2, mt: 2, color: "gray", fontSize: "14px" }}>
                  Các bảng của bạn
                </Typography>

                {boards.map((board) => (
                  <ListItem key={board.id} disablePadding sx={{ p: 1, display: "flex", alignItems: "center" }}>
                    {/* Phần tên bảng dẫn link */}
                    <ListItemButton
                      component={Link}
                      to={`/b/${board.id}/${board.name}`}
                      sx={{
                        flexGrow: 1,
                        backgroundColor: board.id === Number(board.id) ? "#ffffff33" : "transparent",
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

                    {/* Nút ... mở dropdown */}
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
                      {/* Hiển thị tên bảng trong menu */}
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

                      {/* Các tùy chọn menu */}
                      {[{ text: "Rời khỏi bảng", icon: <ExitToAppIcon />, color: "#ff4d4d" }].map((item, index) => (
                        <MenuItem
                          key={index}
                          onClick={() => console.log(item.text)} // Bạn có thể thay bằng logic tương ứng
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
                      ))}

                      {[{ text: "Đóng bảng", icon: <CloseIcon />, color: "#ff4d4d" }].map((item, index) => (
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
                      ))}
                    </Menu>
                  </ListItem>
                ))}
              </Box>
            )}
          </List>
        </>
      )
      }
    </Drawer >
  );
};

export default SideBar;


{/* <Box>
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
      </Box> */}

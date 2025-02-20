import * as React from "react";
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
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";



const SideBar = () => {
    const [openSettings, setOpenSettings] = React.useState(false);

    const [boards, setBoards] = useState([]);
    // const { workspaceId } = useParams(); // Lấy workspaceId từ URL
    const { workspaceId, boardId } = useParams();
    const navigate = useNavigate();

    // useEffect(() => {
    //     if (workspaceId) {
    //         fetch(`http://127.0.0.1:8000/api/workspaces/${workspaceId}/boards`)
    //             .then((response) => response.json())
    //             .then((data) => {
    //                 if (data.success) {
    //                     setBoards(data.boards);

    //                     // Nếu boardId không hợp lệ hoặc không tồn tại trong workspace, điều hướng
    //                     const isBoardValid = data.boards.some((board) => board.id === Number(boardId));

    //                     if (!isBoardValid && data.boards.length > 0) {
    //                         navigate(`/workspaces/${workspaceId}/boards/${data.boards[0].id}`);
    //                     } else if (data.boards.length === 0) {
    //                         navigate(`/workspaces/${workspaceId}`);
    //                     }
    //                 }
    //             })
    //             .catch((error) => console.error("Lỗi khi lấy boards:", error));
    //     }
    // }, [workspaceId, boardId, navigate]);

    const toggleSettings = () => {
        setOpenSettings(!openSettings);
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: "19%",
                height: (theme) =>
                    `calc(${theme.trello.boardBarHeight} + ${theme.trello.boardContentHeight})`,
                borderTop: "1px solid #ffffff",

                "& .MuiDrawer-paper": {
                    boxSizing: "border-box",
                    bgcolor: "#000",
                    color: "#ffffff",
                    position: "relative",
                    overflowY: "auto", // Cho phép cuộn nếu nội dung quá dài

                    "&::-webkit-scrollbar": {
                        width: "6px", // Giảm kích thước scrollbar
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#B6BBBF", // Màu của thanh cuộn
                        borderRadius: "6px", // Làm thanh cuộn bo tròn
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "#ECF0F1", // Màu khi hover
                    },
                    "&::-webkit-scrollbar-track": {
                        m: 2,
                    },
                },
            }}
        >
            {/* Tiêu đề */}
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
                        Không gian làm việc của bạn...
                    </Typography>
                </Box>
            </Box>

            {/* Danh sách điều hướng */}
            <List>
                <ListItem disablePadding>
                    <Link to="/w/test" style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                        <ListItemButton>
                            <ListItemIcon sx={{ color: "white", fontSize: "small" }}>
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText primary="Bảng" />
                        </ListItemButton>
                    </Link>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon sx={{ color: "white" }}>
                            <PeopleIcon />
                        </ListItemIcon>
                        <ListItemText primary="Thành viên" />
                        <AddIcon sx={{ color: "gray" }} />
                    </ListItemButton>
                </ListItem>

                {/* Cài đặt không gian làm việc */}
                <ListItemButton onClick={toggleSettings}>
                    <ListItemIcon sx={{ color: "white" }}>
                        <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Các cài đặt Không gian làm việc" />
                    {openSettings ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>

                {/* Collapse: hiển thị hoặc ẩn danh sách con (animation mở rộng / thu nhỏ). */}
                <Collapse in={openSettings} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon sx={{ color: "white" }}>
                                <ViewKanbanIcon />
                            </ListItemIcon>
                            <ListItemText primary="Các cài đặt không gian làm việc" />
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

            {/* Các bảng làm việc */}
            <Typography sx={{ ml: 2, mt: 2, color: "gray", fontSize: "14px" }}>
                Các bảng của bạn
            </Typography>
            <List>
                {boards.map((board) => (
                    <ListItem key={board.id} disablePadding>
                        <ListItemButton
                            component={Link}
                            to={`/workspaces/${workspaceId}/boards/${board.id}`}
                            sx={{
                                backgroundColor: board.id === Number(boardId) ? "#ffffff33" : "transparent",
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
                    </ListItem>
                ))}
            </List>

        </Drawer>
    );
};
export default SideBar;

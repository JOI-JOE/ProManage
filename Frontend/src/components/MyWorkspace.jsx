import React, { useState } from "react";
import {
    Box,
    Typography,
    List,
    ListItem,
    Avatar,
    Button,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ViewStreamIcon from "@mui/icons-material/ViewStream";
import SettingsIcon from "@mui/icons-material/Settings";
import SignalCellularAltOutlinedIcon from "@mui/icons-material/SignalCellularAltOutlined";
import MyBoard from "./MyBoard";
import CreateBoard from "./CreateBoard";
import WorkspaceAvatar from "./Common/WorkspaceAvatar";
import { Link } from "react-router-dom";

const MyWorkspace = ({ workspace, boards }) => {
    // console.log(workspace.id);
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

    return (
        <div>
            <ListItem
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    gap: "20px",
                }}
            >
                {/* Avatar & Tiêu đề */}
                <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {/* Logo của workspace */}
                    <WorkspaceAvatar workspace={workspace} />
                    <Typography fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
                        {workspace.display_name.length > 20
                            ? `${workspace.display_name.substring(0, 20)}...`
                            : workspace.display_name}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <Button
                        variant="outlined"
                        component={Link}
                        to={`/w/${workspace?.id}`}
                        sx={{
                            backgroundColor: "#F8F9FA",
                            height: "36px",
                            borderRadius: "8px",
                            color: "#172B4D",
                            textTransform: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                        }}
                    >
                        <DashboardIcon fontSize="small" />
                        Bảng
                    </Button>

                    <Button
                        // w/:workspaceId
                        component={Link}
                        to={`/w/${workspace?.id}/table-view`}
                        variant="outlined"
                        sx={{
                            backgroundColor: "#F8F9FA",
                            height: "36px",
                            width: "130px",
                            borderRadius: "8px",
                            color: "#172B4D",
                            textTransform: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                        }}
                    >
                        <ViewStreamIcon fontSize="small" />
                        Dạng xem
                    </Button>

                    <Button
                        component={Link}
                        to={`/w/${workspace?.id}/members`}
                        variant="outlined"
                        sx={{
                            backgroundColor: "#F8F9FA",
                            height: "36px",
                            width: "160px",
                            borderRadius: "8px",
                            color: "#172B4D",
                            textTransform: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                        }}
                    >
                        <PeopleIcon fontSize="small" />
                        Thành viên ({workspace.member_count || 0})
                    </Button>

                    <Button
                        component={Link}
                        to={`/w/${workspace?.id}/account`}
                        variant="outlined"
                        sx={{
                            backgroundColor: "#F8F9FA",
                            height: "36px",
                            width: "120px",
                            borderRadius: "8px",
                            color: "#172B4D",
                            textTransform: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                        }}
                    >
                        <SettingsIcon fontSize="small" />
                        Cài đặt
                    </Button>
                </Box>
            </ListItem>

            {/* Danh sách bảng Trello */}
            <List sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                {boards
                    ?.filter((board) => board.closed === false && board.joined === true)
                    ?.sort((a, b) => {
                        const dateA = a.last_accessed ? new Date(a.last_accessed) : new Date(0);
                        const dateB = b.last_accessed ? new Date(b.last_accessed) : new Date(0);
                        return dateB - dateA;
                    })
                    ?.map((board) => (
                        <ListItem key={board.id} sx={{ width: "auto", padding: 0 }}>
                            <MyBoard key={board.id} board={board} id={`recent-board-${board.id}`} />
                        </ListItem>
                    ))}
                <ListItem sx={{ width: "auto", padding: 0 }}>
                    <Box
                        onClick={handleOpenCreateBoard}
                        sx={{
                            width: '193.88px',
                            height: '96px',
                            backgroundColor: '#091e420f',
                            borderRadius: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: "14px",
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: '#DCDFE4',
                                transition: 'background-color 85ms ease-in', // Apply transition to background-color
                            },
                        }}
                    >
                        Tạo bảng mới
                    </Box>
                </ListItem>
                <CreateBoard
                    workspaceId={workspace?.id} // Truyền workspaceId nếu cần
                    open={showCreateBoard}
                    anchorEl={anchorEl}
                    onClose={handleCloseCreateBoard}
                />
            </List>
            {/* <List sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                {activeBoards.length > 0 ? (
                    activeBoards.map((board) => (
                        <ListItem key={board.id} sx={{ width: "auto", padding: 0 }}>
                            <MyBoard key={board.id} board={board} id={`recent-board-${board.id}`} />
                        </ListItem>
                    ))
                ) : (
                    <Typography variant="body2" sx={{ color: "gray" }}>
                        Không có bảng nào đang mở.
                    </Typography>
                )}

                <CreateBoard />
            </List> */}
        </div >
    );
};

export default MyWorkspace;
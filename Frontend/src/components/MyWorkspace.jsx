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

const MyWorkspace = ({ workspace, boards }) => {

    const activeBoards = boards.filter(board => board.closed === 0);
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
                    <Avatar sx={{ bgcolor: "#5D87FF" }}>
                        {workspace.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
                        {workspace.name.length > 10 ? workspace.name.substring(0, 20) + "..." : workspace.name}
                    </Typography>
                </Box>

                {/* Các nút chức năng */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <Button
                        variant="outlined"
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
                        Thành viên ({workspace.members?.length || 0})
                    </Button>

                    <Button
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

                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "#EDEBFC",
                            height: "36px",
                            width: "140px",
                            borderRadius: "8px",
                            color: "#8250DF",
                            textTransform: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                        }}
                    >
                        <SignalCellularAltOutlinedIcon fontSize="small" />
                        Nâng cấp
                    </Button>
                </Box>
            </ListItem>

            {/* Danh sách bảng Trello */}
            {/* <List sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                {boards?.map((board) => (
                    <ListItem key={board.id} sx={{ width: "auto", padding: 0 }}>
                        <MyBoard key={board.id} board={board} id={`recent-board-${board.id}`} />
                    </ListItem>
                ))}

                <CreateBoard />
            </List> */}
            <List sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
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
            </List>
        </div>  
    );
};

export default MyWorkspace;

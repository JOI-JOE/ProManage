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

const MyWorkspace = ({ workspace, boards }) => {
    console.log(workspace);
    console.log(boards);

    return (
        <div>
            <ListItem
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    gap: " 20px",
                }}
            >
                {/* Avatar & Tiêu đề */}
                <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Avatar sx={{ bgcolor: "#5D87FF" }}>K</Avatar>
                    <Typography fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
                        {workspace.name}
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
                        Thành viên (1)
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
            <List sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                {boards.map((board) => (
                    <ListItem key={board.link} sx={{ width: "auto", padding: 0 }}>
                        <MyBoard key={board.link} board={board} id={`recent-board-${board.id}`} />
                    </ListItem>
                ))}

                <ListItem sx={{ width: "auto", padding: 0 }}>
                    <Box
                        sx={{
                            width: "180px",
                            height: "100px",
                            backgroundColor: "#EDEBFC",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            "&:hover": { backgroundColor: "#DCDFE4" },
                        }}
                    >
                        <Typography sx={{ color: "Black", fontWeight: "bold" }}>
                            Tạo bảng mới
                        </Typography>
                    </Box>
                </ListItem>
            </List>
        </div>
    )
}

export default MyWorkspace
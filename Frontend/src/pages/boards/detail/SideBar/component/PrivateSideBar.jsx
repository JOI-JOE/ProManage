import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    Box,
    Drawer,
    ListItem,
    Typography,
    Avatar,
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const PrivateSideBar = () => {
    return (
        <>
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
                <>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, bgcolor: "#292929" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Avatar sx={{ bgcolor: "hsl(0deg 0% 92.16%)", color: "gray" }}>
                                    <LockOutlinedIcon />
                                </Avatar>
                                <Typography variant="body1" sx={{ fontWeight: "bold", color: "gray" }}>
                                    Không gian làm việc riêng tư
                                </Typography>
                            </Box>

                        </Box>
                    </Box>

                    <ListItem disablePadding>
                        <Box sx={{ p: 2, backgroundColor: "rgba(255, 255, 255, 0.04)", mb: 2 }}>
                            <Typography
                                variant="body2"
                                sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "12px", lineHeight: "16px", mb: 1 }}
                            >
                                Vì bạn không phải là thành viên của Không gian làm việc này nên bạn không thể thấy các bảng hoặc thông tin khác của Không gian làm việc này.
                            </Typography>
                            <Box sx={{ display: "flex", m: 2 }}>
                                <HomeRoundedIcon sx={{ marginRight: "8px" }} />
                                <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "12px", lineHeight: "16px" }}>
                                    Để xem các Không gian làm việc và các bảng mà bạn là thành viên, bạn có thể{" "}
                                    <Link to="/" sx={{ color: "#579dff", textDecoration: "underline" }}>
                                        truy cập trang chủ
                                    </Link>{" "}
                                    của mình.
                                </Typography>
                            </Box>
                        </Box>
                    </ListItem>
                </>
            </Drawer>
        </>
    )
}

export default PrivateSideBar
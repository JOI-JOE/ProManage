import React from 'react'
import { Link } from "react-router-dom";
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, bgcolor: "#292929" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar
                            sx={{
                                background: "gray", // Gradient nền
                                color: "#fff", // Màu icon chữ trắng
                                width: 40, // Hoặc thay bằng prop: width: size,
                                height: 40, // Hoặc: height: size,
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                                fontWeight: "bold",
                                fontSize: "20px", // Hoặc: `${size / 2}px`
                                textTransform: "uppercase",
                            }}
                        >
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography variant="body1" sx={{ fontWeight: "bold", color: "gray" }}>
                            Không gian làm việc
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
                        Vì bạn không phải là thành viên của Không gian làm việc này nên bạn không thể thấy các bảng hoặc thông tin khác của Không gian làm việc này.                            </Typography>
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
    )
}

export default PrivateSideBar
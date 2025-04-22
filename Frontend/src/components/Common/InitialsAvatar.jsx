import React from "react";
import { Avatar, Tooltip } from "@mui/material";

// Hàm để lấy chữ cái đầu của tên
const getInitials = (name) => {
    if (!name) return "Ω";
    const nameParts = name.trim().split(" ");
    if (nameParts.length > 0) {
        return nameParts[0].charAt(0).toUpperCase();
    }
    return "Ω";
};

// Dùng forwardRef để hỗ trợ ref từ Tooltip
const InitialsAvatar = React.forwardRef(
    ({ name, avatarSrc, size = 22, initial, ...props }, ref) => {
        let displayContent = "Ω";

        if (avatarSrc) {
            displayContent = null; // ảnh sẽ được hiển thị qua src
        } else if (initial) {
            displayContent = initial;
        } else if (name) {
            displayContent = getInitials(name);
        }

        return (
            <Tooltip title={name || "Không tên"}>
                <Avatar
                    ref={ref}
                    sx={{
                        backgroundColor: "primary.main",
                        width: size,
                        height: size,
                        fontSize: "0.6rem",
                    }}
                    src={avatarSrc || ""}
                    {...props}
                >
                    {displayContent}
                </Avatar>
            </Tooltip>
        );
    }
);

export default InitialsAvatar;
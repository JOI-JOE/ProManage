import React from "react";
import { Avatar, Tooltip } from "@mui/material";

// Hàm để lấy chữ cái đầu
const getInitials = (name) => {
  if (!name) return "Ω";
  const nameParts = name.trim().split(" ");
  const initials = nameParts.map((part) => part.charAt(0).toUpperCase()).join("");
  return initials.length > 1 ? initials : initials + nameParts[1]?.charAt(0).toUpperCase() || "";
};

// Dùng forwardRef để hỗ trợ ref từ Tooltip
const InitialsAvatar = React.forwardRef(({ name, avatarSrc, size = 22, initial, ...props }, ref) => {
  const initials = initial || getInitials(name);

  return (
    <Tooltip title={name || "Không tên"}>
      <Avatar
        ref={ref}
        sx={{
          width: size,
          height: size,
          fontSize: "0.6rem",
        }}
        src={avatarSrc || ""}
        {...props}
      >
        {initials}
      </Avatar>
    </Tooltip>
  );
});

export default InitialsAvatar;

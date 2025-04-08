import React from "react";
import { Avatar, Tooltip } from "@mui/material";

// Hàm để tính toán các chữ cái đầu tiên của tên
const getInitials = (name) => {
  if (!name) return "Ω"; // Nếu name là undefined hoặc null, trả về "Ω"

  const nameParts = name.split(" ");

  if (nameParts.length === 0) return "Ω";

  const initials = nameParts
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials.length > 1
    ? initials
    : initials + nameParts[1]?.charAt(0).toUpperCase() || "";
};

// Component Avatar hiển thị chữ cái đầu
const InitialsAvatar = ({ name, avatarSrc, size = 22, initial }) => {
  // Nếu có initial thì sử dụng, nếu không có thì tính toán từ name
  const initials = initial || getInitials(name);

  return (
    <Tooltip title={name || "Không tên"}>
      <Avatar
        sx={{
          width: size,
          height: size,
          fontSize: "0.6rem",
        }}
        src={avatarSrc || ""} // Nếu không có avatarSrc, sẽ không hiển thị hình ảnh
      >
        {initials}
      </Avatar>
    </Tooltip>
  );
};

export default InitialsAvatar;

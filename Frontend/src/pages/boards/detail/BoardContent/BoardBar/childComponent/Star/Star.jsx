// StarButton.js

import React, { useState } from "react";
import { Chip } from "@mui/material";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";

const StarButton = () => {
  const [isStarred, setIsStarred] = useState(false); // Trạng thái ngôi sao

  const handleStarClick = () => {
    setIsStarred((prev) => !prev); // Đảo ngược trạng thái khi nhấn vào ngôi sao
  };

  return (
    <Chip
      icon={
        isStarred ? (
          <StarIcon sx={{ color: "" }} />
        ) : (
          <StarBorderIcon sx={{ borderColor: "#ffffff" }} />
        )
      } // Ngôi sao mặc định màu trắng
      label="Sao"
      variant="outlined"
      clickable
      sx={{
        border: "none",
        borderRadius: "8px",
        fontWeight: "bold",
        fontSize: "0.765rem",
        color: "#ffffff",
      }}
      onClick={handleStarClick} // Xử lý khi click vào ngôi sao
    />
  );
};

export default StarButton;

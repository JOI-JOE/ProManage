import React, { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import PeopleIcon from "@mui/icons-material/People";
import { Link } from "react-router-dom";
import { useRecentBoardAccess, useToggleBoardMarked } from "../hooks/useBoard";

import { StarIcon } from "@heroicons/react/24/solid"; // Solid
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline"; // Outline


const MyBoard = ({ board }) => {
  // Nhận dữ liệu board qua props
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMarked, setIsMarked] = useState(board.is_marked); // Trạng thái local
  const toggleBoardMarked = useToggleBoardMarked();
  const saveRecentBoard = useRecentBoardAccess();

  // console.log(board);
  const handleToggleMarked = (e) => {
    e.preventDefault(); // Ngăn điều hướng khi click icon
    setIsMarked((prev) => !prev); // Cập nhật UI ngay lập tức

    toggleBoardMarked.mutate(board.id, {
      onError: () => {
        setIsMarked((prev) => !prev); // Nếu API lỗi, hoàn tác thay đổi
      },
    });
  };


  const handleClickBoard = () => {
    saveRecentBoard.mutate(board.id); // Lưu vào recent-board khi bấm vào
  };


  return (
    <Link
      to={`/b/${board.id}/${board.name}`}
      style={{ textDecoration: "none" }}
      onClick={handleClickBoard} // Gọi hàm khi click
    >
      {" "}
      {/* Wrap with Link */}
      <Box // Removed the extra div
        // component={Link}
        // to={board.link} // Use board.link
        sx={{
          width: "180px",
          height: "100px",
          background: board.thumbnail
            ? board.thumbnail.startsWith("#")
              ? board.thumbnail
              : `url(${board.thumbnail}) center/cover no-repeat`
            : "#1693E1",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          "&:hover": { opacity: 0.8 },
          position: "relative", // For absolute positioning of the star
        }}
        onMouseEnter={() => setHoveredItem(1)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <PeopleIcon
          sx={{
            color: "white",
            marginRight: "3px",
          }}
        />
        <Typography
          sx={{
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {/* Use board.name */}
          {board.name}
        </Typography>
        {/* Icon đánh dấu bảng */}
        <IconButton
          sx={{
            position: "absolute",
            right: "6px",
            top: "80%",
            transform: "translateY(-50%)",
          }}
          onClick={handleToggleMarked}
        >
          {board.is_marked ? (
            <StarIcon className="h-4 w-6 text-yellow-500" />
          ) : (
            <StarOutlineIcon className="h-4 w-6 text-gray-500" />
          )}

        </IconButton>
      </Box>
    </Link>
  );
};

export default MyBoard;

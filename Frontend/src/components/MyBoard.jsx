import React from "react";
import { Box, IconButton, Rating, Typography } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import { Link } from "react-router-dom";
import { StarIcon } from "@heroicons/react/24/solid"; // Solid
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline"; // Outline
import { useBoardStar } from "../hooks/useBoardStar"; // Import useBoardStar hook
import { useDispatch, useSelector } from "react-redux";
import { toggleStarBoard } from "../redux/slices/starredBoardsSlice"; // Chỉ cần toggle trong Redux
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';

const MyBoard = ({ board }) => {
  const dispatch = useDispatch();

  const handleToggleMarked = async (e) => {
    e.stopPropagation(); // Ngăn sự kiện lan ra ngoài (ngăn bấm vào Link)

    const currentIsStarred = isStarred; // Lưu trạng thái trước khi dispatch
    dispatch(toggleStarBoard(board.id)); // Cập nhật giao diện ngay lập tức (Optimistic UI)

    console.log(board)
    try {
      // Gọi API dựa vào trạng thái hiện tại
      if (currentIsStarred) {
        await unstarBoard(board.id);
      } else {
        await starBoard(board.id);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái sao:", error);
      dispatch(toggleStarBoard(board.id)); // Quay lại trạng thái cũ nếu có lỗi
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "180px",
        "&:hover .star-icon": {
          opacity: 1, // Hiển thị sao khi hover vào board
          transform: "scale(1.1)", // Hiển thị nguyên kích thước
          // marginRight: "6px",
        },
      }}
    >
      <Link to={`/b/${board.id}/${board.name}`} style={{ textDecoration: "none" }}>
        <Box
          sx={{
            width: "180px",
            height: "100px",
            background: board.thumbnail
              ? board.thumbnail.startsWith("#")
                ? board.thumbnail
                : `url(${board.thumbnail}) center/cover no-repeat`
              : "#1693E1", // Màu mặc định nếu không có thumbnail
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
            transition: "opacity 0.2s ease-in-out",
            "&:hover": {
              opacity: 0.8, // Hiệu ứng hover giống Trello
            },
          }}
        >
          <Typography
            sx={{
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
              px: 1, // Thêm padding để tránh text bị cắt
            }}
          >
            {board.name}
          </Typography>
        </Box>
      </Link>

      {/* Icon đánh dấu sao */}
      <Box
        className="star-icon"
        onClick={handleToggleMarked}
        sx={{
          position: "absolute",
          bottom: "10px",
          right: "6px",
          display: "block",
          transform: "scale(1)", // Nhỏ lại ban đầu
          transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
          cursor: "pointer",
          opacity: board?.starred !== 0 ? 1 : 0, // Nếu đã đánh dấu sao thì luôn hiện
          "&:hover, &:focus": board?.starred === 0
            ? {
              opacity: 1, // Chỉ hiện ra khi chưa đánh dấu sao
              transform: "scale(1)",
            }
            : {},
        }}
      >
        {board?.starred !== 0 ? (
          <StarRoundedIcon
            sx={{
              color: "#F2D600", // Màu vàng mặc định khi đã đánh dấu
              transition: "transform 0.3s ease-in-out, color 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.1)",
                color: "transparent", // Xóa màu nền khi hover
                stroke: "#F2D600", // Viền vàng khi hover
                strokeWidth: 2,
              },
            }}
          />
        ) : (
          // trường hợp chưa đánh sao
          <StarOutlineRoundedIcon
            sx={{
              color: "white", // Hover vào sẽ là viền vàng
              strokeWidth: "2", // Viền vàng khi hover
              transition: "color 0.2s ease-out, transform 0.2s ease-out",
              "&:hover": {
                transform: "scale(1.2)", // Khi hover sẽ to lên
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default MyBoard;

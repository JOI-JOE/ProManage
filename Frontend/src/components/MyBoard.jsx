import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { starBoard, unstarBoard, updateStarredBoard } from "../redux/slices/starredBoardsSlice";
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import { optimisticIdManager } from "../../utils/optimisticIdManager";
import { Link } from "react-router-dom";
import { addStarToBoard, unStarToBoard } from "../api/models/boardStarApi";
import { useMe } from "../contexts/MeContext";

const MyBoard = ({ board }) => {
  const dispatch = useDispatch();
  const { user } = useMe();
  const [optimisticId] = useState(optimisticIdManager.generateOptimisticId('StarBoard')); // Generate optimistic ID
  const starredBoards = useSelector((state) => state.starredBoards.starred); // Get starred boards from Redux store
  const isStar = starredBoards?.board_stars?.some((b) => b.board_id === board.id);
  const existingStar = starredBoards?.board_stars?.find((b) => b.board_id === board.id);
  const starId = existingStar ? existingStar.star_id : null;

  const handleToggleMarked = async (e) => {
    e.stopPropagation(); // Prevent event from propagating

    const starred = {
      star_id: optimisticId,  // Initially use the optimistic ID
      board_id: board.id,
      name: board.name,
      thumbnail: board.thumbnail,
      starred: 1,
    };

    try {
      if (isStar) {
        if (starId) {
          dispatch(unstarBoard({ board: starred }));
          await unStarToBoard(user.id, board.id); // Pass the real `star_id` for unstar
        }
      } else {
        dispatch(starBoard({ board: starred }));
        const response = await addStarToBoard(user.id, board.id);
        dispatch(updateStarredBoard({ boardId: response.board_id, newStarId: response.id }));
      }
    } catch (error) {
      console.error("Có lỗi xảy ra khi thao tác với sao", error);
    }
  };


  return (
    <div key={board.id}>
      <Box
        sx={{
          position: "relative",
          width: "180px",
          "&:hover .star-icon": {
            opacity: 1, // Hiển thị sao khi hover vào board
            transform: "scale(1.1)", // Hiển thị nguyên kích thước
          },
        }}
      >
        <Link to={`/b/${board.id}/${board.name}`}
          state={{ workspaceId: board.workspace_id }}
          style={{ textDecoration: "none" }}>
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
            opacity: isStar ? 1 : 0, // Nếu đã đánh dấu sao thì luôn hiện
            "&:hover, &:focus": isStar === false // Hiển thị và hiệu ứng khi chưa đánh dấu sao
              ? {
                opacity: 1, // Chỉ hiện ra khi chưa đánh dấu sao
                transform: "scale(1)",
              }
              : {},
          }}
        >
          {isStar ? (
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
    </div>
  );
};

export default MyBoard;

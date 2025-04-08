import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { starBoard, unstarBoard, updateStarredBoard } from "../redux/slices/starredBoardsSlice";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarOutlineRoundedIcon from "@mui/icons-material/StarOutlineRounded";
import { optimisticIdManager } from "../../utils/optimisticIdManager";
import { addStarToBoard, unStarToBoard } from "../api/models/boardStarApi";
import { useMe } from "../contexts/MeContext";
import { Link } from "react-router-dom";

const MyBoard = ({ board }) => {
  const dispatch = useDispatch();
  const { user } = useMe();
  const [optimisticId] = useState(optimisticIdManager.generateOptimisticId("StarBoard")); // Generate optimistic ID
  const starredBoards = useSelector((state) => state.starredBoards.starred); // Get starred boards from Redux store
  const isStar = starredBoards?.board_stars?.some((b) => b.board_id === board.id);
  const existingStar = starredBoards?.board_stars?.find((b) => b.board_id === board.id);
  const starId = existingStar ? existingStar.star_id : null;

  const handleToggleMarked = async (e) => {
    e.stopPropagation(); // Prevent event from propagating

    const starred = {
      star_id: optimisticId, // Initially use the optimistic ID
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
          width: "193.88px", // Match the width from the screenshot
          "&:hover .star-icon": {
            opacity: 1, // Show star icon on hover
            transform: "scale(1.1)", // Slightly scale up the star icon
          },
        }}
      >
        {/* Since you don't have routes, replace Link with a div */}
        <Link to={`/b/${board.id}/${board.name}`}>
          <Box
            component="div"
            sx={{
              width: "193.88px", // Match the width from the screenshot
              height: "96px", // Match the height from the screenshot
              background: board.thumbnail
                ? board.thumbnail.startsWith("#")
                  ? board.thumbnail
                  : `url(${board.thumbnail}) center/cover no-repeat`
                : "#1693E1", // Default color if no thumbnail
              borderRadius: "3px", // Slightly rounded corners
              position: "relative",
              cursor: "pointer",
              transition: "opacity 0.2s ease-in-out",
              "&:hover": {
                opacity: 0.9, // Slightly dim on hover, like Trello
              },
              // Add a subtle overlay for text readability
              "&:before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.2)", // Subtle dark overlay
                borderRadius: "3px",
              },
            }}
          >
            <Typography
              sx={{
                color: "white",
                fontWeight: "bold",
                fontSize: "14px", // Smaller font size to match Trello
                position: "absolute",
                top: "8px", // Position in the top-left corner
                left: "8px",
                textAlign: "left",
                maxWidth: "80%", // Prevent text from overflowing
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {board.name}
            </Typography>
          </Box>
        </Link>
        {/* Star Icon */}
        <Box
          className="star-icon"
          onClick={handleToggleMarked}
          sx={{
            position: "absolute",
            bottom: "8px", // Position in the bottom-right corner
            right: "8px",
            display: "block",
            transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
            cursor: "pointer",
            opacity: isStar ? 1 : 0, // Show star if starred, hide otherwise
            "&:hover, &:focus": isStar === false // Show star on hover if not starred
              ? {
                opacity: 1,
                transform: "scale(1.1)",
              }
              : {},
          }}
        >
          {isStar ? (
            <StarRoundedIcon
              sx={{
                color: "#F2D600", // Yellow color for starred state
                fontSize: "20px", // Smaller size to match Trello
                transition: "transform 0.3s ease-in-out, color 0.3s ease-in-out",
                "&:hover": {
                  transform: "scale(1.1)",
                  color: "#F2D600", // Keep yellow on hover
                },
              }}
            />
          ) : (
            <StarOutlineRoundedIcon
              sx={{
                color: "white", // White outline for unstarred state
                fontSize: "20px", // Smaller size to match Trello
                transition: "color 0.2s ease-out, transform 0.2s ease-out",
                "&:hover": {
                  transform: "scale(1.1)",
                  color: "#F2D600", // Turn yellow on hover
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
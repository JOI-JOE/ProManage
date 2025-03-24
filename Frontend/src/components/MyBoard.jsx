import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { toggleStarBoard } from "../redux/slices/starredBoardsSlice";
import { useBoardStar } from "../hooks/useBoardStar";

const MyBoard = ({ board, userId }) => {
  const dispatch = useDispatch();
  const starredBoards = useSelector((state) => state.starredBoards.starredBoards);
  const isStarred = starredBoards.includes(board.id);
  const { starBoard, unstarBoard, isLoading } = useBoardStar();

  const handleToggleStar = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    dispatch(toggleStarBoard(board.id));

    try {
      if (isStarred) {
        await unstarBoard({
          userId,
          boardStarId: board.starId || board.id,
          boardId: board.id
        });
      } else {
        await starBoard({ userId, boardId: board.id });
      }
    } catch (error) {
      console.error("Error toggling star:", error);
      // Rollback on error
      dispatch(toggleStarBoard(board.id));
    }
  };

  return (
    <Box
      component={Link}
      to={`/b/${board.id}/${board.name}`}
      sx={{
        display: 'block',
        textDecoration: 'none',
        position: 'relative',
        width: '180px',
        height: '100px',
        background: board.thumbnail
          ? board.thumbnail.startsWith("#")
            ? board.thumbnail
            : `url(${board.thumbnail}) center/cover no-repeat`
          : "#1693E1",
        borderRadius: "8px",
        cursor: "pointer",
        "&:hover": {
          opacity: 0.8,
          "& .star-button": {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
        }}
      >
        <PeopleIcon sx={{ color: "white", mr: 0.5 }} />
        <Typography
          sx={{
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {board.name}
        </Typography>
      </Box>

      <IconButton
        className="star-button"
        sx={{
          position: "absolute",
          right: "6px",
          top: "80%",
          transform: "translateY(-50%)",
          padding: '4px',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
        onClick={handleToggleStar}
        disabled={isLoading}
      >
        {isStarred ? (
          <StarIcon className="h-4 w-6 text-yellow-500" />
        ) : (
          <StarOutlineIcon className="h-4 w-6 text-gray-300 hover:text-yellow-500" />
        )}
      </IconButton>
    </Box>
  );
};

export default MyBoard;
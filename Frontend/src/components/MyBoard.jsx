import React, { useState } from "react";
import { Box, Typography, IconButton, Popover } from "@mui/material";
import { Link } from "react-router-dom";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import PeopleIcon from "@mui/icons-material/People";
import { useToggleBoardMarked, useRecentBoardAccess, useUpdateBoardLastAccessed } from "../hooks/useBoard"; // Adjust the import path as needed

const MyBoard = ({ board, showIcon = false, width = 193.88, isPrivate = false }) => {
  // Nhận dữ liệu board qua props
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMarked, setIsMarked] = useState(board.is_marked); // Trạng thái local
  const toggleBoardMarked = useToggleBoardMarked();
  const saveRecentBoard = useRecentBoardAccess();
  const updateAccessTime = useUpdateBoardLastAccessed();

  const handleToggleMarked = (e) => {
    e.preventDefault(); // Ngăn điều hướng khi click icon
    e.stopPropagation(); // Ngăn sự kiện click lan truyền lên Link
    setIsMarked((prev) => !prev); // Cập nhật UI ngay lập tức

    toggleBoardMarked.mutate(board.id, {
      onError: () => {
        setIsMarked((prev) => !prev); // Nếu API lỗi, hoàn tác thay đổi
      },
    });
  };

  const handleClickBoard = () => {
    saveRecentBoard.mutate(board.id); // Lưu vào recent-board khi bấm vào
    updateAccessTime.mutate(board.id);
  };

  // phần để hiện ra phần giải thích bảng private
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpenExplanation = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleCloseExplanation = () => {
    setAnchorEl(null);
  };

  if (isPrivate) {
    return (
      <>
        <Box
          onClick={handleOpenExplanation}
          onMouseEnter={() => setHoveredItem(1)}
          onMouseLeave={() => setHoveredItem(null)}
          sx={{
            width: `${width}px`,
            height: "100px",
            background: "#F8F9FA",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "16px",
            position: "relative",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            cursor: "pointer",
            "&:hover": {
              background: "#ECEFF1"
            }
          }}
        >
          <Typography
            sx={{
              color: "#172B4D",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            Bảng Riêng tư
          </Typography>

          <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <LockIcon sx={{ color: "#EB5757", fontSize: 15 }} />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "#F0F1F2",
              }}
            >
              <Typography sx={{ fontSize: "16px", color: "#44546F" }}>?</Typography>
            </Box>
          </Box>
        </Box>

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleCloseExplanation}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          sx={{
            mt: 2
          }}
        >
          <Box sx={{
            p: 2,
            maxWidth: "300px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)"
          }}>
            <Typography sx={{ fontSize: "14px", color: "#172B4D" }}>
              Trong các Không gian làm việc miễn phí, chỉ các thành viên bảng mới có thể nhìn thấy các bảng riêng tư.
            </Typography>
          </Box>
        </Popover>
      </>
    );
  }


  // Regular board view (original code)
  return (
    <Link
      to={`/b/${board.id}/${board.name}`}
      style={{ textDecoration: "none" }}
      onClick={handleClickBoard}
    >
      <Box
        sx={{
          width: `${width}px`,
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
        {showIcon && board?.visibility && (
          <Box sx={{ position: "absolute", bottom: "8px", left: "8px" }}>
            {board.visibility === "workspace" && (
              <PeopleIcon sx={{ color: "white", fontSize: 18 }} />
            )}
            {board.visibility === "private" && (
              <LockIcon sx={{ color: "white", fontSize: 18 }} />
            )}
            {board.visibility === "public" && (
              <PublicIcon sx={{ color: "white", fontSize: 18 }} />
            )}
          </Box>
        )}

        <Typography
          sx={{
            position: "absolute",
            top: "8px",
            left: "8px",
            color: "white",
            fontSize: "2rem",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {board.name}
        </Typography>

        <IconButton
          sx={{
            position: "absolute",
            right: "6px",
            top: "80%",
            transform: "translateY(-50%)",
          }}
          onClick={handleToggleMarked}
        >
          {isMarked ? (
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
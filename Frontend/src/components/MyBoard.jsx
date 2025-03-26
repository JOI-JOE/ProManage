import React, { useState } from "react";
import { Box, IconButton, Rating, Typography } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { starBoard, unstarBoard } from "../redux/slices/starredBoardsSlice";
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';

const MyBoard = ({ board }) => {
  const dispatch = useDispatch()
  const [isStar, setStar] = useState(board.starred); // Trạng thái sao (true/false)

  const handleToggleMarked = async (e) => {
    e.stopPropagation(); // Ngăn sự kiện lan ra ngoài (ngăn bấm vào Link)
    try {
      // Toggle trạng thái sao
      const newIsStar = !isStar;
      setStar(newIsStar); // Cập nhật trạng thái sao trong component

      const starred = {
        board_id: board.id,
        board_name: board.name,
        board_thumbnail: board.thumbnail,
      };
      // Kiểm tra trạng thái sao hiện tại
      if (newIsStar) {
        // Nếu board được đánh dấu sao (thêm vào danh sách)
        console.log(starred);
        dispatch(starBoard({ board: starred }));
      } else {
        // Nếu board bị bỏ dấu sao (xóa khỏi danh sách)
        console.log(starred);
        dispatch(unstarBoard({ board: starred })); // Gọi action unstarBoard
      }

    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái sao:", error);
      // Nếu có lỗi, bạn có thể khôi phục lại trạng thái trước đó
      setStar(isStar); // Khôi phục lại trạng thái ban đầu nếu có lỗi
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

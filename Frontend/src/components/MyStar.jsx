import React, { useState, useEffect } from "react";
import { Box, Typography, Snackbar } from "@mui/material";
import { useDispatch } from "react-redux";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarOutlineRoundedIcon from "@mui/icons-material/StarOutlineRounded";
import { Link } from "react-router-dom";
import { useMe } from "../contexts/MeContext";
import { unStarToBoard } from "../api/models/boardStarApi";
import { unstarBoard } from "../redux/slices/starredBoardsSlice";

const MyStar = ({ star }) => {
    const dispatch = useDispatch();
    const { user } = useMe();
    const [error, setError] = useState(null); // State để hiển thị thông báo lỗi

    const handleToggleMarked = async (e) => {
        e.stopPropagation(); // Ngăn sự kiện lan ra ngoài (ngăn bấm vào Link)

        try {
            const starredBoard = {
                star_id: star.star_id,
                board_id: star.board_id,
                name: star.name,
                thumbnail: star.thumbnail,
                starred: star.starred ? 0 : 1, // Toggle trạng thái sao
            };

            if (star.starred) {
                dispatch(unstarBoard({ board: starredBoard })); // Dispatch action unstar
                await unStarToBoard(user.id, star.board_id); // Gọi API unstar
            }
        } catch (error) {
            console.error("Có lỗi xảy ra khi thao tác với sao", error);
            setError("Không thể thay đổi trạng thái sao. Vui lòng thử lại!"); // Hiển thị thông báo lỗi
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
                },
            }}
        >
            <Link to={`/b/${star?.board_id}/${star?.name}`} style={{ textDecoration: "none" }}>
                <Box
                    sx={{
                        width: "180px",
                        height: "100px",
                        background: star?.thumbnail
                            ? star?.thumbnail.startsWith("#")
                                ? star?.thumbnail
                                : `url(${star?.thumbnail}) center/cover no-repeat`
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
                        {star?.name}
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
                    opacity: star?.starred ? 1 : 0, // Nếu đã đánh dấu sao thì luôn hiện
                    "&:hover": {
                        opacity: 1, // Hiển thị khi hover
                        transform: "scale(1.1)", // To lên khi hover
                    },
                }}
            >
                {star?.starred ? (
                    <StarRoundedIcon
                        sx={{
                            color: "#F2D600", // Màu vàng khi đã đánh dấu
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
                            color: "white", // Màu trắng khi chưa đánh dấu
                            strokeWidth: "2", // Viền trắng
                            transition: "color 0.2s ease-out, transform 0.2s ease-out",
                            "&:hover": {
                                transform: "scale(1.2)", // To lên khi hover
                                color: "#F2D600", // Chuyển thành màu vàng khi hover
                            },
                        }}
                    />
                )}
            </Box>

            {/* Thông báo lỗi */}
            <Snackbar
                open={!!error}
                autoHideDuration={3000}
                onClose={() => setError(null)}
                message={error}
            />
        </Box>
    );
};

export default MyStar;
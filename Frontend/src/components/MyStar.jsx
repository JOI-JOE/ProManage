import React, { useState, useEffect } from "react";
import { Box, Typography, Snackbar } from "@mui/material";
import { useDispatch } from "react-redux";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarOutlineRoundedIcon from "@mui/icons-material/StarOutlineRounded";
import { useMe } from "../contexts/MeContext";
import { unStarToBoard } from "../api/models/boardStarApi";
import { unstarBoard } from "../redux/slices/starredBoardsSlice";
import { Link } from "react-router-dom";

const MyStar = ({ star }) => {
    const dispatch = useDispatch();
    const { user } = useMe();
    const [error, setError] = useState(null); // State để hiển thị thông báo lỗi

    const handleToggleMarked = async (e) => {
        e.stopPropagation(); // Ngăn sự kiện lan ra ngoài

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
                width: "193.88px", // Match the width from the screenshot
                "&:hover .star-icon": {
                    opacity: 1, // Show star icon on hover
                    transform: "scale(1.1)", // Slightly scale up the star icon
                },
            }}
        >
            {/* Replace Link with a div since you don't have routes */}
            <Link to={`/b/${star.board_id}/${star.name}`}>
                <Box
                    component="div"
                    sx={{
                        width: "193.88px", // Match the width from the screenshot
                        height: "96px", // Match the height from the screenshot
                        background: star?.thumbnail
                            ? star?.thumbnail.startsWith("#")
                                ? star?.thumbnail
                                : `url(${star?.thumbnail}) center/cover no-repeat`
                            : "#1693E1", // Default color if no thumbnail
                        borderRadius: "8px", // Slightly rounded corners
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
                            borderRadius: "8px",
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
                    bottom: "8px", // Position in the bottom-right corner
                    right: "8px",
                    display: "block",
                    transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
                    cursor: "pointer",
                    opacity: star?.starred ? 1 : 0, // Show star if starred, hide otherwise
                    "&:hover, &:focus": star?.starred === false // Show star on hover if not starred
                        ? {
                            opacity: 1,
                            transform: "scale(1.1)",
                        }
                        : {},
                }}
            >
                {star?.starred ? (
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
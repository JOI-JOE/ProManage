import { useDispatch } from "react-redux";
import { starBoard, unstarBoard } from "../api/models/boardStarApi";

export const useBoardStar = () => {
  const dispatch = useDispatch();

  // Hàm gọi API và cập nhật trạng thái khi đánh dấu sao board
  const handleStarBoard = async (boardId) => {
    try {
      // Gọi API để đánh dấu sao board
      const response = await starBoard(boardId);
      console.log("Board starred successfully:", response.data);
    } catch (error) {
      console.error("Error starring board:", error);
    }
  };

  // Hàm gọi API và cập nhật trạng thái khi bỏ đánh dấu sao board
  const handleUnstarBoard = async (userId, boardStarId) => {
    try {
      // Gọi API để bỏ đánh dấu sao board
      const response = await unstarBoard(userId, boardStarId);
      console.log("Board unstarred successfully:", response.data);
    } catch (error) {
      console.error("Error unstarring board:", error);
    }
  };

  return {
    starBoard: handleStarBoard,
    unstarBoard: handleUnstarBoard,
  };
};

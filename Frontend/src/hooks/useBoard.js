import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBoard, getBoardById } from "../api/models/boardsApi";

/**
 * Hook useBoard để tạo bảng mới.
 * @returns {object} - Object chứa mutate để gọi API tạo bảng và các trạng thái liên quan.
 */
export const useCreateBoard = () => {
  return useMutation({
    mutationFn: createBoard, // Gọi API tạo board
  });
};

export const useGetBoardByID = (boardId) => {
  return useQuery({
    queryKey: ["boards", boardId],
    queryFn: async () => {
      if (!boardId) return null; // Nếu không có boardId, không gọi API

      try {
        const response = await getBoardById(boardId);
        if (!response?.data) {
          throw new Error("Board data is empty or undefined");
        }
        return response.data;
      } catch (error) {
        console.error("Error fetching board:", error);
        throw new Error("Failed to fetch board data");
      }
    },
  });
};

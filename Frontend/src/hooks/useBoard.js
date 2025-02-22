import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBoard } from "../api/models/boardsApi";


/**
 * Hook useBoard để tạo bảng mới.
 * @returns {object} - Object chứa mutate để gọi API tạo bảng và các trạng thái liên quan.
 */
export const useCreateBoard = () => {
  return useMutation({
    mutationFn: createBoard, // Gọi API tạo board
  });
};

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

export const useBoards = (boardId) => {
  const queryClient = useQueryClient();

  const boardsQuery = useQuery({
    queryKey: ["boardLists", boardId],
    queryFn: () => getBoardById(boardId),
    enabled: !!boardId, // Chỉ kích hoạt query khi có boardId
    staleTime: 1000 * 60 * 5, // Cache trong 5 phút
    cacheTime: 1000 * 60 * 30, // Giữ dữ liệu trong 30 phút ngay cả khi query bị hủy
  });

  return boardsQuery;
}


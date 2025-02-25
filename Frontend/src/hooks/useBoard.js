import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBoard, showBoardByWorkspaceId } from "../api/models/boardsApi";


/**
 * Hook useBoard để tạo bảng mới.
 * @returns {object} - Object chứa mutate để gọi API tạo bảng và các trạng thái liên quan.
 */
export const useCreateBoard = () => {
  return useMutation({
    mutationFn: createBoard, // Gọi API tạo board
  });
};

export const getBoardByClosed = ()=>{
  return useQuery({
      queryKey: ["boards"], // Key duy nhất để xác định và cache dữ liệu người dùng.
      queryFn: getBoardsAllByClosed, // Hàm gọi API để lấy dữ liệu người dùng.
      staleTime: 1000 * 60 * 5, // Dữ liệu được coi là "stale" sau 5 phút (ms * s * m).
      cacheTime: 1000 * 60 * 30, // Dữ liệu được giữ trong cache tối đa 30 phút.
    });
}

/**
 * Hook để lấy bảng theo workspaceId.
 * @param {string} workspaceId - ID của workspace để lấy bảng.
 * @returns {object} - Trả về kết quả query của việc lấy bảng theo workspaceId.
 */
export const useBoardByWorkspaceId = (workspaceId) => {
  return useQuery({
    queryKey: ["boards", workspaceId], // Key duy nhất với workspaceId để cache dữ liệu.
    queryFn: () => showBoardByWorkspaceId(workspaceId), // Gọi API lấy bảng theo workspaceId.
    staleTime: 1000 * 60 * 5, // Dữ liệu được coi là "stale" sau 5 phút (ms * s * m).
    cacheTime: 1000 * 60 * 30, // Dữ liệu được giữ trong cache tối đa 30 phút.
  });
};




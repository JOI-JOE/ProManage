import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBoard,
  getBoardById,
  getBoardMarked,
  getRecentBoards,
  getUnsplashImages,
  logBoardAccess,
  showBoardByWorkspaceId,
  toggleBoardMarked,
  updateBoardName,
} from "../api/models/boardsApi";

/**
 * Hook useBoard để tạo bảng mới.
 * @returns {object} - Object chứa mutate để gọi API tạo bảng và các trạng thái liên quan.
 */
export const useCreateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBoard, // Gọi API tạo board
    onSuccess: () => {
      queryClient.invalidateQueries(["workspaces"]);
    },
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
export const getBoardByClosed = () => {
  return useQuery({
    queryKey: ["boards"], // Key duy nhất để xác định và cache dữ liệu người dùng.
    queryFn: getBoardsAllByClosed, // Hàm gọi API để lấy dữ liệu người dùng.
    staleTime: 1000 * 60 * 5, // Dữ liệu được coi là "stale" sau 5 phút (ms * s * m).
    cacheTime: 1000 * 60 * 30, // Dữ liệu được giữ trong cache tối đa 30 phút.
  });
};

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

export const useGetBoardById = (boardId) => {
  const boardsQuery = useQuery({
    queryKey: ["boardLists", boardId],
    queryFn: () => getBoardById(boardId),
    enabled: !!boardId, // Chỉ kích hoạt query khi có boardId
    staleTime: 1000 * 60 * 5, // Cache trong 5 phút
    cacheTime: 1000 * 60 * 30, // Giữ dữ liệu trong 30 phút ngay cả khi query bị hủy
  });

  return boardsQuery;
};

export const useRecentBoards = () => {
  return useQuery({
    queryKey: ["recentBoards"], // Key duy nhất với "recentBoards" để cache dữ liệu.
    queryFn: getRecentBoards, // Gọi API lấy bảng gần đây.
    staleTime: 1000 * 60 * 5, // Dữ liệu được coi là "stale" sau 5 phút.
    cacheTime: 1000 * 60 * 30, // Dữ liệu được giữ trong cache tối đa 30 phút.
  });
};

export const useRecentBoardAccess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logBoardAccess,
    onError: (error) => {
      console.error("Lỗi khi ghi nhận bảng:", error);
    },
    onSuccess: (data) => {
      // console.log("Bảng đã được lưu vào danh sách gần đây:", data);
      queryClient.invalidateQueries(["recentBoards"]);
    },
  });
};

/**
 * Hook để cập nhật tên bảng
 * @returns {object} - Object chứa mutate để gọi API cập nhật tên bảng
 */
export const useUpdateBoardName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, name }) => updateBoardName(boardId, name),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      queryClient.invalidateQueries(["boards"]);
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật tên bảng:", error);
    },
  });
};

export const useToggleBoardMarked = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleBoardMarked, // Gọi API toggle
    onMutate: async (boardId) => {
      await queryClient.cancelQueries(["boards"]); // Hủy API đang chạy

      const previousData = queryClient.getQueryData(["boards"]); // Lưu dữ liệu trước đó

      queryClient.setQueryData(["boards"], (oldData) => {
        if (!oldData || !oldData.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((board) =>
            board.id === boardId
              ? { ...board, is_marked: !board.is_marked }
              : board
          ),
        };
      });

      return { previousData }; // Trả dữ liệu để rollback nếu lỗi
    },
    onError: (err, boardId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["boards"], context.previousData); // Rollback nếu lỗi
      }
    },
    onSuccess: (data, boardId) => {
      queryClient.setQueryData(["boards"], (oldData) => {
        if (!oldData || !oldData.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((board) =>
            board.id === boardId
              ? { ...board, is_marked: data.is_marked }
              : board
          ),
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["boards"], { refetchType: "active" }); // Làm mới danh sách
    },
  });
};

export const useBoardMarked = () => {
  return useQuery({
    queryKey: ["boardMarked"],
    queryFn: getBoardMarked,
    staleTime: 1000 * 60 * 5, // 5 phút (Hạn chế gọi API nếu dữ liệu còn "tươi")
    cacheTime: 1000 * 60 * 30, // 30 phút
    refetchOnWindowFocus: false, // Không fetch lại khi đổi tab
  });
};

export const useImageUnsplash = () => {
  return useQuery({
    queryKey: ["UnsplashImages"], // Key duy nhất với "recentBoards" để cache dữ liệu.
    queryFn: getUnsplashImages, // Gọi API lấy bảng gần đây.
    staleTime: 1000 * 60 * 5, // Dữ liệu được coi là "stale" sau 5 phút.
    cacheTime: 1000 * 60 * 30, // Dữ liệu được giữ trong cache tối đa 30 phút.
  });
};

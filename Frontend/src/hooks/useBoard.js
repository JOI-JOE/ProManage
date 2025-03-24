import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBoard,
  getBoardById,
  getBoardClosed,
  getBoardMarked,
  getBoardsAllByClosed,
  getRecentBoards,
  getUnsplashImages,
  logBoardAccess,
  showBoardByWorkspaceId,
  toggleBoardClosed,
  toggleBoardMarked,
  updateBoardName,
  updateBoardVisibility,
} from "../api/models/boardsApi";
import { useCallback } from "react";
import { fetUserBoardStar } from "../api/models/userApi";
import { useDispatch } from "react-redux";

/**
 * Hook useBoard để tạo bảng mới.
 * @returns {object} - Object chứa mutate để gọi API tạo bảng và các trạng thái liên quan.
 */

export const useUserBoardStar = () => {
  const userId = useSelector((state) => state.user.user?.id); // Truy xuất userId từ Redux store
  const dispatch = useDispatch();

  return useQuery(
    ["userBoardStar", userId], // query key sẽ bao gồm userId để cache riêng biệt cho từng user
    () => fetUserBoardStar(userId), // Gọi API với userId
    {
      enabled: !!userId, // Chỉ gọi API nếu có userId
      onError: (error) => {
        console.error("Error fetching user board stars:", error);
      },
      onSuccess: (data) => {
        // Lưu kết quả vào Redux khi API trả về thành công
        dispatch(setStarredBoards(data));
        console.log("Fetched user board stars:", data);
      },
      cacheTime: 1000 * 60 * 10, // Cấu hình cache cho dữ liệu
      staleTime: 1000 * 60 * 5, // Dữ liệu sẽ được coi là tươi trong 5 phút
    }
  );
};

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

export const useBoards = (boardId) => {
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
      console.log("Bảng đã được lưu vào danh sách gần đây:", data);
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

  // Định nghĩa mutationFn bằng useCallback để tránh tạo lại khi component re-render
  const mutationFn = useCallback(async (boardId) => {
    return toggleBoardMarked(boardId);
  }, []);

  return useMutation({
    mutationFn,
    onMutate: useCallback(
      async (boardId) => {
        await queryClient.cancelQueries(["boardMarked"]); // Hủy API đang chạy

        const previousData = queryClient.getQueryData(["boardMarked"]); // Lưu dữ liệu trước đó

        queryClient.setQueryData(["boardMarked"], (oldData) => {
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
      [queryClient]
    ),

    onError: useCallback(
      (err, boardId, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(["boardMarked"], context.previousData); // Rollback nếu lỗi
        }
      },
      [queryClient]
    ),

    onSuccess: useCallback(
      (data, boardId) => {
        queryClient.setQueryData(["boardMarked"], (oldData) => {
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
      [queryClient]
    ),

    onSettled: useCallback(() => {
      queryClient.invalidateQueries(["boardMarked"], { refetchType: "none" }); // Làm mới danh sách
    }, [queryClient]),
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

export const useUpdateBoardVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, visibility }) =>
      updateBoardVisibility(boardId, visibility),
    onSuccess: (data, { boardId }) => {
      // Optionally invalidate queries to ensure data is fresh
      queryClient.invalidateQueries(["boards", boardId]); // Refresh board data
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật visibility của bảng:", error);
    },
  });
};

export const useToggleBoardClosed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId) => toggleBoardClosed(boardId),

    // Xử lý khi API gọi thành công
    onSuccess: (data, boardId) => {
      console.log("✅ Đã cập nhật trạng thái board:", data);

      // Cập nhật lại cache cho danh sách board
      queryClient.invalidateQueries(["boards"]);
      // queryClient.invalidateQueries(["board", boardId]);
    },

    // Xử lý khi có lỗi
    onError: (error) => {
      console.error("❌ Lỗi khi đóng/mở board:", error);
    },
  });
};

export const useClosedBoards = () => {
  return useQuery({
    queryKey: ["closedBoards"], // Key riêng cho danh sách board đã đóng
    queryFn: getBoardClosed, // Gọi API lấy danh sách bảng đã đóng
    staleTime: 1000 * 60 * 5, // Cache trong 5 phút trước khi "stale"
    onSuccess: (data) => {
      // Khi thành công, invalidate lại query để đồng bộ lại dữ liệu
    },
  });
};

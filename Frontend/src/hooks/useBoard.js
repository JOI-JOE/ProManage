import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  copyBoard,
  createBoard,
  fetchBoardDetails,
  forceDestroyBoard,
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
  updateBoardLastAccessed,
  updateBoardName,
  updateBoardVisibility,
} from "../api/models/boardsApi";
import { useCallback, useContext, useEffect, useMemo } from "react";
import echoInstance from "./realtime/useRealtime";
import { toast } from "react-toastify";
import { useGetUserWorkspaces } from "./useWorkspace";

/**
 * Hook useBoard để tạo bảng mới.
 * @returns {object} - Object chứa mutate để gọi API tạo bảng và các trạng thái liên quan.
 */

export const useCreateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBoard, // Gọi API tạo board
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["workspaces"]});
    },
  });
};

export const useGetBoardByID = (boardId) => {
  const queryClient = useQueryClient();

  const boardDetail = useQuery({
    queryKey: ["boards", boardId],
    enabled: !!boardId, // vẫn có, nhưng...
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
  const {
    data,
    error,
    isLoading,
    refetch: refetchWorkspaces,
  } = useGetUserWorkspaces();
  const allBoards = useMemo(() => {
    if (!data) return [];

    const owned =
      data?.owned_workspaces?.flatMap((ws, wsIndex) =>
        (ws.boards || [])
          .filter((board) => board && board.id && board.name && !board.closed)
          .map((board) => ({
            ...board,
            workspaceName: ws.name || `Workspace Owned ${wsIndex + 1}`,
            workspaceType: "owned",
          }))
      ) || [];

    const guest =
      data?.guest_workspaces?.flatMap((ws, wsIndex) =>
        (ws.boards || [])
          .filter((board) => board && board.id && board.name && !board.closed)
          .map((board) => ({
            ...board,
            workspaceName: ws.name || `Workspace Guest ${wsIndex + 1}`,
            workspaceType: "guest",
          }))
      ) || [];

    return [...owned, ...guest];
  }, [data]);

  useEffect(() => {
    // Lắng nghe tất cả các bảng mà người dùng có quyền truy cập
    // const boardIds = ["740955b5-e686-4f5c-92f7-c3cdfd592f92", "d9056bf6-31d6-4da1-b762-9fc0909ece41"]; // Lấy danh sách boardId từ API hoặc state
    const boardIds = allBoards.map((board) => board.id).filter(Boolean); // Loại bỏ giá trị falsy (nếu có)

    // console.log("Board IDs:", boardIds);
    boardIds.forEach((boardId) => {
      const channel = echoInstance.channel(`boards.${boardId}`);

      channel.listen(".BoardStatusUpdated", (event) => {
        console.log(
          `🔄 Nhận sự kiện BoardStatusUpdated cho ${boardId}:`,
          event.board.workspace_id
        );
        queryClient.invalidateQueries({ queryKey: ["boards", boardId] });
        queryClient.invalidateQueries({ queryKey: ["guestBoards"] });
        // queryClient.invalidateQueries({ queryKey: ["closedBoards"] });
        queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        
        queryClient.invalidateQueries({ queryKey: ["workspace",event.board.workspace_id] });
      });

      channel.listen(".board.updateName", (data) => {
        console.log(`📡 Board name updated for ${boardId}:`, data);
        queryClient.invalidateQueries({ queryKey: ["boards", boardId] });
        queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      });
    });

    // Cleanup khi ứng dụng unmount
    return () => {
      boardIds.forEach((boardId) => {
        const channel = echoInstance.channel(`boards.${boardId}`);
        channel.stopListening(".BoardStatusUpdated");
        channel.stopListening(".board.updateName");
        echoInstance.leave(`boards.${boardId}`);
      });
    };
  }, [allBoards, queryClient]);
  return boardDetail;
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

export const useUpdateBoardLastAccessed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBoardLastAccessed,
    onError: (error) => {
      console.error("Lỗi khi cập nhật thời gian truy cập board:", error);
    },
    onSuccess: (data) => {
      // console.log("⏱️ Last accessed của board đã được cập nhật:", data);
      // Gợi ý: Bạn có thể cập nhật cache nếu có query liên quan
      // queryClient.invalidateQueries({ queryKey: ["boards"] });
      // queryClient.invalidateQueries({ queryKey: ["user"] });
      // queryClient.invalidateQueries({ queryKey: ["recentBoards"] });

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
    mutationFn: ({ boardId, name }) => updateBoardName(boardId, name), // Gọi API cập nhật tên board
    onSuccess: (_, { boardId, workspaceId }) => {
      // Invalidate lại dữ liệu để cập nhật UI

      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace"], workspaceId });

      // queryClient.invalidateQueries({ queryKey: ["boardDetail", boardId], exact: true });
    },
    onError: (error) => {
      console.error("❌ Lỗi khi cập nhật tên bảng:", error);
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
      queryClient.invalidateQueries({
        queryKey: ["lists", boardId],
        exact: true,
      });
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật visibility của bảng:", error);
    },
  });
};

export const useToggleBoardClosed = (workspaceId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId) => toggleBoardClosed(boardId),

    // Xử lý khi API gọi thành công
    onSuccess: (data, boardId) => {
      console.log("✅ Đã cập nhật trạng thái board:", data);
      // Cập nhật lại cache cho danh sách board
      queryClient.invalidateQueries({ queryKey: ["boards", boardId] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["guestBoards"] });
      queryClient.invalidateQueries({ queryKey: ["closedBoards"] });
      queryClient.invalidateQueries({ queryKey: ["recentBoards"] });
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });

      // queryClient.invalidateQueries(["board", boardId]);
    },

    // Xử lý khi có lỗi
    onError: (error) => {
      console.error("❌ Lỗi khi đóng/mở board:", error);
    },
  });
};

export const useClosedBoards = (workspaceId) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["closedBoards"], // Key riêng cho danh sách board đã đóng
    queryFn: getBoardClosed, // Gọi API lấy danh sách bảng đã đóng
    staleTime: 1000 * 60 * 5, // Cache trong 5 phút trước khi "stale"
    onSuccess: () => {
      // Khi thành công, invalidate lại query để đồng bộ lại dữ liệu
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
    },
  });
};

export const useBoardDetails = (boardId) => {
  return useQuery({
    queryKey: ["boardDetails", boardId],
    queryFn: () => fetchBoardDetails(boardId),
    enabled: !!boardId, // chỉ fetch khi có boardId
  });
};

export const useCopyBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: copyBoard,
    onSuccess: (res) => {
      const newBoard = res.board;

      // Làm mới cache các board
      queryClient.invalidateQueries({
        queryKey: ["boards", newBoard.id],
        exact: true,
      });

      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      // queryClient.invalidateQueries({ queryKey: ["workspaceBoards", newBoard.workspace_id] });

      toast.success("Sao chép bảng thành công!");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Lỗi sao chép bảng: ${errorMessage}`);
    },
  });
};

export const useForceDestroyBoard = (boardId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId) => forceDestroyBoard(boardId),
    onSuccess: (_, boardId) => {
      // Invalidate duy nhất query của danh sách closedBoards
      queryClient.invalidateQueries({
        queryKey: ["closedBoards"],
        exact: true,
      });

      // (Optional) Invalidate workspace nếu bạn cần cập nhật số lượng board chẳng hạn:
      // queryClient.invalidateQueries({ queryKey: ['workspaces'], exact: true });
    },
  });
};

// export const useForceDestroyBoard = (boardId) => {
//   const queryClient = useQueryClient();

// export const useForceDestroyBoard = (boardId) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (boardId) => forceDestroyBoard(boardId),
//     onSuccess: (_, boardId) => {
//       // Invalidate duy nhất query của danh sách closedBoards
//       queryClient.invalidateQueries({
//         queryKey: ['closedBoards'],
//         exact: true,
//       });

//       // (Optional) Invalidate workspace nếu bạn cần cập nhật số lượng board chẳng hạn:
//       // queryClient.invalidateQueries({ queryKey: ['workspaces'], exact: true });
//     },
//   });
// };

//       // (Optional) Invalidate workspace nếu bạn cần cập nhật số lượng board chẳng hạn:
//       // queryClient.invalidateQueries({ queryKey: ['workspaces'], exact: true });
//     },
//   });
// };

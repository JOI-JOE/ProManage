import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  // getListDetail,
  // getListClosedByBoard,
  // deleteList,
  // updateClosed,
  createListAPI,
  updatePositionList,
  fetchListByBoardId,
  updateListName,
  updateListClosed,
} from "../api/models/listsApi";
import { useCallback, useEffect, useRef } from "react";
import echoInstance from "./realtime/useRealtime";

// MAIN FUNCTION + REALTIME ------------------------------------------------------------------------------------
export const useListByBoardId = (boardId) => {
  const queryClient = useQueryClient();
  const channelRef = useRef(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["lists", boardId],
    queryFn: () => fetchListByBoardId(boardId),
    enabled: !!boardId,
    retry: 0,
    staleTime: 5 * 60 * 1000, // 5 phút
    cacheTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // --- Xử lý cập nhật list ---
  const handleListUpdate = useCallback(
    (updateEvent) => {
      if (!updateEvent?.id) return;
      queryClient.setQueryData(["lists", boardId], (oldData) => {
        if (!oldData?.lists) return oldData;
        return {
          ...oldData,
          lists: oldData.lists.map((list) =>
            list.id === updateEvent.id ? { ...list, ...updateEvent } : list
          ),
        };
      });
    },
    [boardId, queryClient]
  );

  // --- Xử lý tạo list mới ---
  const handleListCreate = useCallback(
    (event) => {
      if (!event?.id) return;
      queryClient.setQueryData(["lists", boardId], (oldData) => {
        const oldLists = Array.isArray(oldData?.lists) ? oldData.lists : [];
        const exists = oldLists.some((list) => list.id === event.id);
        if (exists) return oldData;
        const updatedLists = [...oldLists, event];
        return {
          ...oldData,
          lists: updatedLists,
        };
      });
    },
    [boardId, queryClient]
  );
  // TODO: Bạn chưa xử lý handleCardCreate & handleCardUpdate
  const handleCardCreate = useCallback((event) => {
    // Thêm logic xử lý nếu cần
  }, []);

  const handleCardUpdate = useCallback((event) => {
    // Thêm logic xử lý nếu cần
  }, []);

  useEffect(() => {
    if (!boardId) return;

    const channel = echoInstance.channel(`board.${boardId}`);
    channelRef.current = channel;

    channel.listen(".list.updated", handleListUpdate);
    channel.listen(".list.created", handleListCreate);

    return () => {
      if (channelRef.current) {
        channelRef.current.stopListening(".list.updated");
        channelRef.current.stopListening(".list.created");
        echoInstance.leaveChannel(`board.${boardId}`);
      }
    };
  }, [boardId, handleListUpdate, handleListCreate]);

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

/// Function thông thường --------------------------------------------------------

// Function Create ------------------------------------------------------------------
export const useCreateList = () => {
  const mutation = useMutation({
    mutationFn: createListAPI,
    onError: (error) => {
      console.error("Lỗi khi tạo danh sách:", error);
    },
  });

  return {
    createList: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
};

// Function update ------------------------------------------------------------------------------
export const useUpdateListName = () => {
  return useMutation({
    mutationFn: ({ listId, newName }) => updateListName(listId, newName),
    onError: (error) => {
      console.error("❌ Lỗi khi update list name:", error);
    },
  });
};

export const useUpdateListClosed = () => {
  return useMutation({
    mutationFn: ({ listId, closed }) => updateListClosed(listId, closed),
    onError: (error) => {
      console.error("❌ Lỗi khi cập nhật trạng thái đóng danh sách:", error);
    },
  });
};

export const useUpdatePositionList = () => {
  return useMutation({
    mutationFn: async ({ listId, position, boardId }) => {
      return await updatePositionList({ listId, position });
    },
    retry: 1,
    retryDelay: 1000,
  });
};

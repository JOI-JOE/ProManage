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
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
  // Hàm cập nhật dữ liệu danh sách
  const updateListData = useCallback(
    (updateEvent, key, conditionFn) => {
      queryClient.setQueryData(["lists", boardId], (oldData) => {
        if (!oldData || !Array.isArray(oldData[key])) return oldData;

        const updatedData = oldData[key].map((item) =>
          conditionFn(item, updateEvent) ? { ...item, ...updateEvent } : item
        );

        return { ...oldData, [key]: updatedData };
      });
    },
    [boardId, queryClient]
  );

  // Xử lý cập nhật thẻ
  const handleCardUpdate = useCallback(
    (updateEvent) => {
      if (!updateEvent?.id) return;
      updateListData(
        updateEvent,
        "cards",
        (card, event) => card.id === event.id
      );
    },
    [updateListData]
  );

  // Xử lý di chuyển thẻ
  const handleCardMove = useCallback(
    (event) => {
      if (!event?.id || !event?.list_board_id) return;

      queryClient.setQueryData(["lists", boardId], (oldData) => {
        if (!oldData || !Array.isArray(oldData.cards)) return oldData;

        const updatedCards = oldData.cards.map((card) => {
          if (card.id === event.id) {
            return {
              ...card,
              list_board_id: event.list_board_id,
              position: event.position,
              is_archived: event.is_archived ?? card.is_archived,
              title: event.title ?? card.title,
              description: event.description ?? card.description,
              thumbnail: event.thumbnail ?? card.thumbnail,
              start_date: event.start_date ?? card.start_date,
              end_date: event.end_date ?? card.end_date,
              end_time: event.end_time ?? card.end_time,
              reminder: event.reminder ?? card.reminder,
              is_completed: event.is_completed ?? card.is_completed,
            };
          }
          return card;
        });

        return { ...oldData, cards: updatedCards };
      });
    },
    [boardId, queryClient]
  );

  // Xử lý tạo thẻ mới
  const handleCardCreate = useCallback(
    (event) => {
      if (!event?.id) return;
      queryClient.setQueryData(["lists", boardId], (oldData) => {
        const oldCards = Array.isArray(oldData?.cards) ? oldData.cards : [];
        const exists = oldCards.some((card) => card.id === event.id);
        if (exists) return oldData;

        const newCard = {
          id: event.id,
          title: event.title,
          list_board_id: event.list_board_id,
          position: event.position,
        };

        return {
          ...oldData,
          cards: [...oldCards, newCard],
        };
      });
    },
    [boardId, queryClient]
  );

  // Xử lý cập nhật danh sách
  const handleListUpdate = useCallback(
    (updateEvent) => {
      if (!updateEvent?.id) return;
      updateListData(
        updateEvent,
        "lists",
        (list, event) => list.id === event.id
      );
    },
    [updateListData]
  );

  // Xử lý tạo danh sách mới
  const handleListCreate = useCallback(
    (event) => {
      if (!event?.id) return;
      queryClient.setQueryData(["lists", boardId], (oldData) => {
        const oldLists = Array.isArray(oldData?.lists) ? oldData.lists : [];
        const exists = oldLists.some((list) => list.id === event.id);
        if (exists) return oldData;

        const newList = {
          id: event.id,
          name: event.name,
          position: event.position,
          closed: event.closed ?? false,
          board_id: event.board_id ?? boardId,
        };

        return {
          ...oldData,
          lists: [...oldLists, newList],
        };
      });
    },
    [boardId, queryClient]
  );

  // Subscribe các channel
  useEffect(() => {
    if (!boardId) return;

    const channel = echoInstance.channel(`board.${boardId}`);
    channelRef.current = channel;

    channel.listen(".list.created", handleListCreate);
    channel.listen(".list.updated", handleListUpdate);
    channel.listen(".card.created", handleCardCreate);
    channel.listen(".card.updated", handleCardUpdate);
    channel.listen(".card.moved", handleCardMove);

    return () => {
      if (channelRef.current) {
        channelRef.current.stopListening(".list.created");
        channelRef.current.stopListening(".list.updated");
        channelRef.current.stopListening(".card.created");
        channelRef.current.stopListening(".card.updated");
        channelRef.current.stopListening(".card.moved");
        echoInstance.leaveChannel(`board.${boardId}`);
      }
    };
  }, [
    boardId,
    handleListCreate,
    handleListUpdate,
    handleCardCreate,
    handleCardUpdate,
    handleCardMove,
  ]);

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
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createListAPI,
    onSuccess: (newList, { boardId }) => {
      queryClient.invalidateQueries({
        queryKey: ["lists", boardId],
        exact: true,
      });
    },
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

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback, useMemo, useState } from "react";
import {
  getListDetail,
  getListByBoardId,
  updateListName,
  updateClosed,
  updateListPosition,
} from "../api/models/listsApi";
import { createEchoInstance } from "./useRealtime";

export const useListById = (listId) => {
  const queryClient = useQueryClient();
  const echoInstance = useMemo(() => createEchoInstance(), []);

  const listsDetail = useQuery({
    queryKey: ["list", listId],
    queryFn: () => getListDetail(listId),
    enabled: !!listId,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });

  // Mutation để cập nhật tên list
  const updateListNameMutation = useMutation({
    mutationFn: (newName) => updateListName(listId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries(["list", listId]);
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật tên danh sách:", error);
    },
  });

  // Mutation để cập nhật trạng thái đóng/mở list
  const updateClosedMutation = useMutation({
    mutationFn: (closed) => updateClosed(listId, closed),
    onSuccess: () => {
      queryClient.invalidateQueries(["list", listId]);
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật trạng thái lưu trữ:", error);
    },
  });

  // Xử lý realtime events
  useEffect(() => {
    if (!listId || !echoInstance) return;

    const channel = echoInstance.channel(`list.${listId}`);

    channel.listen(".list.nameUpdated", (event) => {
      if (event?.list?.id === listId) {
        queryClient.setQueryData(["list", listId], (oldData) => {
          if (!oldData) return oldData;
          return { ...oldData, name: event.list.name };
        });
      }
    });

    channel.listen(".list.archived", (event) => {
      if (event?.list?.id === listId) {
        queryClient.setQueryData(["list", listId], (oldData) => {
          if (!oldData) return oldData;
          return { ...oldData, closed: event.list.closed };
        });
      }
    });

    return () => {
      channel.stopListening(".list.nameUpdated");
      channel.stopListening(".list.archived");
      echoInstance.leave(`list.${listId}`);
    };
  }, [listId, echoInstance, queryClient]);

  return {
    ...listsDetail,
    updateListName: updateListNameMutation.mutate,
    updateClosed: updateClosedMutation.mutate,
  };
};

export const useLists = (boardId) => {
  return useQuery({
    queryKey: ["boardLists", boardId],
    queryFn: () => getListByBoardId(boardId),
    enabled: !!boardId,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });
};

export const useDragAndDropLists = (boardId) => {
  const queryClient = useQueryClient();
  const { data: orderedLists = [], isLoading, isError } = useLists(boardId);
  const [localLists, setLocalLists] = useState(orderedLists);

  const mutation = useMutation({
    mutationFn: (updatedLists) => updateListPosition(boardId, updatedLists),
    onMutate: async (newLists) => {
      await queryClient.cancelQueries(["boardLists", boardId]);

      // Lưu snapshot trước khi cập nhật
      const previousLists = queryClient.getQueryData(["boardLists", boardId]);

      // Cập nhật cache tạm thời
      queryClient.setQueryData(["boardLists", boardId], (old) => ({
        ...old,
        lists: newLists,
      }));

      return { previousLists };
    },
    onError: (err, _, context) => {
      console.error("Không thể cập nhật vị trí trên server:", err);
      if (context?.previousLists) {
        queryClient.setQueryData(
          ["boardLists", boardId],
          context.previousLists
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(["boardLists", boardId]);
    },
  });

  return { mutation };
};

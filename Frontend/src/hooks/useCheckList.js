import { useCallback, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCheckLists } from "../api/models/cardsApi";
import echoInstance from "./realtime/useRealtime";
import { use } from "react";

export const useChecklist = (cardId) => {
  const queryClient = useQueryClient();
  const channelRef = useRef(null);

  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["checklist", cardId],
    queryFn: () => fetchCheckLists(cardId),
    enabled: !!cardId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Checklist REALTIME ------------------------------------------------------------------------------------
  const updateChecklistCreated = useCallback(
    (event) => {
      if (!event?.id) return;

      const existingData = queryClient.getQueryData(["checklist", cardId]);
      const dataArray = Array.isArray(existingData) ? existingData : [];

      const exist = dataArray.find((item) => item.id === event.id);
      if (exist) return; // Nếu đã tồn tại thì không làm gì cả

      queryClient.invalidateQueries({
        queryKey: ["checklist", cardId],
        exact: true,
      });
    },
    [cardId, data, queryClient]
  );

  const handleChecklistUpdated = useCallback(
    (event) => {
      if (!event) return;
      queryClient.setQueryData(["checklist", cardId], (oldData = []) => {
        const dataArray = Array.isArray(oldData) ? oldData : [];
        return dataArray.filter((item) => item.id === event.id);
      });
      queryClient.invalidateQueries({
        queryKey: ["checklist", cardId],
        exact: true,
      });
    },
    [cardId, data, queryClient]
  );

  const handleChecklistDeleted = useCallback(
    (event) => {
      if (!event) return;
      queryClient.setQueryData(["checklist", cardId], (oldData = []) => {
        const dataArray = Array.isArray(oldData) ? oldData : [];
        return dataArray.filter((item) => item.id !== event.id);
      });
      queryClient.invalidateQueries({
        queryKey: ["checklist", cardId],
        exact: true,
      });
    },
    [cardId, data, queryClient]
  );

  // Checklist REALTIME ------------------------------------------------------------------------------------
  const handleChecklistItemCreated = useCallback(
    (event) => {
      if (!event?.id) return;

      const existingData = queryClient.getQueryData(["checklist", cardId]);
      const dataArray = Array.isArray(existingData) ? existingData : [];

      const exists = dataArray.some((item) => item.id === event.id);
      if (exists) return;

      queryClient.invalidateQueries({
        queryKey: ["checklist", cardId],
        exact: true,
      });
    },
    [cardId, data, queryClient]
  );

  const handleChecklistItemUpdated = useCallback(
    (event) => {
      if (!event) return;

      queryClient.setQueryData(["checklist", cardId], (oldData = []) => {
        const dataArray = Array.isArray(oldData) ? oldData : [];
        return dataArray.map((checklist) => {
          if (checklist.id === event.checklist_id) {
            // Kiểm tra xem item đã được cập nhật chưa
            const updatedItems = checklist.items.map((item) => {
              if (item.id === event.id) {
                // Nếu dữ liệu không thay đổi, không cập nhật
                if (JSON.stringify(item) === JSON.stringify(event)) {
                  return item; // Trả về item không thay đổi
                }
                return { ...item, ...event };
              }
              return item;
            });
            return {
              ...checklist,
              items: updatedItems,
            };
          }
          return checklist; // Trả về checklist không thay đổi nếu không phải checklist cần cập nhật
        });
      });

      queryClient.invalidateQueries({
        queryKey: ["checklist", cardId],
        exact: true,
      });
    },
    [cardId, queryClient]
  );

  const handleChecklistItemDeleted = useCallback(
    (event) => {
      console.log(event);
      if (!event) return;
      queryClient.setQueryData(["checklist", cardId], (oldData = []) => {
        const dataArray = Array.isArray(oldData) ? oldData : [];
        return dataArray.map((checklist) => {
          if (checklist.id === event.checklist_id) {
            const updatedItems = checklist.items.filter(
              (item) => item.id !== event.id
            );
            return {
              ...checklist,
              items: updatedItems,
            };
          }
          return checklist;
        });
      });
      queryClient.invalidateQueries({
        queryKey: ["checklist", cardId],
        exact: true,
      });
    },
    [cardId, data, queryClient]
  );

  useEffect(() => {
    if (!cardId) return;

    const channel = echoInstance.channel(`card.${cardId}`);
    channelRef.current = channel;

    channel.listen(".checklist.created", updateChecklistCreated);
    channel.listen(".checklist.updated", handleChecklistUpdated);
    channel.listen(".checklist.deleted", handleChecklistDeleted);
    channel.listen(".checklistItem.created", handleChecklistItemCreated);
    channel.listen(".checklistItem.updated", handleChecklistItemUpdated);
    channel.listen(".checklistItem.deleted", handleChecklistItemDeleted);

    return () => {
      if (channelRef.current) {
        channelRef.current.stopListening(".checklist.created");
        channelRef.current.stopListening(".checklist.updated");
        channelRef.current.stopListening(".checklist.deleted");
        channelRef.current.stopListening(".checklistItem.created");
        channelRef.current.stopListening(".checklistItem.updated");
        channelRef.current.stopListening(".checklistItem.deleted");
        echoInstance.leaveChannel(`card.${cardId}`);
      }
    };
  }, [cardId]);

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

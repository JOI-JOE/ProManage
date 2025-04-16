import { fetchCheckLists } from "../api/models/cardsApi";
import { useCallback, useEffect, useRef } from "react";
import echoInstance from "./realtime/useRealtime";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useChecklist = (cardId, userId) => {
  const queryClient = useQueryClient();
  const channelRef = useRef(null);
  const pendingOpsRef = useRef(new Set());

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["checklist", cardId],
    queryFn: () => fetchCheckLists(cardId),
    enabled: !!cardId,
    staleTime: 1000 * 60 * 5,
  });

  const safelyUpdateQueryData = useCallback(
    (updater) => {
      try {
        queryClient.setQueryData(["checklist", cardId], updater);
      } catch (error) {
        console.error("Failed to update checklist query data:", error);
        queryClient.invalidateQueries({
          queryKey: ["checklist", cardId],
          exact: true,
        });
      }
    },
    [cardId, queryClient]
  );

  const handleRefetchIfNeeded = useCallback(
    (eventType, id) => {
      const opKey = `${eventType}-${id}`;
      pendingOpsRef.current.add(opKey);

      setTimeout(() => {
        if (pendingOpsRef.current.size > 0) {
          refetch()
            .then(() => {
              pendingOpsRef.current.clear();
            })
            .catch((error) => {
              console.error("Refetch failed:", error);
            });
        }
      }, 2000);
    },
    [refetch]
  );

  const handleChecklistCreated = useCallback(
    (event) => {
      const newChecklist = event?.checklist;
      const eventCardId = event?.card_id;
      const eventUserId = event?.user_id;
      if (!newChecklist) {
        console.warn("No checklist data in event:", event);
        return;
      }
      if (eventCardId && eventCardId.toString() !== cardId.toString()) {
        return;
      }
      if (eventUserId && eventUserId.toString() === userId?.toString()) {
        console.log("Skipping checklist.created event from self:", eventUserId);
        return;
      }

      safelyUpdateQueryData((oldData) => {
        if (!Array.isArray(oldData)) return [newChecklist];

        const exists = oldData.some((item) => item.id === newChecklist.id);
        return exists ? oldData : [...oldData, newChecklist];
      });

      handleRefetchIfNeeded("created", newChecklist.id);
    },
    [cardId, userId, safelyUpdateQueryData, handleRefetchIfNeeded]
  );

  const handleChecklistUpdated = useCallback(
    (event) => {
      const updatedChecklist = event?.checklist;
      const eventCardId = event?.card_id;
      const eventUserId = event?.user_id;
      if (!updatedChecklist) {
        console.warn("No checklist data in event:", event);
        return;
      }
      if (eventCardId && eventCardId.toString() !== cardId.toString()) {
        return;
      }
      if (eventUserId && eventUserId.toString() === userId?.toString()) {
        console.log("Skipping checklist.updated event from self:", eventUserId);
        return;
      }

      safelyUpdateQueryData((oldData) => {
        if (!Array.isArray(oldData)) return [updatedChecklist];

        return oldData.map((checklist) =>
          checklist.id === updatedChecklist.id ? updatedChecklist : checklist
        );
      });

      handleRefetchIfNeeded("updated", updatedChecklist.id);
    },
    [cardId, userId, safelyUpdateQueryData, handleRefetchIfNeeded]
  );

  const handleChecklistDeleted = useCallback(
    (event) => {
      const checklistId = event?.checklist_id;
      const eventCardId = event?.card_id;
      const eventUserId = event?.user_id;
      if (!checklistId) {
        console.warn("No checklist ID in event:", event);
        return;
      }
      if (eventCardId && eventCardId.toString() !== cardId.toString()) {
        return;
      }
      if (eventUserId && eventUserId.toString() === userId?.toString()) {
        console.log("Skipping checklist.deleted event from self:", eventUserId);
        return;
      }

      safelyUpdateQueryData((oldData) => {
        if (!oldData) return oldData;
        return oldData.filter((item) => item.id !== checklistId);
      });

      handleRefetchIfNeeded("deleted", checklistId);
    },
    [cardId, userId, safelyUpdateQueryData, handleRefetchIfNeeded]
  );

  const handleChecklistItemCreated = useCallback(
    (event) => {
      const newChecklistItem = event?.checklist_item;
      const eventCardId = event?.card_id;
      const eventUserId = event?.user_id;
      if (!newChecklistItem) {
        console.warn("No checklist item data in event:", event);
        return;
      }
      if (eventCardId && eventCardId.toString() !== cardId.toString()) {
        return;
      }
      if (eventUserId && eventUserId.toString() === userId?.toString()) {
        console.log(
          "Skipping checklistItem.created event from self:",
          eventUserId
        );
        return;
      }

      console.log("New checklist item created:", newChecklistItem);

      safelyUpdateQueryData((oldData) => {
        if (!Array.isArray(oldData)) return oldData;

        const updatedData = oldData.map((checklist) => {
          if (checklist.id === newChecklistItem.checklist_id) {
            return {
              ...checklist,
              items: [...(checklist.items || []), newChecklistItem],
            };
          }
          return checklist;
        });
        return updatedData;
      });

      handleRefetchIfNeeded("created", newChecklistItem.id);
    },
    [cardId, userId, safelyUpdateQueryData, handleRefetchIfNeeded]
  );

  const handleChecklistItemUpdated = useCallback(
    (event) => {
      const updatedChecklistItem = event?.checklist_item;
      const eventCardId = event?.card_id;
      const eventUserId = event?.user_id;
      if (!updatedChecklistItem) {
        console.warn("No checklist item data in event:", event);
        return;
      }
      if (eventCardId && eventCardId.toString() !== cardId.toString()) {
        return;
      }
      if (eventUserId && eventUserId.toString() === userId?.toString()) {
        console.log(
          "Skipping checklistItem.updated event from self:",
          eventUserId
        );
        return;
      }

      console.log("Checklist item updated:", updatedChecklistItem);

      safelyUpdateQueryData((oldData) => {
        if (!Array.isArray(oldData)) return oldData;

        const updatedData = oldData.map((checklist) => {
          if (checklist.id === updatedChecklistItem.checklist_id) {
            return {
              ...checklist,
              items: (checklist.items || []).map((item) =>
                item.id === updatedChecklistItem.id
                  ? updatedChecklistItem
                  : item
              ),
            };
          }
          return checklist;
        });
        return updatedData;
      });

      handleRefetchIfNeeded("updated", updatedChecklistItem.id);
    },
    [cardId, userId, safelyUpdateQueryData, handleRefetchIfNeeded]
  );

  const handleChecklistItemDeleted = useCallback(
    (event) => {
      const checklistItemId = event?.checklist_item_id;
      const checklistId = event?.checklist_id;
      const eventCardId = event?.card_id;
      const eventUserId = event?.user_id;
      if (!checklistItemId || !checklistId) {
        console.warn("No checklist item ID or checklist ID in event:", event);
        return;
      }
      if (eventCardId && eventCardId.toString() !== cardId.toString()) {
        return;
      }
      if (eventUserId && eventUserId.toString() === userId?.toString()) {
        console.log(
          "Skipping checklistItem.deleted event from self:",
          eventUserId
        );
        return;
      }

      console.log("Checklist item deleted:", { checklistItemId, checklistId });

      safelyUpdateQueryData((oldData) => {
        if (!Array.isArray(oldData)) return oldData;

        const updatedData = oldData.map((checklist) => {
          if (checklist.id === checklistId) {
            return {
              ...checklist,
              items: (checklist.items || []).filter(
                (item) => item.id !== checklistItemId
              ),
            };
          }
          return checklist;
        });
        return updatedData;
      });

      handleRefetchIfNeeded("deleted", checklistItemId);
    },
    [cardId, userId, safelyUpdateQueryData, handleRefetchIfNeeded]
  );

  useEffect(() => {
    if (!cardId) {
      return;
    }

    const channel = echoInstance.channel(`card.${cardId}`);
    channelRef.current = channel;
    channel.listen(".checklist.created", handleChecklistCreated);
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
  }, [
    cardId,
    handleChecklistCreated,
    handleChecklistUpdated,
    handleChecklistDeleted,
    handleChecklistItemCreated,
    handleChecklistItemUpdated,
    handleChecklistItemDeleted,
  ]);

  return {
    data,
    isLoading,
    isError,
    refetch,
    forceRefresh: () =>
      queryClient.invalidateQueries({
        queryKey: ["checklist", cardId],
        exact: true,
      }),
  };
};

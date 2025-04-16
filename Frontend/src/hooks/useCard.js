import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCard,
  updateDescription,
  updateCardTitle,
  updateArchivedCard,
  deleteCard,
  getCardArchivedByBoard,
  getMemberInCard,
  toggleCardMember,
  updatePositionCard,
  updateCardDate,
  getDateByCard,
  // ---------------
  fetchCardById,
  updateCardById,
  putMemberToCard,
  joinCard,
  removeMemberFromCard,
  postCheckLists,
  postChecklistItem,
  updateCheckListItem,
  removeCheckListFromCard,
  removeCheckListItem,
  postAttachmentFile,
  postAttachmentLink,
  fetchAttachments,
  putAttachment,
  removeAttachment,
  fetchComments,
  postComment,
  putComment,
  removeComment,
  removeCard,
  updateCheckList,
  fetchActivities,
  moveCard,
  copyCard,
} from "../api/models/cardsApi";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import echoInstance from "./realtime/useRealtime";

// GET FUNCTION ------------------------------------------------------
export const useCardById = (cardId) => {
  const queryClient = useQueryClient();
  const channelRef = useRef(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["card", cardId],
    queryFn: () => fetchCardById(cardId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!cardId,
  });

  // Handle card updates from WebSocket events
  const handleCardUpdate = useCallback(
    (updateEvent) => {
      console.log("Received card update event:", updateEvent);
      if (!updateEvent?.id || updateEvent.id !== parseInt(cardId)) return;

      // Update the query cache with the new data
      queryClient.setQueryData(["card", cardId], (oldData) => {
        if (!oldData) return updateEvent;

        // Merge new data with existing data, focusing on updated fields
        return {
          ...oldData,
          ...updateEvent,
          // Ensure nested objects are properly updated
          badges: {
            ...(oldData.badges || {}),
            ...(updateEvent.badges || {}),
          },
          // Make sure arrays are completely replaced rather than merged
          members: updateEvent.members || oldData.members,
          membersId: updateEvent.membersId || oldData.membersId,
          labels: updateEvent.labels || oldData.labels,
          labelId: updateEvent.labelId || oldData.labelId,
        };
      });
    },
    [cardId, queryClient]
  );

  // Subscribe to the board channel for card updates
  useEffect(() => {
    if (!cardId || !data?.list_board?.board_id) return;

    const boardId = data.list_board.board_id;
    const channel = echoInstance.channel(`board.${boardId}`);
    channelRef.current = channel;

    // Listen for the card.updated event
    channel.listen(".card.updated", handleCardUpdate);

    return () => {
      if (channelRef.current) {
        channelRef.current.stopListening(".card.updated");
      }
    };
  }, [cardId, data?.list_board?.board_id, handleCardUpdate]);

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};
// Checklist card

// Attachment card
// export const useFetchAttachments = (cardId) => {
//   const queryClient = useQueryClient();
//   const channelRef = useRef(null);
//   const pendingOpsRef = useRef(new Set()); // Track pending operations

//   // Main data fetch query
//   const { data, isLoading, isError, refetch } = useQuery({
//     queryKey: ["attachments", cardId],
//     queryFn: () => fetchAttachments(cardId),
//     enabled: !!cardId,
//     staleTime: 1000 * 60 * 5, // 5 minutes
//   });

//   const safelyUpdateQueryData = useCallback(
//     (updater) => {
//       try {
//         queryClient.setQueryData(["attachments", cardId], updater);
//       } catch (error) {
//         queryClient.invalidateQueries({
//           queryKey: ["attachments", cardId],
//           exact: true,
//         });
//       }
//     },
//     [cardId, queryClient]
//   );

//   // Selective refetch - only refetch if the event affects our current view
//   const handleRefetchIfNeeded = useCallback(
//     (eventType, id) => {
//       // Add operation to pending set
//       const opKey = `${eventType}-${id}`;
//       pendingOpsRef.current.add(opKey);

//       // Schedule a refetch after a short delay (debounce multiple events)
//       setTimeout(() => {
//         if (pendingOpsRef.current.size > 0) {
//           refetch().then(() => {
//             pendingOpsRef.current.clear();
//           });
//         }
//       }, 2000);
//     },
//     [refetch]
//   );

//   // Thêm mới attachment (Optimistic + Verification)
//   const handleAttachmentCreated = useCallback(
//     (event) => {
//       const newAttachment = event?.attachment;
//       const eventCardId = event?.card_id;
//       if (!newAttachment) {
//         return;
//       }
//       // Ensure event is for current card
//       if (eventCardId && eventCardId.toString() !== cardId.toString()) {
//         return;
//       }
//       safelyUpdateQueryData((oldData) => {
//         if (!Array.isArray(oldData)) return [newAttachment];

//         const exists = oldData.some((item) => item.id === newAttachment.id);
//         return exists ? oldData : [...oldData, newAttachment];
//       });

//       handleRefetchIfNeeded("created", newAttachment.id);
//     },
//     [cardId, safelyUpdateQueryData, handleRefetchIfNeeded]
//   );

//   // Cập nhật attachment
//   const handleAttachmentUpdated = useCallback(
//     (event) => {
//       const updatedAttachment = event?.attachment;
//       const eventCardId = event?.card_id;
//       if (!updatedAttachment) {
//         return;
//       }
//       if (eventCardId && eventCardId.toString() !== cardId.toString()) {
//         return;
//       }
//       safelyUpdateQueryData((oldData) => {
//         if (!oldData) return oldData;
//         return oldData.map((item) =>
//           item.id === updatedAttachment.id ? updatedAttachment : item
//         );
//       });
//       handleRefetchIfNeeded("updated", updatedAttachment.id);
//     },
//     [cardId, safelyUpdateQueryData, handleRefetchIfNeeded]
//   );

//   // Xoá attachment
//   const handleAttachmentDeleted = useCallback(
//     (event) => {
//       const attachmentId = event?.attachment_id;
//       const eventCardId = event?.card_id;

//       if (!attachmentId) {
//         return;
//       }
//       // Ensure event is for current card
//       if (eventCardId && eventCardId.toString() !== cardId.toString()) {
//         return;
//       }

//       // Apply optimistic update
//       safelyUpdateQueryData((oldData) => {
//         if (!oldData) return oldData;
//         return oldData.filter((item) => item.id !== attachmentId);
//       });

//       // Schedule verification refetch
//       handleRefetchIfNeeded("deleted", attachmentId);
//     },
//     [cardId, safelyUpdateQueryData, handleRefetchIfNeeded]
//   );

//   // Subscribe to realtime channel
//   useEffect(() => {
//     if (!cardId) {
//       console.log("cardId is not provided, skipping subscription");
//       return;
//     }

//     console.log("Subscribing to channel:", `card.${cardId}`);
//     const channel = echoInstance.channel(`card.${cardId}`);
//     channelRef.current = channel;

//     channel.subscribed(() => {
//       console.log("Successfully subscribed to channel:", `card.${cardId}`);
//     });

//     channel.error((err) => {
//       console.error("Error subscribing to channel:", `card.${cardId}`, err);
//     });

//     channel.listen(".attachment.created", handleAttachmentCreated);
//     channel.listen(".attachment.updated", handleAttachmentUpdated);
//     channel.listen(".attachment.deleted", handleAttachmentDeleted);

//     return () => {
//       if (channelRef.current) {
//         channelRef.current.stopListening(".attachment.created");
//         channelRef.current.stopListening(".attachment.updated");
//         channelRef.current.stopListening(".attachment.deleted");
//         echoInstance.leaveChannel(`card.${cardId}`);
//       }
//     };
//   }, [
//     cardId,
//     handleAttachmentCreated,
//     handleAttachmentUpdated,
//     handleAttachmentDeleted,
//   ]);

//   // Return enhanced methods for component use
//   return {
//     data,
//     isLoading,
//     isError,
//     refetch,
//     forceRefresh: () =>
//       queryClient.invalidateQueries({
//         queryKey: ["attachments", cardId],
//         exact: true,
//       }),
//   };
// };
export const useFetchAttachments = (cardId) => {
  const queryClient = useQueryClient();
  const channelRef = useRef(null);

  // Fetch attachments using React Query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["attachments", cardId],
    queryFn: () => fetchAttachments(cardId),
    enabled: !!cardId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Helper function to update attachments in the query cache
  const updateAttachmentData = useCallback(
    (updateEvent, conditionFn) => {
      queryClient.setQueryData(["attachments", cardId], (oldData = []) => {
        if (!Array.isArray(oldData)) return oldData;

        return oldData.map((item) =>
          conditionFn(item, updateEvent) ? { ...item, ...updateEvent } : item
        );
      });
    },
    [cardId, queryClient]
  );

  // Handle adding new attachment
  const handleAddAttachment = useCallback(
    (event) => {
      const newAttachment = event?.attachment;
      if (!newAttachment) return;

      queryClient.setQueryData(["attachments", cardId], (oldData = []) => {
        if (!Array.isArray(oldData)) return [newAttachment];

        const exists = oldData.some((item) => item.id === newAttachment.id);
        if (exists) {
          console.log("Attachment already exists:", newAttachment);
          return oldData;
        }

        console.log("New attachment added:", newAttachment);
        return [...oldData, newAttachment];
      });

      // Invalidate the query to refetch data if necessary
      queryClient.invalidateQueries(["attachments", cardId]);
    },
    [cardId, queryClient]
  );

  // Handle attachment update
  const handleUpdateAttachment = useCallback(
    (event) => {
      const updatedAttachment = event?.attachment;
      if (!updatedAttachment) return;

      updateAttachmentData(
        updatedAttachment,
        (item, updateEvent) => item.id === updateEvent.id
      );
    },
    [updateAttachmentData]
  );

  // Handle attachment deletion
  const handleAttachmentDeleted = useCallback(
    (event) => {
      const attachmentId = event?.attachment_id;
      const eventCardId = event?.card_id;

      if (
        !attachmentId ||
        (eventCardId && eventCardId.toString() !== cardId.toString())
      )
        return;

      queryClient.setQueryData(["attachments", cardId], (oldData = []) => {
        return oldData.filter((item) => item.id !== attachmentId);
      });

      // Invalidate the query to refetch data if necessary
      queryClient.invalidateQueries(["attachments", cardId]);
    },
    [cardId, queryClient]
  );

  // Handle movement or status change of attachment
  const handleMoveOrUpdateAttachment = useCallback(
    (event) => {
      const updatedAttachment = event?.attachment;
      if (!updatedAttachment) return;

      updateAttachmentData(
        updatedAttachment,
        (item, updateEvent) => item.id === updateEvent.id
      );
    },
    [updateAttachmentData]
  );

  // Subscribe to relevant channels for real-time updates
  useEffect(() => {
    if (!cardId) return;

    const channel = echoInstance.channel(`card.${cardId}`);
    channelRef.current = channel;

    channel.listen(".attachment.created", handleAddAttachment);
    channel.listen(".attachment.updated", handleUpdateAttachment);
    channel.listen(".attachment.moved", handleAttachmentDeleted);

    return () => {
      if (channelRef.current) {
        channelRef.current.stopListening(".attachment.created");
        channelRef.current.stopListening(".attachment.updated");
        channelRef.current.stopListening(".attachment.deleted");
        echoInstance.leaveChannel(`card.${cardId}`);
      }
    };
  }, [
    cardId,
    handleAddAttachment,
    handleUpdateAttachment,
    handleMoveOrUpdateAttachment,
  ]);

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

// CommentCard
export const useFetchComments = (cardId, userId) => {
  const queryClient = useQueryClient();
  const channelRef = useRef(null);
  const pendingOpsRef = useRef(new Set());

  // Main data fetch query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["comments", cardId],
    queryFn: () => fetchComments(cardId),
    enabled: Boolean(cardId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Safely update query data with error handling
  const safelyUpdateQueryData = useCallback(
    (updater) => {
      try {
        queryClient.setQueryData(["comments", cardId], updater);
      } catch (error) {
        console.error("Failed to update comments query data:", error);
        queryClient.invalidateQueries({
          queryKey: ["comments", cardId],
          exact: true,
        });
      }
    },
    [cardId, queryClient]
  );

  // Selective refetch to verify data consistency
  const handleRefetchIfNeeded = useCallback(
    (eventType, id) => {
      const opKey = `${eventType}-${id}`;
      pendingOpsRef.current.add(opKey);

      // Debounce refetch to handle multiple events
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

  // Handle comment created event
  const handleCommentCreated = useCallback(
    (event) => {
      const newComment = event?.comment;
      const eventCardId = event?.card_id;
      const eventUserId = event?.user_id;
      if (!newComment) {
        console.warn("No comment data in event:", event);
        return;
      }
      if (eventCardId && eventCardId.toString() !== cardId.toString()) {
        return;
      }
      if (eventUserId && eventUserId.toString() === userId?.toString()) {
        console.log("Skipping comment.created event from self:", eventUserId);
        return;
      }

      console.log("New comment created:", newComment);

      safelyUpdateQueryData((oldData) => {
        if (!Array.isArray(oldData)) return [newComment];
        const exists = oldData.some((item) => item.id === newComment.id);
        return exists ? oldData : [newComment, ...oldData]; // Prepend for newest first
      });

      handleRefetchIfNeeded("created", newComment.id);
    },
    [cardId, userId, safelyUpdateQueryData, handleRefetchIfNeeded]
  );

  // Handle comment updated event
  const handleCommentUpdated = useCallback(
    (event) => {
      const updatedComment = event?.comment;
      const eventCardId = event?.card_id;
      const eventUserId = event?.user_id;
      if (!updatedComment) {
        console.warn("No comment data in event:", event);
        return;
      }
      if (eventCardId && eventCardId.toString() !== cardId.toString()) {
        return;
      }
      if (eventUserId && eventUserId.toString() === userId?.toString()) {
        console.log("Skipping comment.updated event from self:", eventUserId);
        return;
      }

      console.log("Comment updated:", updatedComment);

      safelyUpdateQueryData((oldData) => {
        if (!Array.isArray(oldData)) return [updatedComment];
        return oldData.map((comment) =>
          comment.id === updatedComment.id ? updatedComment : comment
        );
      });

      handleRefetchIfNeeded("updated", updatedComment.id);
    },
    [cardId, userId, safelyUpdateQueryData, handleRefetchIfNeeded]
  );

  // Handle comment deleted event
  const handleCommentDeleted = useCallback(
    (event) => {
      const commentId = event?.comment_id;
      const eventCardId = event?.card_id;
      const eventUserId = event?.user_id;
      if (!commentId) {
        console.warn("No comment ID in event:", event);
        return;
      }
      if (eventCardId && eventCardId.toString() !== cardId.toString()) {
        return;
      }
      if (eventUserId && eventUserId.toString() === userId?.toString()) {
        console.log("Skipping comment.deleted event from self:", eventUserId);
        return;
      }

      console.log("Comment deleted:", { commentId });

      safelyUpdateQueryData((oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.filter((comment) => comment.id !== commentId);
      });

      handleRefetchIfNeeded("deleted", commentId);
    },
    [cardId, userId, safelyUpdateQueryData, handleRefetchIfNeeded]
  );

  // Set up real-time listeners
  useEffect(() => {
    if (!cardId) {
      return;
    }

    const channel = echoInstance.channel(`card.${cardId}`);
    channelRef.current = channel;

    channel.listen(".comment.created", handleCommentCreated);
    channel.listen(".comment.updated", handleCommentUpdated);
    channel.listen(".comment.deleted", handleCommentDeleted);

    return () => {
      if (channelRef.current) {
        channelRef.current.stopListening(".comment.created");
        channelRef.current.stopListening(".comment.updated");
        channelRef.current.stopListening(".comment.deleted");
        echoInstance.leaveChannel(`card.${cardId}`);
      }
    };
  }, [
    cardId,
    handleCommentCreated,
    handleCommentUpdated,
    handleCommentDeleted,
  ]);

  return {
    data,
    isLoading,
    isError,
    refetch,
    forceRefresh: () =>
      queryClient.invalidateQueries({
        queryKey: ["comments", cardId],
        exact: true,
      }),
  };
};

// Activity
export const useFetchActivities = (cardId) => {
  return useQuery({
    queryKey: ["activities", cardId],
    queryFn: () => fetchActivities(cardId),
    enabled: Boolean(cardId),
    staleTime: 1000 * 60 * 5, // 5 phút, tránh gọi lại nếu chưa cần thiết
  });
};
// POST FUNCTION ------------------------------------------------------
export const useCopyCard = () => {
  return useMutation({
    mutationFn: ({ cardId, data }) => copyCard({ cardId, data }),
    onError: (error) => {
      console.error("❌ Error copying card:", error);
    },
  });
};

export const useMoveCard = () => {
  return useMutation({
    mutationFn: ({ cardId, ...copyData }) => moveCard({ cardId, ...copyData }), // Sửa: truyền đúng cấu trúc object
    onError: (error) => {
      console.error("❌ Error moving card:", error);
      toast.error(error.response?.data?.message || "Failed to move card");
    },
  });
};

// thêm mới list
export const usePostCheckList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, data }) => postCheckLists({ cardId, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist", cardId] });
    },
    onError: (error) => {
      console.error("❌ Lỗi khi tạo checklist:", error);
    },
  });
};
// thêm mới item
export const usePostChecklistItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, data }) =>
      postChecklistItem({ checklistId, data }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
    },
    onError: (error) => {
      console.error("❌ Lỗi khi tạo checklist item:", error);
    },
  });
};
// Thêm mới file
export const usePostAttachmentFile = () => {
  return useMutation({
    mutationFn: ({ cardId, file }) => postAttachmentFile({ cardId, file }),
    onError: (error) => {
      console.error("❌ Lỗi khi tải lên file:", error);
    },
  });
};
// thêm mới link
export const usePostAttachmentLink = () => {
  // const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, link }) => postAttachmentLink({ cardId, link }),
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ["card", cardId] });
    },
    onError: (error) => {
      console.error("❌ Lỗi khi thêm link:", error);
    },
  });
};
// thêm mới comment
export const usePostComment = () => {
  return useMutation({
    mutationFn: ({ cardId, content }) => postComment({ cardId, content }),
    onError: (error) => {
      console.error("❌ Lỗi khi thêm bình luận:", error);
    },
  });
};
// PUT FUNCTION ------------------------------------------------------
// Checklist
export const useUpdateCheckList = () => {
  return useMutation({
    mutationFn: ({ checklistId, data }) => updateCheckList(checklistId, data),
    onError: (error) => {
      console.error("Error updating checklist:", error);
    },
  });
};
// Item
export const useUpdateCheckListItem = (checklistItemId) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => updateCheckListItem(checklistItemId, data),
    onSuccess: () => {
      // Optionally invalidate checklist data
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật mục checklist:", error);
    },
  });

  return {
    updateName: (name) => mutation.mutate({ name }),
    updateStatus: (is_completed) => mutation.mutate({ is_completed }),
    updateStartDate: (start_date) => mutation.mutate({ start_date }),
    updateEndDate: (end_date) => mutation.mutate({ end_date }),
    updateEndTime: (end_time) => mutation.mutate({ end_time }),
    updateReminder: (reminder) => mutation.mutate({ reminder }),
    updateAssignee: (assignee) => mutation.mutate({ assignee }),
    isUpdating: mutation.isLoading,
  };
};
// Card
export const useUpdateCardById = (cardId) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => updateCardById(cardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["card", cardId] });
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
    onError: (error) => {
      console.error("Error updating card:", error.message || error);
    },
  });

  const updateCard = (data) => {
    mutation.mutate(data);
  };

  return {
    updateTitle: (title) => updateCard({ title }),
    updateDescription: (description) => updateCard({ description }),
    updateThumbnail: (thumbnail) => updateCard({ thumbnail }),
    updatePosition: (position, listBoardId) =>
      updateCard({
        position,
        list_board_id: listBoardId,
        is_archived: false, // Đảm bảo card không bị ẩn khi di chuyển
      }),
    updateDates: ({ startDate, endDate, endTime, reminder }) =>
      updateCard({
        start_date: startDate,
        end_date: endDate,
        end_time: endTime,
        reminder,
      }),
    updateIsCompleted: (isCompleted) =>
      updateCard({ is_completed: isCompleted }),
    updateIsArchived: (isArchived) => updateCard({ is_archived: isArchived }),
    isUpdating: mutation.isLoading,
    error: mutation.error,
  };
};
// position card
export const useUpdateCardPosition = () => {
  return useMutation({
    mutationFn: async ({ cardId, listId, position }) => {
      return await updatePositionCard({ cardId, listId, position });
    },
    retry: 3,
    retryDelay: 1000, // Thử lại sau 1 giây nếu lỗi
  });
};
// Member card
export const useJoinOrPutMember = (cardId) => {
  const queryClient = useQueryClient();

  // Tham gia card (người dùng hiện tại)
  const joinCardMutation = useMutation({
    mutationFn: () => joinCard(cardId),
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ["card", cardId] });
    },
    onError: (error) => {
      console.error("Lỗi khi tham gia card:", error);
    },
  });

  // Thêm thành viên cụ thể vào card
  const putMemberToCardMutation = useMutation({
    mutationFn: (memberId) => putMemberToCard(cardId, memberId),
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ["card", cardId] });
    },
    onError: (error) => {
      console.error("Lỗi khi thêm thành viên:", error);
    },
  });

  // Xoá thành viên khỏi card
  const removeMemberFromCardMutation = useMutation({
    mutationFn: (memberId) => removeMemberFromCard(cardId, memberId),
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ["card", cardId] });
    },
    onError: (error) => {
      console.error("Lỗi khi xoá thành viên:", error);
    },
  });

  return {
    joinCard: joinCardMutation.mutate,
    isJoining: joinCardMutation.isLoading,

    putMember: putMemberToCardMutation.mutate,
    isPutting: putMemberToCardMutation.isLoading,

    removeMember: removeMemberFromCardMutation.mutate,
    isRemoving: removeMemberFromCardMutation.isLoading,
  };
};
// Attachment
export const usePutAttachment = () => {
  // const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ attachmentId, data }) => putAttachment(attachmentId, data),
    onError: (error) => {
      console.error("Lỗi khi cập nhật tệp đính kèm:", error);
    },
  });

  return {
    mutateAsync: ({ attachmentId, data }) =>
      mutation.mutateAsync({ attachmentId, data }),
    isLoading: mutation.isLoading,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
};

export const useUpdateComment = () => {
  return useMutation({
    mutationFn: ({ commentId, content }) => putComment(commentId, content),
    onError: (error) => {
      console.error("Error updating comment:", error);
    },
  });
};
// DELETE FUNCTION -----------------------------------------------------
// - checklist
export const useRemoveChecklistFromCard = () => {
  return useMutation({
    mutationFn: (checklistId) => removeCheckListFromCard(checklistId),
    onError: (error) => {
      console.error("Failed to remove checklist:", error);
    },
  });
};
// - checklistitem
export const useRemoveCheckListItem = () => {
  const mutation = useMutation({
    mutationFn: (checklistItemId) => removeCheckListItem(checklistItemId),
    onError: (error) => {
      console.error("❌ Failed to remove checklist item:", error);
    },
  });

  return {
    removeItem: mutation.mutate,
    ...mutation,
  };
};
// -attachment
export const useRemoveAttachment = () => {
  return useMutation({
    mutationFn: (attachmentId) => removeAttachment(attachmentId),
    onError: (error) => {
      console.error("❌ Failed to remove checklist item:", error);
    },
  });
};
// - comment
export const useRemoveComment = () => {
  return useMutation({
    mutationFn: (commentId) => removeComment(commentId),
    onError: (error) => {
      console.error("❌ Failed to remove commemt:", error);
    },
  });
};
// - card
export const useRemoveCard = () => {
  return useMutation({
    mutationFn: (cardId) => removeCard(cardId),
    onError: (error) => {
      console.error("❌ Failed to remove commemt:", error);
    },
  });
};
// ------------------------------------------------------

export const useCreateCard = () => {
  return useMutation({
    mutationFn: createCard,
    onError: (error) => {
      console.error("❌ Lỗi khi tạo thẻ:", error);
    },
  });
};

export const useCardActions = (boardId) => {
  const queryClient = useQueryClient();

  // Lấy danh sách card đã lưu trữ theo board
  const {
    data: cards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cardsArchivedByBoard", boardId],
    queryFn: () => getCardArchivedByBoard(boardId),
    enabled: !!boardId, // Chỉ fetch khi có boardId
  });

  useEffect(() => {
    if (!boardId || !echoInstance) return;

    const channel = echoInstance.channel(`boards.${boardId}`);
    // console.log(`📡 Đang lắng nghe kênh: card.${cardId}`);

    channel.listen(".CardArchiveToggled", (data) => {
      // console.log('Realtime archive changed: ', data);

      queryClient.invalidateQueries(["lists"]);
    });
    channel.listen(".CardDelete", (data) => {
      // console.log('Realtime archive changed: ', data);

      queryClient.invalidateQueries(["lists"]);
    });

    return () => {
      channel.stopListening(".CardArchiveToggled");
      channel.stopListening(".CardDelete");
      echoInstance.leave(`boards.${boardId}`);
    };
  }, [boardId, queryClient]);

  // Mutation lưu trữ card
  const archiveCard = useMutation({
    mutationFn: updateArchivedCard,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cardsArchivedByBoard"],
        exact: true,
      });
      queryClient.invalidateQueries(["lists"]);
      toast.success("Đổi trạng thái thẻ thành công!");
    },
    onError: (error) => {
      toast.error(`Lỗi lưu trữ: ${error.message}`);
    },
  });

  // Mutation xóa card
  const deleteCardMutation = useMutation({
    mutationFn: deleteCard,
    onSuccess: () => {
      queryClient.invalidateQueries(["cardsArchivedByBoard"]);
      toast.success("Xóa thẻ thành công!");
    },
    onError: (error) => {
      toast.error(`Lỗi xóa thẻ: ${error.message}`);
    },
  });

  return {
    cards,
    isLoading,
    error,
    archiveCard: archiveCard.mutate, // Gọi mutate trực tiếp
    deleteCard: deleteCardMutation.mutate, // Gọi mutate trực tiếp
  };
};

export const useGetMemberInCard = (cardId) => {
  const queryClient = useQueryClient();

  // Fetch danh sách thành viên
  const membersQuery = useQuery({
    queryKey: ["membersInCard", cardId],
    queryFn: () => getMemberInCard(cardId),
    staleTime: 1000 * 60 * 5, // 5 phút.
    cacheTime: 1000 * 60 * 30, // 30 phút.
    enabled: !!cardId, // Chỉ gọi API khi có cardId hợp lệ.
  });

  useEffect(() => {
    if (!cardId || !echoInstance) return;

    const channel = echoInstance.channel(`card.${cardId}`);

    channel.listen(".CardMemberUpdated", (event) => {
      if (event?.card?.id === cardId) {
        // console.log(`👥 Thành viên ${event.action}:`, event.user.full_name);

        // queryClient.invalidateQueries({ queryKey: ["cards", cardId] });
        // queryClient.invalidateQueries({ queryKey: ["membersInCard", cardId] }); // Fetch lại sau khi API thành công
        queryClient.invalidateQueries({
          queryKey: ["card", cardId],
          exact: true,
        });
        queryClient.invalidateQueries({ queryKey: ["membersInCard", cardId] });
        queryClient.invalidateQueries({ queryKey: ["activities"] });
        queryClient.invalidateQueries({ queryKey: ["lists"] });
      }
    });

    return () => {
      channel.stopListening(".CardMemberUpdated");
      echoInstance.leave(`card.${cardId}`);
    };
  }, [cardId, queryClient]);

  // Mutation để thêm/xóa thành viên
  const mutation = useMutation({
    mutationFn: (userId) => toggleCardMember(cardId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["card", cardId],
        exact: true,
      });
      queryClient.invalidateQueries({ queryKey: ["membersInCard", cardId] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });

  return { ...membersQuery, toggleMember: mutation.mutate };
};

export const useCardSchedule = (targetId) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["cardSchedule", targetId],
    queryFn: () => getDateByCard(targetId),
    enabled: !!targetId, // Chỉ gọi API nếu cardId tồn tại
  });
};

export const useUpdateCardDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetId, startDate, endDate, endTime, reminder }) =>
      updateCardDate(targetId, startDate, endDate, endTime, reminder),
    onSuccess: (data, variables) => {
      // queryClient.invalidateQueries(["cardSchedule"],variables.cardId);
      queryClient.invalidateQueries({
        queryKey: ["cardSchedule", variables.targetId],
        exact: true,
      });
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật ngày card:", error);
    },
  });
};

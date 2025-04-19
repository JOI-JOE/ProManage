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
    staleTime: 1000 * 60 * 5, // 5 phút
    cacheTime: 1000 * 60 * 30, // 30 phút
    enabled: !!cardId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const handleCardUpdate = useCallback(
    (event) => {
      if (!event || !event.id || event.id.toString() !== cardId?.toString())
        return;

      queryClient.setQueryData(["card", cardId], (oldData) => {
        if (!oldData) return event;
        // Nếu dữ liệu không thay đổi, bỏ qua
        if (JSON.stringify(oldData) === JSON.stringify(event)) {
          return oldData;
        }
        return { ...oldData, ...event };
      });

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["card", cardId],
          exact: true,
        });
      }, 500);
    },
    [cardId, queryClient]
  );

  useEffect(() => {
    if (!cardId) return;

    const channel = echoInstance.channel(`card.${cardId}`);
    channelRef.current = channel;

    channel.listen(".card.updated", handleCardUpdate);

    return () => {
      if (channelRef.current) {
        channelRef.current.stopListening(".card.updated");
        echoInstance.leaveChannel(`card.${cardId}`);
      }
    };
  }, [cardId, handleCardUpdate]);

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};
// GET Attachments
export const useFetchAttachments = (cardId) => {
  const queryClient = useQueryClient();
  const channelRef = useRef(null);

  // Fetch attachments using React Query
  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["attachments", cardId],
    queryFn: () => fetchAttachments(cardId),
    enabled: !!cardId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
  // Handle adding new attachment
  const handleAddAttachment = useCallback(
    (event) => {
      if (!event?.id) return;
      const existingData = queryClient.getQueryData(["attachments", cardId]);
      const dataArray = Array.isArray(existingData) ? existingData : [];

      const exists = dataArray.some((item) => item.id === event.id);
      if (exists) return; // Nếu đã có thì không làm gì

      // Nếu chưa có thì gọi refetch từ server
      queryClient.invalidateQueries({
        queryKey: ["attachments", cardId],
        exact: true,
      });
    },
    [cardId, data, queryClient]
  );
  // Handle attachment update
  const handleUpdateAttachment = useCallback(
    (event) => {
      if (!event) {
        return;
      }

      queryClient.setQueryData(["attachments", cardId], (oldData = []) => {
        const dataArray = Array.isArray(oldData) ? oldData : [];
        // Kiểm tra nếu attachment đã tồn tại và không thay đổi
        const existingAttachment = dataArray.find(
          (item) => item.id === event.attachment_id
        );
        if (
          existingAttachment &&
          JSON.stringify(existingAttachment) === JSON.stringify(event)
        ) {
          // Nếu attachment không thay đổi, không làm gì cả
          return oldData;
        }
        // Nếu attachment thay đổi, cập nhật lại dữ liệu
        return dataArray.map((item) =>
          item.id === event.attachment_id ? { ...item, ...event } : item
        );
      });
      // Chỉ gọi invalidateQueries nếu có sự thay đổi
      queryClient.invalidateQueries({
        queryKey: ["attachments", cardId],
        exact: true,
      });
    },
    [cardId, data, queryClient]
  );
  // Handle attachment deletion
  const handleAttachmentDeleted = useCallback(
    (event) => {
      const attachmentId = event?.attachment_id;
      const eventCardId = event?.card_id;
      if (
        !attachmentId ||
        (eventCardId && eventCardId.toString() !== cardId.toString())
      ) {
        return;
      }
      queryClient.setQueryData(["attachments", cardId], (oldData = []) => {
        const dataArray = Array.isArray(oldData) ? oldData : [];
        return dataArray.filter((item) => item.id !== attachmentId);
      });
      queryClient.invalidateQueries({
        queryKey: ["attachments", cardId],
        exact: true,
      });
    },
    [cardId, data, queryClient]
  );

  // Subscribe to real-time updates
  useEffect(() => {
    if (!cardId) return;

    const channel = echoInstance.channel(`card.${cardId}`);
    channelRef.current = channel;

    channel.listen(".attachment.created", handleAddAttachment);
    channel.listen(".attachment.updated", handleUpdateAttachment);
    channel.listen(".attachment.deleted", handleAttachmentDeleted);

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
    handleAttachmentDeleted,
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

  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["comments", cardId],
    queryFn: () => fetchComments(cardId),
    enabled: !!cardId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const handleAddComment = useCallback(
    (event) => {
      if (!event?.comment) return;

      console.log(event);

      const newComment = event.comment;
      const existingData = queryClient.getQueryData(["comments", cardId]);
      const dataArray = Array.isArray(existingData) ? existingData : [];

      const exists = dataArray.some((item) => item.id === newComment.id);
      if (exists) return;

      queryClient.setQueryData(["comments", cardId], (old = []) => [
        ...old,
        newComment,
      ]);
    },
    [cardId, queryClient]
  );

  const handleUpdateComment = useCallback(
    (event) => {
      const updatedComment = event?.comment;
      const eventCardId = event?.card_id;
      const eventUserId = event?.user_id;

      if (
        !updatedComment ||
        eventCardId?.toString() !== cardId?.toString() ||
        eventUserId?.toString() === userId?.toString()
      ) {
        return;
      }

      queryClient.setQueryData(["comments", cardId], (oldData = []) => {
        const dataArray = Array.isArray(oldData) ? oldData : [];
        const index = dataArray.findIndex(
          (item) => item.id === updatedComment.id
        );
        if (index === -1) return oldData;

        const existing = dataArray[index];
        if (JSON.stringify(existing) === JSON.stringify(updatedComment)) {
          return oldData;
        }

        const newData = [...dataArray];
        newData[index] = { ...existing, ...updatedComment };
        return newData;
      });
    },
    [cardId, userId, queryClient]
  );

  const handleDeleteComment = useCallback(
    (event) => {
      const commentId = event?.comment_id;

      if (!commentId) {
        return;
      }
      queryClient.setQueryData(["comments", cardId], (oldData = []) => {
        const dataArray = Array.isArray(oldData) ? oldData : [];
        return dataArray.filter((item) => item.id !== commentId);
      });

      queryClient.invalidateQueries({
        queryKey: ["comments", cardId],
        exact: true,
      });
    },
    [cardId, data, queryClient]
  );

  useEffect(() => {
    if (!cardId) return;

    const channel = echoInstance.channel(`card.${cardId}`);
    channelRef.current = channel;

    channel.listen(".comment.created", handleAddComment);
    channel.listen(".comment.updated", handleUpdateComment);
    channel.listen(".comment.deleted", handleDeleteComment);

    return () => {
      if (channelRef.current) {
        channelRef.current.stopListening(".comment.created");
        channelRef.current.stopListening(".comment.updated");
        channelRef.current.stopListening(".comment.deleted");
        echoInstance.leaveChannel(`card.${cardId}`);
      }
    };
  }, [cardId, handleAddComment, handleUpdateComment, handleDeleteComment]);

  return {
    data,
    isLoading,
    isError,
    refetch,
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, data }) => copyCard({ cardId, data }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
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
  return useMutation({
    mutationFn: ({ cardId, data }) => postCheckLists({ cardId, data }),
    onSuccess: (data) => {
      console.log("✅ Checklist đã được tạo thành công", data);
    },
    onError: (error) => {
      console.error("❌ Lỗi khi tạo checklist:", error);
    },
  });
};
// thêm mới item
export const usePostChecklistItem = () => {
  return useMutation({
    mutationFn: ({ checklistId, data }) =>
      postChecklistItem({ checklistId, data }),
    onError: (error) => {
      console.error("❌ Lỗi khi tạo checklist item:", error);
    },
  });
};
// Thêm mới file -------------------------------------
export const usePostAttachmentFile = () => {
  return useMutation({
    mutationFn: ({ cardId, file }) => postAttachmentFile({ cardId, file }),
    onError: (error) => {
      console.error("❌ Lỗi khi tải lên file:", error);
    },
  });
};
// thêm mới link -------------------------------------
export const usePostAttachmentLink = () => {
  return useMutation({
    mutationFn: ({ cardId, link }) => postAttachmentLink({ cardId, link }),
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
  const mutation = useMutation({
    mutationFn: (data) => updateCheckListItem(checklistItemId, data),
    onError: (error) => {
      console.error("Lỗi khi cập nhật mục checklist:", error);
    },
  });

  return {
    updateName: (name) => mutation.mutate({ name }),
    updateStatus: (is_completed) => mutation.mutate({ is_completed }),
    updateStartDate: (start_date) => mutation.mutate({ start_date }),
    // updateEndDate: (end_date) => mutation.mutate({ end_date }),
    // updateEndTime: (end_time) => mutation.mutate({ end_time }),
    // updateReminder: (reminder) => mutation.mutate({ reminder }),
    updateDueInfo: ({ end_date, end_time, reminder }) =>
      mutation.mutate({ end_date, end_time, reminder }),

    updateAssignee: (assignee) => mutation.mutate({ assignee }),
    isUpdating: mutation.isLoading,
  };
};
// Card
export const useUpdateCardById = (cardId, boardId) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => updateCardById(cardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["card", cardId] });
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
export const usePutAttachment = (cardId) => {
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

export const useCreateCard = (boardId) => {
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

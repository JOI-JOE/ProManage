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
  fetchCheckLists,
  postCheckLists,
  postChecklistItem,
  updateCheckListItem,
  removeCheckListFromCard,
  removeCheckListItem,
  postAttachmentFile,
  postAttachmentLink,
  fetchAttachments,
} from "../api/models/cardsApi";
import { useEffect } from "react";
import { toast } from "react-toastify";
import echoInstance from "./realtime/useRealtime";

// GET FUNCTION ------------------------------------------------------
export const useCardById = (cardId) => {
  return useQuery({
    queryKey: ["card", cardId],
    queryFn: () => fetchCardById(cardId),
    staleTime: 1000 * 60 * 5, // 5 phút
    cacheTime: 1000 * 60 * 30, // 30 phút
    enabled: !!cardId,
  });
};
// Checklist card
export const useChecklist = (cardId) => {
  return useQuery({
    queryKey: ["checklist", cardId],
    queryFn: () => fetchCheckLists(cardId),
    enabled: Boolean(cardId),
    staleTime: 1000 * 60 * 5, // 5 phút, tránh gọi lại nếu chưa cần thiết
  });
};
// Attachment card
export const useFetchAttachments = (cardId) => {
  return useQuery({
    queryKey: ["attachments", cardId],
    queryFn: () => fetchAttachments(cardId),
    enabled: Boolean(cardId),
    staleTime: 1000 * 60 * 5, // 5 phút, tránh gọi lại nếu chưa cần thiết
  });
};
// POST FUNCTION ------------------------------------------------------
// thêm mới list
export const usePostCheckList = () => {
  return useMutation({
    mutationFn: ({ cardId, data }) => postCheckLists({ cardId, data }),
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
// Thêm mới attachment
export const usePostAttachmentFile = () => {
  return useMutation({
    mutationFn: ({ cardId, file }) => postAttachmentFile({ cardId, file }),
    onError: (error) => {
      console.error("❌ Lỗi khi tải lên file:", error);
    },
  });
};
// Hook for adding links
export const usePostAttachmentLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, linkData }) =>
      postAttachmentLink({ cardId, linkData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["card", cardId] });
    },
    onError: (error) => {
      console.error("❌ Lỗi khi thêm link:", error);
    },
  });
};
// PUT FUNCTION ------------------------------------------------------
// Item
export const useUpdateCheckListItem = (checklistItemId) => {
  const mutation = useMutation({
    mutationFn: (data) => updateCheckListItem(checklistItemId, data),
    onSuccess: () => {
      // Optionally invalidate checklist data
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
  // Mutation riêng cho title
  const titleMutation = useMutation({
    mutationFn: (data) => updateCardById(cardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["card", cardId] });
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật tiêu đề:", error);
    },
  });

  // Mutation riêng cho description
  const descriptionMutation = useMutation({
    mutationFn: (data) => updateCardById(cardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["card", cardId] });
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật mô tả:", error);
    },
  });

  return {
    updateTitle: (title) => titleMutation.mutate({ title }),
    updateDescription: (description) =>
      descriptionMutation.mutate({ description }),

    isUpdatingTitle: titleMutation.isLoading,
    isUpdatingDescription: descriptionMutation.isLoading,
  };
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
// DELETE FUNCTION -----------------------------------------------------
export const useRemoveChecklistFromCard = () => {
  return useMutation({
    mutationFn: (checklistId) => removeCheckListFromCard(checklistId),
    onError: (error) => {
      console.error("Failed to remove checklist:", error);
    },
  });
};
export const useRemoveCheckListItem = () => {
  const mutation = useMutation({
    mutationFn: (checklistItemId) => removeCheckListItem(checklistItemId),
    onError: (error) => {
      console.error("❌ Failed to remove checklist item:", error);
    },
  });

  return {
    removeItem: mutation.mutate, // 👈 Đây mới là thứ bạn dùng trong component
    ...mutation,
  };
};
// ------------------------------------------------------

// export const useCardById = (cardId) => {
//   const queryClient = useQueryClient();

//   const cardDetail = useQuery({
//     queryKey: ["card", cardId],
//     queryFn: () => fetchCardById(cardId),

//     staleTime: 1000 * 60 * 5, // 5 phút.
//     cacheTime: 1000 * 60 * 30, // 30 phút.
//     enabled: !!cardId,
//     onSuccess: () => {
//       queryClient.invalidateQueries(["card"]);
//     },
//   });

//   useEffect(() => {
//     if (!cardId || !echoInstance) return;

//     const channel = echoInstance.channel(`card.${cardId}`);
//     // console.log(`📡 Đang lắng nghe kênh: card.${cardId}`);

//     channel.listen(".card.updated", (event) => {
//       if (event?.card?.id === cardId) {
//         queryClient.setQueryData(["cards", cardId], (oldData) => {
//           if (!oldData) return oldData;

//           // console.log("🔄 Cập nhật dữ liệu card:", { ...oldData, title: event.card.title });

//           return { ...oldData, title: event.card.title };
//         });
//       }
//     });

//     channel.listen(".card.description.updated", (event) => {
//       if (event?.card?.id === cardId) {
//         queryClient.setQueryData(["cards", cardId], (oldData) => {
//           if (!oldData) return oldData;
//           console.log("🔄 Cập nhật mô tả card:", event.card.description);
//           return { ...oldData, description: event.card.description };
//         });
//       }
//     });

//     return () => {
//       channel.stopListening(".card.updated");
//       channel.stopListening(".card.description.updated");
//       echoInstance.leave(`card.${cardId}`);
//     };
//   }, [cardId, queryClient]);

//   const updateDescriptionMutation = useMutation({
//     mutationFn: (description) => updateDescription(cardId, description), // Gọi API cập nhật mô tả
//     onSuccess: (data, { cardId }) => {
//       console.log("Mô tả đã được cập nhật:", data);

//       queryClient.invalidateQueries({
//         queryKey: ["cardDetail", cardId],
//         exact: true,
//       });
//       queryClient.invalidateQueries({ queryKey: ["lists"] });
//     },
//     onError: (error) => {
//       console.error("Lỗi khi cập nhật mô tả:", error);
//     },
//   });

//   const memoizedReturnValue = useMemo(
//     () => ({
//       ...cardDetail,
//       updateDescriptionCard: updateDescriptionMutation.mutate,
//     }),
//     [cardDetail, updateDescriptionMutation.mutate]
//   );

//   return memoizedReturnValue;
// };

export const useCreateCard = () => {
  return useMutation({
    mutationFn: createCard,
    onError: (error) => {
      console.error("❌ Lỗi khi tạo thẻ:", error);
    },
  });
};

export const useUpdateCardPosition = () => {
  return useMutation({
    mutationFn: async ({ cardId, listId, position }) => {
      return await updatePositionCard({ cardId, listId, position });
    },
    retry: 3,
    retryDelay: 1000, // Thử lại sau 1 giây nếu lỗi
  });
};

export const useUpdateCardTitle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, title }) => updateCardTitle(cardId, title),
    onSuccess: (data, variables) => {
      // Cập nhật dữ liệu card trong cache sau khi update thành công
      queryClient.invalidateQueries({ queryKey: ["cards", variables.cardId] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật tên card:", error);
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
    // console.log(`📡 Đang lắng nghe kênh: card.${cardId}`);

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

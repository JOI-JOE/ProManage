import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCard,
  getCardById,
  getCardByListId,
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
  addMemberToCard,
  removeMember,
  toggleIsCompleted,
  copyCard,
  moveCard,
  removeDates,
  getCardsByUserBoards,
} from "../api/models/cardsApi";
import { useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import echoInstance from "./realtime/useRealtime";

export const useCreateCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCard,
    onError: (error) => {
      console.error("❌ Lỗi khi tạo thẻ:", error);
    },
  });
};

export const useUpdateCardPosition = () => {
  const queryClient = useQueryClient(); // Khởi tạo queryClient

  return useMutation({
    mutationFn: async ({ cardId, listId, position }) => {
      return await updatePositionCard({ cardId, listId, position });
    },
    retry: 3,
    retryDelay: 1000, // Thử lại sau 1 giây nếu lỗi
  });
};
export const useCardByListId = (listId) => {
  const queryClient = useQueryClient();
  const cardByList = useQuery({
    queryKey: ["cards", listId],
    queryFn: () => getCardByListId(listId),
    enabled: !!listId, // chỉ gọi khi có itemId
    staleTime: 1000 * 60 * 5, // 5 phút.
    cacheTime: 1000 * 60 * 30, // 30 phút.
    
  });

  return cardByList;
}

export const useCardById = (cardId) => {
  const queryClient = useQueryClient();

  const cardDetail = useQuery({
    queryKey: ["cards", cardId],
    queryFn: () => getCardById(cardId),

    staleTime: 1000 * 60 * 5, // 5 phút.
    cacheTime: 1000 * 60 * 30, // 30 phút.
    enabled: !!cardId,
    onSuccess: () => {
      queryClient.invalidateQueries(["cards"]);
    },
  });

  useEffect(() => {
    if (!cardId || !echoInstance) return;

    const channel = echoInstance.channel(`card.${cardId}`);
    // console.log(`📡 Đang lắng nghe kênh: card.${cardId}`);

    channel.listen(".card.updated", (event) => {


      if (event?.card?.id === cardId) {
        queryClient.setQueryData(["cards", cardId], (oldData) => {
          if (!oldData) return oldData;

          // console.log("🔄 Cập nhật dữ liệu card:", { ...oldData, title: event.card.title });

          return { ...oldData, title: event.card.title };
        });
      }
    });

    channel.listen(".card.description.updated", (event) => {


      if (event?.card?.id === cardId) {
        queryClient.setQueryData(["cards", cardId], (oldData) => {
          if (!oldData) return oldData;
          console.log("🔄 Cập nhật mô tả card:", event.card.description);
          return { ...oldData, description: event.card.description };
        });
      }
    });


    channel.listen(".card.toggled", (event) => {
      // console.log("📡 Card Completion Toggled Event:", event);

      // queryClient.setQueryData(["cards", event.card.id], (oldCard) => {
      //   if (!oldCard) return null;
      //   return { ...oldCard, is_completed: event.card.is_completed };
      // });
      queryClient.invalidateQueries({ queryKey: ["cards", cardId], exact: true });


      // queryClient.invalidateQueries({ queryKey: ["lists"] });
    });

   

    


    return () => {
      channel.stopListening(".card.updated");
      channel.stopListening(".card.description.updated");
      channel.stopListening(".card.toggled");

      echoInstance.leave(`card.${cardId}`);
    };
  }, [cardId, queryClient]);

  const updateDescriptionMutation = useMutation({
    mutationFn: (description) => updateDescription(cardId, description), // Gọi API cập nhật mô tả
    onSuccess: (data, { cardId }) => {
      // console.log("Mô tả đã được cập nhật:", data);

      queryClient.invalidateQueries({ queryKey: ["cardDetail", cardId], exact: true });
      // queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật mô tả:", error);
    },
  });

  const memoizedReturnValue = useMemo(
    () => ({
      ...cardDetail,
      updateDescriptionCard: updateDescriptionMutation.mutate,
    }),
    [cardDetail, updateDescriptionMutation.mutate]
  );

  return memoizedReturnValue;
};

export const useUpdateCardTitle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, title }) => updateCardTitle(cardId, title),
    onSuccess: (data, variables) => {
      // Cập nhật dữ liệu card trong cache sau khi update thành công
      queryClient.invalidateQueries({ queryKey: ["cards", variables.cardId] });
      // queryClient.invalidateQueries({ queryKey: ["lists"] });
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
      console.log('Realtime archive changed: ', data);


      queryClient.invalidateQueries({ queryKey: ["cardsArchivedByBoard", boardId], exact: true });
      queryClient.invalidateQueries({ queryKey: ["lists"] });

    });
    channel.listen(".CardDelete", (data) => {
      console.log('Realtime archive changed: ', data);
      // cardsArchivedByBoard", boardId
      // queryClient.invalidateQueries(["lists"]);
      queryClient.invalidateQueries({ queryKey: ["cardsArchivedByBoard", boardId], exact: true });

    });

    channel.listen(".card.copied", (event) => {
      // console.log('Realtime copy: ', event.card.id);
      // cardsArchivedByBoard", boardId
      // queryClient.invalidateQueries(["lists"]);
      queryClient.invalidateQueries({ queryKey: ["cards",  event.card.id] });

      queryClient.invalidateQueries({ queryKey: ["lists"] });
      // queryClient.invalidateQueries({ queryKey: ["cardsArchivedByBoard", boardId], exact: true });

    });

    channel.listen(".card.moved", (event) => {
      console.log("Card moved realtime: ", event);
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.invalidateQueries({ queryKey: ["membersInCard", event.card.id] });

    });

    return () => {
      channel.stopListening(".CardArchiveToggled");
      channel.stopListening(".CardDelete");
      channel.stopListening(".card.copied");
      channel.stopListening(".card.moved");
      echoInstance.leave(`boards.${boardId}`);
    };
  }, [boardId, queryClient]);



  // Mutation lưu trữ card
  const archiveCard = useMutation({
    mutationFn: updateArchivedCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardsArchivedByBoard"] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      // toast.success("Đổi trạng thái thẻ thành công!");
    },
    onError: (error) => {
      toast.error(`Lỗi lưu trữ: ${error.message}`);
    },
  });

  // Mutation xóa card
  const deleteCardMutation = useMutation({
    mutationFn: deleteCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardsArchivedByBoard"] });
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
        queryClient.invalidateQueries({ queryKey: ["card", cardId], exact: true });
        queryClient.invalidateQueries({ queryKey: ["membersInCard", cardId] });
        queryClient.invalidateQueries({ queryKey: ["activities"] });


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
      queryClient.invalidateQueries({ queryKey: ["card", cardId], exact: true });
      queryClient.invalidateQueries({ queryKey: ["membersInCard", cardId] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });

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
      queryClient.invalidateQueries({ queryKey: ["cardSchedule", variables.targetId], exact: true });
      queryClient.invalidateQueries({ queryKey: ["activities"] });

    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật ngày card:", error);
    },
  });
};

export const useToggleCardCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleIsCompleted,
    onSuccess: (_, cardId) => {
      // Cập nhật dữ liệu sau khi toggle thành công
      // console.log(cardId);
      queryClient.invalidateQueries({ queryKey: ["cards", cardId], exact: true });
      // queryClient.invalidateQueries({ queryKey: ["cards", cardId] });

      // queryClient.invalidateQueries({ queryKey: ["lists"] }); // Cập nhật danh sách

      // toast.success("Cập nhật trạng thái hoàn thành thẻ thành công!");
    },
    onError: (error) => {
      toast.error(`Lỗi cập nhật trạng thái: ${error.message}`);
    },
  });
};

export const useCopyCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: copyCard,
    onSuccess: (res) => {
      console.log("✅ Move card response:", res);
      const newCard = res.data.card;

      // Xoá cache cũ để fetch lại nếu cần
      queryClient.invalidateQueries({ queryKey: ["cards", newCard.id] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });

      // toast.success("Sao chép thẻ thành công!");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Lỗi sao chép thẻ: ${errorMessage}`);
    },
  });
};

export const useMoveCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveCard,
    onSuccess: (res) => {
      const { card, old_list_id, new_list_id } = res.data;
      
      // Invalidate các cache liên quan
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.invalidateQueries({ queryKey: ["membersInCard", card.id] });
      //  queryClient.invalidateQueries({ queryKey: ["["membersInCard", card.id]", new_list_id] });

    

      // toast.success("Di chuyển thẻ thành công!");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Lỗi di chuyển thẻ: ${errorMessage}`);
    },
  });
};

export const useDeleteCardDate = () => {

  const queryClient = useQueryClient();

  return useMutation({
    
      mutationFn: ({ targetId }) => removeDates(targetId),
      
      onSuccess: (_, variables) => {
          
        queryClient.invalidateQueries({ queryKey: ["cardSchedule", variables.targetId], exact: true });
          
      },
      onError: (error) => {
          console.error("❌ Lỗi khi xóa nhãn:", error.response?.data || error.message);
      },
  });
};
export const useUserBoardCards = (userId) => {
  return useQuery({
    queryKey: ["userBoardCards", userId],
    queryFn: () => getCardsByUserBoards(userId),
    enabled: !!userId, // chỉ gọi khi userId có giá trị
  });
};
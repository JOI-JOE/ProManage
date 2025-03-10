import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


import {
  createCard,
  getCardByList,
  updateCardPositionsDiffCol,
  updateCardPositionsSameCol,
  getCardById,
  updateDescription,
  updateCardTitle,

  updateArchivedCard,
  deleteCard,
  getCardArchivedByBoard,
  // deleteCard,
} from "../api/models/cardsApi";
import { useEffect, useMemo } from "react";
import { createEchoInstance } from "./useRealtime";
import { toast } from "react-toastify";

const CARDS_CACHE_KEY = "cards";

export const useCardByList = (listId) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!listId) return;

    const echo = createEchoInstance();
    if (!echo) return;

    const channel = echo.channel(`list.${listId}`);

    // Xử lý thêm card mới
    channel.listen(".card.added", (e) => {
      queryClient.setQueryData([CARDS_CACHE_KEY, listId], (oldData = []) => {
        if (oldData.some((card) => card.id === e.card.id)) return oldData;
        return [...oldData, e.card].sort((a, b) => a.position - b.position);
      });
    });

    // Xử lý xóa card
    channel.listen(".card.removed", (e) => {
      queryClient.setQueryData([CARDS_CACHE_KEY, listId], (oldData) => {
        if (!oldData) return oldData;
        return oldData.filter((card) => card.id !== e.cardId);
      });
    });

    return () => {
      channel.stopListening(".card.position.updated");
      channel.stopListening(".card.added");
      channel.stopListening(".card.removed");
      echo.leave(`list.${listId}`);
    };
  }, [listId, queryClient]);

  // Query với cấu hình tối ưu cho realtime
  return useQuery({
    queryKey: [CARDS_CACHE_KEY, listId],
    queryFn: () => getCardByList(listId),
    staleTime: Infinity,
    cacheTime: Infinity,
    enabled: !!listId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
export const useCreateCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newCard) => createCard(newCard),
    onMutate: async (variables) => {
      const { list_board_id } = variables;
      const queryKey = ["cards", list_board_id];
      await queryClient.cancelQueries(queryKey);

      const temporaryId = Date.now();
      const optimisticCard = {
        id: temporaryId,
        ...variables,
      };

      queryClient.setQueryData(queryKey, (oldCards = []) => [
        ...oldCards,
        optimisticCard,
      ]);

      return { queryKey, temporaryId };
    },
    onSuccess: (newCard, variables, context) => {
      if (context?.queryKey) {
        queryClient.setQueryData(context.queryKey, (oldCards = []) =>
          oldCards.map((card) =>
            card.id === context.temporaryId ? newCard : card
          )
        );
      }
    },
    onError: (error, variables, context) => {
      console.error("❌ Lỗi khi tạo thẻ:", error);
      if (context?.queryKey) {
        queryClient.setQueryData(context.queryKey, (oldCards = []) =>
          oldCards.filter((card) => card.id !== context.temporaryId)
        );
      }
    },
  });
};

const updateCardPositionsGeneric = async (cards, updateFunction) => {
  if (!Array.isArray(cards) || cards.length === 0) {
    console.error("Invalid or empty cards data:", cards);
    throw new Error("No valid card data to update.");
  }

  try {
    return await updateFunction({ cards });
  } catch (error) {
    console.error("Failed to update card positions:", error);
    throw error;
  }
};

export const useCardPositionsInColumns = (cards) =>
  updateCardPositionsGeneric(cards, updateCardPositionsSameCol);

export const useCardPositionsOutColumns = (cards) =>
  updateCardPositionsGeneric(cards, updateCardPositionsDiffCol);
export const useCardById = (cardId) => {
  const queryClient = useQueryClient();

  const cardDetail = useQuery({
    queryKey: ["cards", cardId],
    queryFn: () => getCardById(cardId),

    staleTime: 1000 * 60 * 5, // 5 phút.
    cacheTime: 1000 * 60 * 30, // 30 phút.
    enabled: !!cardId,
    onSuccess: () => {
      queryClient.invalidateQueries(['cards']);
    }
  });

  const updateDescriptionMutation = useMutation({
    mutationFn: (description) => updateDescription(cardId, description), // Gọi API cập nhật mô tả
    onSuccess: (data) => {
      console.log("Mô tả đã được cập nhật:", data);
      //   setIsEditingDescription(false);
      // Invalidates danh sách card của listId để refetch dữ liệu
      //   setDescription(data.cardDetail.description); // Cập nhật state local

      queryClient.invalidateQueries(["cardDetail", cardId]);
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
}

export const useUpdateCardTitle = () => {
  const queryClient = useQueryClient();

  return useMutation({
      mutationFn: ({ cardId, title }) => updateCardTitle(cardId, title),
      onSuccess: (data, variables) => {
          // Cập nhật dữ liệu card trong cache sau khi update thành công
          queryClient.invalidateQueries(["cards", variables.cardId]);
      },
      onError: (error) => {
          console.error("Lỗi khi cập nhật tên card:", error);
      },
  });
};

export const useCardActions = (boardId) => {
  const queryClient = useQueryClient();

  // Lấy danh sách card đã lưu trữ theo board
  const { data: cards, isLoading, error } = useQuery({
    queryKey: ["cardsArchivedByBoard", boardId],
    queryFn: () => getCardArchivedByBoard(boardId),
    enabled: !!boardId, // Chỉ fetch khi có boardId
  });

  // Mutation lưu trữ card
  const archiveCard = useMutation({
    mutationFn: updateArchivedCard,
    onSuccess: () => {
      queryClient.invalidateQueries(["cardsArchivedByBoard"]);
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



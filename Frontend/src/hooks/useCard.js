import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


import {
  createCard,
  getCardByList,
  updateCardPositionsDiffCol,
  updateCardPositionsSameCol,
  
} from "../api/models/cardsApi";
import { useEffect } from "react";
import { createEchoInstance } from "./useRealtime";

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

// console.log(useColors());

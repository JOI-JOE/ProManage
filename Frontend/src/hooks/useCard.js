import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCard,
  getCardByList,
  updateCardPositionsDiffCol,
  updateCardPositionsSameCol,
  getCardById,
  updateDescription,
  updateCardTitle,
} from "../api/models/cardsApi";
import { useEffect, useMemo } from "react";

const CARDS_CACHE_KEY = "cards";

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
      queryClient.invalidateQueries(["cards"]);
    },
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
};

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

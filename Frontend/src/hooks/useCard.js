import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCard,
  updateCardPositionsDiffCol,
  updateCardPositionsSameCol,
  getCardById,
  updateDescription,
  updateCardTitle,
  updateArchivedCard,
  deleteCard,
  getCardArchivedByBoard,
} from "../api/models/cardsApi";
import { useMemo } from "react";
import { toast } from "react-toastify";

export const useCreateCard = () => {
  return useMutation({
    mutationFn: createCard,
    onError: (error) => {
      console.error("❌ Lỗi khi tạo thẻ:", error);
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

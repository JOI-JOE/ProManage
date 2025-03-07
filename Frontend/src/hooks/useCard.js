import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCard,
  getCardByList,
  updateCardPositionsDiffCol,
  updateCardPositionsSameCol,
  getCardById,
  updateDescription,
  updateCardTitle
} from "../api/models/cardsApi";
import { useEffect, useMemo } from "react";
import { createEchoInstance } from "./useRealtime";



export const useCardByList = (listId) => {
    const queryClient = useQueryClient();
    return useQuery({
        queryKey: ["cards", listId], // Thêm listId vào key để cache riêng từng danh sách.
        queryFn: () => getCardByList(listId), // Truyền listId vào API call.
        
        staleTime: 1000 * 60 * 5, // 5 phút.
        cacheTime: 1000 * 60 * 30, // 30 phút.
        enabled: !!listId, // Chỉ gọi API nếu listId có giá trị.
        onSuccess: () => {
            queryClient.invalidateQueries(['cards']);
        }
    }); 
};


export const useCreateCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCard,
    onSuccess: () => {
      // Invalidate cache để làm mới danh sách workspaces
      queryClient.invalidateQueries(["cards"]);
    },
    onError: (error) => {
      console.error("Lỗi khi tạo card:", error);
    },
  });
};

export const useUpdateCardPositions = () => { 
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, oldListId, newListId, newPosition }) => 
      updateCardPositions({ cardId, newListId, newPosition }),

    onMutate: async ({ cardId, oldListId, newListId, newPosition }) => {
      // Hủy các query hiện tại để tránh ghi đè dữ liệu không cần thiết
      await queryClient.cancelQueries(["cards", oldListId]);
      await queryClient.cancelQueries(["cards", newListId]);

      // Lưu lại danh sách card trước khi cập nhật (tránh mất dữ liệu nếu có lỗi)
      const previousOldListCards = queryClient.getQueryData(["cards", oldListId]);
      const previousNewListCards = queryClient.getQueryData(["cards", newListId]);

      // Cập nhật danh sách cũ: Loại bỏ card đã bị di chuyển
      queryClient.setQueryData(["cards", oldListId], (oldCards) => {
        if (!oldCards) return [];
        return oldCards.filter((card) => card.id !== cardId);
      });

      // Cập nhật danh sách mới: Thêm card vào vị trí mới và sắp xếp lại
      queryClient.setQueryData(["cards", newListId], (oldCards) => {
        if (!oldCards) return [];
        return [...oldCards, { id: cardId, list_id: newListId, position: newPosition }]
          .sort((a, b) => a.position - b.position);
      });

      return { previousOldListCards, previousNewListCards };
    },

 onError: (error, variables, context) => {
  console.error("❌ Lỗi khi di chuyển card:", error);

  if (context?.previousOldListCards && variables?.oldListId) {
    queryClient.setQueryData(["cards", variables.oldListId], context.previousOldListCards);
  }

  if (context?.previousNewListCards && variables?.newListId) {
    queryClient.setQueryData(["cards", variables.newListId], context.previousNewListCards);
  }
},

    onSettled: (_, __, { oldListId, newListId }) => {
      queryClient.invalidateQueries(["cards", oldListId]);
      queryClient.invalidateQueries(["cards", newListId]);
    },
  });
};



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


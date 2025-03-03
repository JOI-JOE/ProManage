import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCard,
  getCardByList,
  updateCardPosition,
} from "../api/models/cardsApi";
import { useEffect } from "react";
import { createEchoInstance } from "./useRealtime";

export const useCardByList = (listId) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!listId) return;

    const echo = createEchoInstance();
    if (!echo) return;

    const channel = echo.channel(`list.${listId}`);

    // Xử lý cập nhật vị trí card

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
    mutationFn: createCard,
    onMutate: async (variables) => {
      await queryClient.cancelQueries(["cards", variables.list_id]);

      const previousCards = queryClient.getQueryData([
        "cards",
        variables.list_id,
      ]);

      // Optimistic update
      queryClient.setQueryData(
        ["cards", variables.list_id],
        (oldCards = []) => {
          const optimisticCard = {
            id: Date.now(), // Temporary ID
            ...variables,
            position: oldCards.length + 1,
          };
          return [...oldCards, optimisticCard].sort(
            (a, b) => a.position - b.position
          );
        }
      );

      return { previousCards };
    },
    onError: (err, variables, context) => {
      if (context?.previousCards) {
        queryClient.setQueryData(
          ["cards", variables.list_id],
          context.previousCards
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Không cần invalidate vì đã có realtime
    },
  });
};

// Tối ưu hàm tính position
const calculateNewPosition = (cards, index) => {
  if (!cards || cards.length === 0) return 65535; // Nếu không có card nào, đặt vị trí đầu tiên
  if (index === 0) return Math.floor(cards[0].position / 2);
  if (index >= cards.length) return cards[cards.length - 1].position + 65535;
  return Math.floor((cards[index - 1].position + cards[index].position) / 2);
};

export const useUpdateCardPosition = () => {
  const mutation = useMutation({
    mutationFn: updateCardPosition,
    onSuccess: (data) => {
      console.log("✅ Card position updated:", data);
    },
    onError: (error) => {
      console.error("❌ Failed to update card position:", error);
    },
  });

  return mutation;
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCard, getCardByList, updateCardPositions } from "../api/models/cardsApi";


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






// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { getCardByList, updateCardPositions } from "../api/models/cardsApi";

// export const useCardByList = (listId) => {
//   const queryClient = useQueryClient();

//   // Lấy danh sách card của list
//   const { data: cards, isLoading, error } = useQuery({
//     queryKey: ["cards", listId],
//     queryFn: () => getCardByList(listId),
//     staleTime: 1000 * 60 * 5, // 5 phút
//     cacheTime: 1000 * 60 * 30, // 30 phút
//   });

//   // Hàm cập nhật vị trí của card khi kéo thả
//   const { mutateAsync: moveCard } = useMutation({
//     mutationFn: ({ cardId, newListId, newPosition }) =>
//       updateCardPositions({ cardId, newListId, newPosition }),
//     onMutate: async ({ cardId, newListId, newPosition }) => {
//       await queryClient.cancelQueries(["cards", listId]);

//       const previousCards = queryClient.getQueryData(["cards", listId]);

//       // Cập nhật danh sách card ngay lập tức (Optimistic Update)
//       queryClient.setQueryData(["cards", listId], (oldCards) => {
//         if (!oldCards) return [];

//         return oldCards.map((card) =>
//           card.id === cardId
//             ? { ...card, list_id: newListId, position: newPosition }
//             : card
//         ).sort((a, b) => a.position - b.position);
//       });

//       return { previousCards };
//     },
//     onError: (err, variables, context) => {
//       console.error("❌ Lỗi khi di chuyển card:", err);
//       if (context?.previousCards) {
//         queryClient.setQueryData(["cards", listId], context.previousCards);
//       }
//     },
//     onSettled: () => {
//       queryClient.invalidateQueries(["cards", listId]);
//     },
//   });

//   return { cards, isLoading, error, moveCard };
// };

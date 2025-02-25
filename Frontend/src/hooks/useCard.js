import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCardByList } from "../api/models/cardsApi";


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

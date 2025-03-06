import Echo from "laravel-echo";
import Pusher from "pusher-js";

export const createEchoInstance = () => {
  const PUSHER_KEY = import.meta.env.VITE_PUSHER_APP_KEY;
  const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_APP_CLUSTER;
  const PUSHER_SCHEME = import.meta.env.VITE_PUSHER_SCHEME || "https";
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  if (!PUSHER_KEY || !PUSHER_CLUSTER) {
    console.error("❌ Thiếu cấu hình Pusher trong .env");
    return null;
  }

  window.Pusher = Pusher;
  return new Echo({
    broadcaster: "pusher",
    key: PUSHER_KEY,
    cluster: PUSHER_CLUSTER,
    forceTLS: PUSHER_SCHEME === "https",
    wsHost: `ws-${PUSHER_CLUSTER}.pusher.com`,
    wsPort: 80,
    wssPort: 443,
    disableStats: true,
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${BACKEND_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  });
};

// export const useCardRealtime = (listId) => {
//   const queryClient = useQueryClient();

//   useEffect(() => {
//     if (!listId) return;

//     const echo = createEchoInstance();
//     if (!echo) return;

//     const channel = echo.channel(`list.${listId}`);

//     channel.listen(".card.position.updated", (e) => {
//       queryClient.setQueryData(["cards", listId], (oldData) => {
//         if (!oldData) return oldData;

//         const allCardsMovedToOtherList = e.updatedCards.every(
//           (card) => card.list_board_id !== listId
//         );

//         if (allCardsMovedToOtherList) {
//           return oldData.filter(
//             (card) =>
//               !e.updatedCards.some((updatedCard) => updatedCard.id === card.id)
//           );
//         }

//         const updatedCards = oldData.map((card) => {
//           const updatedCard = e.updatedCards.find((u) => u.id === card.id);
//           if (updatedCard && updatedCard.list_board_id === listId) {
//             return { ...card, ...updatedCard };
//           }
//           return card;
//         });

//         const newCards = e.updatedCards.filter(
//           (updatedCard) =>
//             updatedCard.list_board_id === listId &&
//             !oldData.some((card) => card.id === updatedCard.id)
//         );

//         return [...updatedCards, ...newCards].sort(
//           (a, b) => a.position - b.position
//         );
//       });

//       if (e.targetListId && e.targetListId !== listId) {
//         queryClient.setQueryData(["cards", e.targetListId], (oldData = []) => {
//           const existingCards = oldData || [];

//           const cardsForTargetList = e.updatedCards.filter(
//             (card) => card.list_board_id === e.targetListId
//           );

//           const uniqueExistingCards = existingCards.filter(
//             (card) =>
//               !cardsForTargetList.some((newCard) => newCard.id === card.id)
//           );

//           return [...uniqueExistingCards, ...cardsForTargetList].sort(
//             (a, b) => a.position - b.position
//           );
//         });
//       }
//     });

//     channel.listen(".card.added", (e) => {
//       queryClient.setQueryData(["cards", listId], (oldData = []) => {
//         const existingCards = oldData || [];
//         if (!existingCards.some((card) => card.id === e.card.id)) {
//           return [...existingCards, e.card].sort(
//             (a, b) => a.position - b.position
//           );
//         }
//         return existingCards;
//       });
//     });

//     channel.listen(".card.removed", (e) => {
//       queryClient.setQueryData(["cards", listId], (oldData) => {
//         if (!oldData) return oldData;
//         return oldData.filter((card) => card.id !== e.cardId);
//       });
//     });

//     return () => {
//       echo.leave(`list.${listId}`);
//     };
//   }, [listId, queryClient]);
// };

// export const useMultipleCardsRealtime = (lists = []) => {
//   const queryClient = useQueryClient();

//   useEffect(() => {
//     if (!lists?.length) return;

//     const echo = createEchoInstance();
//     if (!echo) return;

//     const channels = lists.map((list) => {
//       const channel = echo.channel(`list.${list.id}`);

//       channel.listen(".card.position.updated", (e) => {
//         lists.forEach((currentList) => {
//           queryClient.setQueryData(["cards", currentList.id], (oldData) => {
//             if (!oldData) return oldData;

//             const allCardsMovedToOtherList = e.updatedCards.every(
//               (card) => card.list_board_id !== currentList.id
//             );

//             if (allCardsMovedToOtherList) {
//               return oldData.filter(
//                 (card) =>
//                   !e.updatedCards.some(
//                     (updatedCard) => updatedCard.id === card.id
//                   )
//               );
//             }

//             const updatedCards = oldData.map((card) => {
//               const updatedCard = e.updatedCards.find((u) => u.id === card.id);
//               if (updatedCard && updatedCard.list_board_id === currentList.id) {
//                 return { ...card, ...updatedCard };
//               }
//               return card;
//             });

//             const newCards = e.updatedCards.filter(
//               (updatedCard) =>
//                 updatedCard.list_board_id === currentList.id &&
//                 !oldData.some((card) => card.id === updatedCard.id)
//             );

//             return [...updatedCards, ...newCards].sort(
//               (a, b) => a.position - b.position
//             );
//           });
//         });
//       });

//       channel.listen(".card.added", (e) => {
//         queryClient.setQueryData(["cards", list.id], (oldData = []) => {
//           const existingCards = oldData || [];
//           if (!existingCards.some((card) => card.id === e.card.id)) {
//             return [...existingCards, e.card].sort(
//               (a, b) => a.position - b.position
//             );
//           }
//           return existingCards;
//         });
//       });

//       channel.listen(".card.removed", (e) => {
//         queryClient.setQueryData(["cards", list.id], (oldData) => {
//           if (!oldData) return oldData;
//           return oldData.filter((card) => card.id !== e.cardId);
//         });
//       });

//       return list.id;
//     });

//     return () => {
//       channels.forEach((listId) => {
//         echo.leave(`list.${listId}`);
//       });
//     };
//   }, [lists, queryClient]);
// };

// export const useColumnRealtime = (boardId) => {
//   const queryClient = useQueryClient();

//   useEffect(() => {
//     if (!boardId) return;

//     const echo = createEchoInstance();
//     if (!echo) return;

//     const channel = echo.channel(`board.${boardId}`);

//     channel.listen(".column.position.updated", (e) => {
//       queryClient.setQueryData(["lists", boardId], (oldData) => {
//         if (!oldData) return oldData;

//         const updatedLists = oldData.map((list) => {
//           const updatedColumn = e.updatedColumns.find(
//             (col) => col.id === list.id
//           );
//           if (updatedColumn) {
//             return {
//               ...list,
//               position: updatedColumn.position,
//             };
//           }
//           return list;
//         });

//         return updatedLists.sort((a, b) => a.position - b.position);
//       });
//     });

//     return () => {
//       echo.leave(`board.${boardId}`);
//     };
//   }, [boardId, queryClient]);
// };

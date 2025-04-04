import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  // getListDetail,
  // getListClosedByBoard,
  // deleteList,
  // updateClosed,
  createListAPI,
  updatePositionList,
  fetchListByBoardId,
  updateListName,
  updateListClosed,
} from "../api/models/listsApi";
import { useCallback, useEffect, useRef } from "react";
import echoInstance from "./realtime/useRealtime";

export const useListByBoardId = (boardId) => {
  const queryClient = useQueryClient();
  const channelRef = useRef(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["lists", boardId],
    queryFn: () => fetchListByBoardId(boardId),
    enabled: !!boardId,
    retry: 0,
    staleTime: 5 * 60 * 1000, // 5 phút
    cacheTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // --- Xử lý cập nhật list ---
  const handleListUpdate = useCallback(
    (updateEvent) => {
      if (!updateEvent?.id) return;
      queryClient.setQueryData(["lists", boardId], (oldData) => {
        if (!oldData?.lists) return oldData;
        console.log("Dữ liệu mới", updateEvent);
        console.log("Dữ liệu cũ", oldData);
        return {
          ...oldData,
          lists: oldData.lists.map((list) =>
            list.id === updateEvent.id ? { ...list, ...updateEvent } : list
          ),
        };
      });
    },
    [boardId, queryClient]
  );

  // --- Xử lý tạo list mới ---
  const handleListCreate = useCallback(
    (event) => {
      if (!event?.id) return;

      queryClient.setQueryData(["lists", boardId], (oldData) => {
        const oldLists = Array.isArray(oldData?.lists) ? oldData.lists : [];
        // Nếu list đã tồn tại, bỏ qua
        const exists = oldLists.some((list) => list.id === event.id);
        if (exists) return oldData;

        const updatedLists = [...oldLists, event];

        return {
          ...oldData,
          lists: updatedLists,
        };
      });
    },
    [boardId, queryClient]
  );

  useEffect(() => {
    if (!boardId) return;

    const channel = echoInstance.channel(`board.${boardId}`);
    channelRef.current = channel;

    channel.listen(".list.updated", handleListUpdate);
    channel.listen(".list.created", handleListCreate);

    return () => {
      if (channelRef.current) {
        channelRef.current.stopListening(".list.updated");
        channelRef.current.stopListening(".list.created");
        echoInstance.leaveChannel(`board.${boardId}`);
      }
    };
  }, [boardId, handleListUpdate, handleListCreate]);

  return {
    data,
    isLoading,
    isError,
    lists: data?.lists || [],
  };
};

export const useUpdatePositionList = () => {
  return useMutation({
    mutationFn: async ({ listId, position, boardId }) => {
      return await updatePositionList({ listId, position });
    },
    retry: 1,
    retryDelay: 1000,
  });
};

export const useCreateList = () => {
  const mutation = useMutation({
    mutationFn: createListAPI,
    onError: (error) => {
      console.error("Lỗi khi tạo danh sách:", error);
    },
  });

  return {
    createList: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
};

//------------------------------------------------------------------------------
/// Function update
export const useUpdateListName = () => {
  return useMutation({
    mutationFn: ({ listId, newName }) => updateListName(listId, newName),
    onError: (error) => {
      console.error("❌ Lỗi khi update list name:", error);
    },
  });
};

export const useUpdateListClosed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, closed }) => updateListClosed(listId, closed),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["lists", variables.boardId], {
        exact: true,
      });
    },
    onError: (error) => {
      console.error("❌ Lỗi khi cập nhật trạng thái đóng danh sách:", error);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["lists"]);
    },
  });
};

// Hook lấy danh sách list đã đóng (archived)
// export const useListsClosed = (boardId) => {
//   const queryClient = useQueryClient();
//   const {
//     data: listsClosed,
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["listClosed", boardId],
//     queryFn: () => getListClosedByBoard(boardId),
//     enabled: !!boardId,
//   });

//   // Mutation để xóa list
//   const deleteMutation = useMutation({
//     mutationFn: deleteList,
//     onMutate: async (id) => {
//       await queryClient.cancelQueries(["listClosed"]);
//       const previousLists = queryClient.getQueryData(["listClosed"]);

//       queryClient.setQueryData(["listClosed"], (oldLists) =>
//         oldLists?.data ? oldLists.data.filter((list) => list.id !== id) : []
//       );

//       return { previousLists };
//     },
//     onError: (error, _, context) => {
//       console.error("Xóa thất bại:", error);
//       queryClient.setQueryData(["listClosed"], context.previousLists);
//     },
//     onSettled: () => {
//       queryClient.invalidateQueries(["listClosed"]);
//     },
//   });

//   // Mutation để cập nhật trạng thái lưu trữ (bỏ lưu trữ)
//   const updateClosedMutation = useMutation({
//     mutationFn: (listId) => updateListClosed(listId),
//     onSuccess: (data, listId) => {
//       console.log(`🔄 Cập nhật trạng thái lưu trữ cho list ${listId}`);

//       // Cập nhật danh sách listClosed ngay lập tức mà không cần gọi API lại
//       queryClient.setQueryData(["listClosed"], (oldLists) =>
//         oldLists?.data
//           ? oldLists?.data.filter((list) => list.id !== listId)
//           : []
//       );

//       // Cập nhật danh sách list active (nếu có)
//       queryClient.invalidateQueries(["list", listId]);
//     },
//     onError: (error) => {
//       console.error("❌ Lỗi khi cập nhật trạng thái lưu trữ:", error);
//     },
//   });

//   return {
//     listsClosed,
//     isLoading,
//     error,
//     deleteMutation,
//     updateClosedMutation,
//   };
// };

// export const useLists = (boardId) => {
//   const queryClient = useQueryClient();
//   const navigate = useNavigate();
//   const [errorState, setErrorState] = useState(null);

//   const query = useQuery({
//     queryKey: ["lists", boardId],
//     queryFn: async () => {
//       const { data, error } = await getListByBoardId(boardId);

//       if (error) {
//         setErrorState(error);
//       }

//       return data;
//     },
//     enabled: !!boardId,
//     staleTime: 0,
//     cacheTime: 1000 * 60 * 30,
//   });

//   // Xử lý lỗi: nếu không có quyền hoặc không tìm thấy board
//   useEffect(() => {
//     if (errorState === "no_access" || errorState === "not_found") {
//       navigate("/404");
//     } else if (errorState === "unknown_error") {
//       console.error("Lỗi không xác định xảy ra!");
//     }
//   }, [errorState, navigate]);

//   useEffect(() => {
//     if (!boardId) return;

//     const channel = echoInstance.channel(`board.${boardId}`);

//     // 📡 Nhận event khi tạo mới list
//     channel.listen(".list.created", (data) => {
//       console.log("📡 Nhận event từ Pusher: list.created", data);

//       queryClient.setQueryData(["lists", boardId], (oldBoard) => {
//         if (!oldBoard) return { columns: [data.newList] };

//         const listsArray = Array.isArray(oldBoard.columns)
//           ? [...oldBoard.columns]
//           : [];

//         if (listsArray.some((list) => list.id === data.newList.id))
//           return oldBoard;

//         return { ...oldBoard, columns: [...listsArray, data.newList] };
//       });
//     });

//     // 📡 Nhận event khi cập nhật list
//     channel.listen(".list.updated", (data) => {
//       console.log("📡 Nhận event từ Pusher: list.updated", data);

//       queryClient.setQueryData(["lists", boardId], (oldBoard) => {
//         if (!oldBoard) return oldBoard;

//         const listsArray = Array.isArray(oldBoard.columns)
//           ? [...oldBoard.columns]
//           : [];

//         const updatedLists = listsArray
//           .map((list) =>
//             list.id === data.updatedList.id
//               ? { ...list, ...data.updatedList }
//               : list
//           )
//           .sort((a, b) => a.position - b.position);

//         return { ...oldBoard, columns: updatedLists };
//       });
//     });

//     // 📡 Nhận event khi tạo mới card
//     channel.listen(".card.created", (data) => {
//       console.log("📡 Nhận event từ Pusher: card.created", data);

//       queryClient.setQueryData(["lists", boardId], (oldBoard) => {
//         if (!oldBoard) return oldBoard;

//         const listsArray = Array.isArray(oldBoard.columns)
//           ? [...oldBoard.columns]
//           : [];

//         return {
//           ...oldBoard,
//           columns: listsArray.map((list) =>
//             list.id === data.columnId
//               ? { ...list, cards: [...(list.cards || []), data] }
//               : list
//           ),
//         };
//       });
//     });

//     // 📡 Nhận event khi card được cập nhật
//     channel.listen(".card.updated", (data) => {
//       console.log("📡 Nhận event từ Pusher: card.updated", data);

//       queryClient.setQueryData(["lists", boardId], (oldBoard) => {
//         if (!oldBoard) return oldBoard;

//         const listsArray = Array.isArray(oldBoard.columns)
//           ? [...oldBoard.columns]
//           : [];

//         return {
//           ...oldBoard,
//           columns: listsArray.map((list) =>
//             list.id === data.columnId
//               ? {
//                   ...list,
//                   cards: (list.cards || []).map((card) =>
//                     card.id === data.id ? { ...card, ...data } : card
//                   ),
//                 }
//               : list
//           ),
//         };
//       });
//     });

//     return () => {
//       channel.stopListening(".list.created");
//       channel.stopListening(".list.updated");
//       channel.stopListening(".card.created");
//       channel.stopListening(".card.updated");
//     };
//   }, [boardId, queryClient]);

//   return query;
// };

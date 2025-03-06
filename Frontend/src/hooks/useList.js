import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  // getListDetail,
  // updateListName,
  // updateClosed,
  createList,
  getListByBoardId,
  updateColPosition,
} from "../api/models/listsApi";
// import { createEchoInstance } from "./useRealtime";

// export const useListById = (listId) => {
//   const queryClient = useQueryClient();
//   const echoInstance = useMemo(() => createEchoInstance(), []);

//   const listsDetail = useQuery({
//     queryKey: ["list", listId],
//     queryFn: () => getListDetail(listId),
//     enabled: !!listId,
//     staleTime: 1000 * 60 * 5,
//     cacheTime: 1000 * 60 * 30,
//   });

//   // Mutation để cập nhật tên list
//   const updateListNameMutation = useMutation({
//     mutationFn: (newName) => updateListName(listId, newName),
//     onSuccess: () => {
//       queryClient.invalidateQueries(["list", listId]);
//     },
//     onError: (error) => {
//       console.error("Lỗi khi cập nhật tên danh sách:", error);
//     },
//   });

//   // Mutation để cập nhật trạng thái đóng/mở list
//   const updateClosedMutation = useMutation({
//     mutationFn: (closed) => updateClosed(listId, closed),
//     onSuccess: () => {
//       queryClient.invalidateQueries(["list", listId]);
//     },
//     onError: (error) => {
//       console.error("Lỗi khi cập nhật trạng thái lưu trữ:", error);
//     },
//   });

//   // Xử lý realtime events
//   useEffect(() => {
//     if (!listId || !echoInstance) return;

//     const channel = echoInstance.channel(`list.${listId}`);

//     channel.listen(".list.nameUpdated", (event) => {
//       if (event?.list?.id === listId) {
//         queryClient.setQueryData(["list", listId], (oldData) => {
//           if (!oldData) return oldData;
//           return { ...oldData, name: event.list.name };
//         });
//       }
//     });

//     channel.listen(".list.archived", (event) => {
//       if (event?.list?.id === listId) {
//         queryClient.setQueryData(["list", listId], (oldData) => {
//           if (!oldData) return oldData;
//           return { ...oldData, closed: event.list.closed };
//         });
//       }
//     });

//     return () => {
//       channel.stopListening(".list.nameUpdated");
//       channel.stopListening(".list.archived");
//       echoInstance.leave(`list.${listId}`);
//     };
//   }, [listId, echoInstance, queryClient]);

//   return {
//     ...listsDetail,
//     updateListName: updateListNameMutation.mutate,
//     updateClosed: updateClosedMutation.mutate,
//   };
// };

export const useLists = (boardId) => {
  return useQuery({
    queryKey: ["boardLists", boardId],
    queryFn: () => getListByBoardId(boardId),
    enabled: !!boardId,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });
};

export const useCreateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newColumn) => createList(newColumn), // Truyền newColumn vào createList
    onSuccess: (newList, variables) => {
      const { board_id } = variables;

      // Cập nhật danh sách hiện tại sau khi tạo thành công
      queryClient.setQueryData(["lists", board_id], (oldLists = []) => [
        ...oldLists,
        newList,
      ]);
    },
    onError: (error) => {
      console.error("❌ Lỗi khi tạo danh sách:", error);
    },
  });
};

const updateColPositionsGeneric = async (columns, updateFunction) => {
  try {
    return await updateFunction({ columns });
  } catch (error) {
    console.error("Failed to update card positions:", error);
    throw error;
  }
};

export const useUpdateColumnPosition = (columns) => {
  updateColPositionsGeneric(columns, updateColPosition);
};

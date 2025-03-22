import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  // getListDetail,
  // updateListName,
  updateClosed,
  createListAPI,
  getListByBoardId,
  // updateColPosition,
  deleteList,
  getListClosedByBoard,
  updatePositionList,
} from "../api/models/listsApi";
import { useEffect, useState } from "react";
import echoInstance from "./realtime/useRealtime";
import { optimisticIdManager } from "./optimistic/optimisticIdManager";

export const useLists = (boardId) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["lists", boardId],
    queryFn: () => getListByBoardId(boardId),
    enabled: !!boardId,
    staleTime: 0, // ⚠ Luôn lấy dữ liệu mới từ API
    cacheTime: 1000 * 60 * 30, // 30 phút
  });

  return query;
};

// ✅ Hook cập nhật vị trí của list (column)
export const useUpdatePositionList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ boardId, position, listId }) => {
      console.log("📡 Gọi API cập nhật vị trí:", { boardId, position, listId });
      return await updatePositionList({ boardId, position, listId });
    },
    onMutate: async ({ boardId, position, listId }) => {
      // ✅ Lưu dữ liệu cũ để rollback nếu API lỗi
      const previousLists = queryClient.getQueryData(["lists", boardId]) || [];

      queryClient.setQueryData(["lists", boardId], (oldData) => {
        if (!Array.isArray(oldData)) return []; // Đảm bảo oldData luôn là mảng
        return oldData.map((list) =>
          list.id === listId ? { ...list, position } : list
        );
      });

      return { previousLists };
    },
    onError: (error, _, context) => {
      console.error("❌ Lỗi cập nhật vị trí:", error);
      // 🔄 Rollback lại dữ liệu cũ nếu có lỗi
      if (context?.previousLists) {
        queryClient.setQueryData(["lists", boardId], context.previousLists);
      }
    },
    onSuccess: () => {
      console.log("✅ Cập nhật thành công!");
    },
  });
};

// export const useLists = (boardId) => {
//   const queryClient = useQueryClient();

//   const query = useQuery({
//     queryKey: ["lists", boardId],
//     queryFn: () => getListByBoardId(boardId),
//     enabled: !!boardId,
//     staleTime: 0, // ⚠ Luôn lấy dữ liệu mới từ API
//     cacheTime: 1000 * 60 * 30, // 30 phút
//   });

//   useEffect(() => {
//     if (!boardId) return;

//     const channel = echoInstance.channel(`board.${boardId}`);

//     // 📡 Khi có danh sách (list) mới được tạo
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

//     // 📡 Khi danh sách được cập nhật
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

//     // 📡 Khi có card mới được tạo
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

//     // 📡 Khi card được cập nhật
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
export const useCreateList = (boardId) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newList) => {
      // console.log(newList);
      return await createListAPI(newList); // Gọi API để tạo danh sách
    },

    onMutate: async (newList) => {
      await queryClient.cancelQueries({ queryKey: ["lists", boardId] });

      // 🆕 Tạo ID tạm thời
      const optimisticId = optimisticIdManager.generateOptimisticId("List");
      const previousLists = queryClient.getQueryData(["lists", boardId]) || [];

      // 🌟 Cập nhật danh sách tạm thời (UI phản hồi ngay lập tức)
      queryClient.setQueryData(["lists", boardId], (old) => {
        const safeOld = Array.isArray(old) ? old : []; // Đảm bảo old luôn là mảng
        return [...safeOld, { id: optimisticId, ...newList, temporary: true }];
      });

      return { previousLists, optimisticId };
    },

    onSuccess: (data, newList, context) => {
      if (!data?.id) {
        console.error("❌ API không trả về ID hợp lệ, rollback danh sách.");
        queryClient.setQueryData(["lists", boardId], context.previousLists);
        return;
      }

      // 🔄 Cập nhật danh sách với ID thực (thay thế ID lạc quan)
      queryClient.setQueryData(["lists", boardId], (old = []) =>
        old.map((list) =>
          list.id === context.optimisticId ? { ...list, id: data.id } : list
        )
      );

      // Liên kết ID lạc quan với ID thực
      optimisticIdManager.resolveId(context.optimisticId, data.id);
    },

    onError: (error, newList, context) => {
      console.error("❌ Lỗi khi tạo danh sách:", error);
      queryClient.setQueryData(["lists", boardId], context.previousLists);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["lists", boardId],
        exact: true,
      });
    },
  });

  return { createList: mutation.mutate, isSaving: mutation.isPending };
};

// Hook lấy danh sách list đã đóng (archived)
export const useListsClosed = (boardId) => {
  const queryClient = useQueryClient();
  const {
    data: listsClosed,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["listClosed", boardId],
    queryFn: () => getListClosedByBoard(boardId),
    enabled: !!boardId,
  });

  // Mutation để xóa list
  const deleteMutation = useMutation({
    mutationFn: deleteList,
    onMutate: async (id) => {
      await queryClient.cancelQueries(["listClosed"]);
      const previousLists = queryClient.getQueryData(["listClosed"]);

      queryClient.setQueryData(["listClosed"], (oldLists) =>
        oldLists?.data ? oldLists.data.filter((list) => list.id !== id) : []
      );

      return { previousLists };
    },
    onError: (error, _, context) => {
      console.error("Xóa thất bại:", error);
      queryClient.setQueryData(["listClosed"], context.previousLists);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["listClosed"]);
    },
  });

  // Mutation để cập nhật trạng thái lưu trữ (bỏ lưu trữ)
  const updateClosedMutation = useMutation({
    mutationFn: (listId) => updateClosed(listId),
    onSuccess: (data, listId) => {
      console.log(`🔄 Cập nhật trạng thái lưu trữ cho list ${listId}`);

      // Cập nhật danh sách listClosed ngay lập tức mà không cần gọi API lại
      queryClient.setQueryData(["listClosed"], (oldLists) =>
        oldLists?.data
          ? oldLists?.data.filter((list) => list.id !== listId)
          : []
      );

      // Cập nhật danh sách list active (nếu có)
      queryClient.invalidateQueries(["list", listId]);
    },
    onError: (error) => {
      console.error("❌ Lỗi khi cập nhật trạng thái lưu trữ:", error);
    },
  });

  return {
    listsClosed,
    isLoading,
    error,
    deleteMutation,
    updateClosedMutation,
  };
};

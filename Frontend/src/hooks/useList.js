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
import { useNavigate } from "react-router-dom";
import echoInstance from "./realtime/useRealtime";
import { optimisticIdManager } from "./optimistic/optimisticIdManager";

// export const useLists = (boardId) => {
//   const queryClient = useQueryClient();

//   const query = useQuery({
//     queryKey: ["lists", boardId],
//     queryFn: () => getListByBoardId(boardId),
//     enabled: !!boardId,
//     staleTime: 0, // Luôn lấy dữ liệu mới từ API
//     cacheTime: 1000 * 60 * 30, // Cache 30 phút
//   });

//   useEffect(() => {
//     if (!boardId) return;

//     // Sử dụng Public Channel để mọi người đều có thể nhận được sự kiện
//     const channel = echoInstance.channel(`board.${boardId}`);

//     // Lắng nghe sự kiện "list.updated"
//     channel.listen(".list.updated", (event) => {
//       console.log("Received list.updated event:", event);
//       console.log("Updated List Data:", event.updatedList);

//       // Cập nhật cache của query "lists" dựa trên dữ liệu mới
//       queryClient.setQueryData(["lists", boardId], (oldData) => {
//         console.log("Old Data:", oldData);

//         if (!oldData || !oldData.columns || !Array.isArray(oldData.columns)) {
//           console.warn(
//             "Old data does not have a valid 'columns' array, returning unchanged."
//           );
//           return oldData;
//         }

//         const newColumns = oldData.columns.map((list) =>
//           list.id === event.updatedList.id
//             ? { ...list, ...event.updatedList }
//             : list
//         );
//         const newData = { ...oldData, columns: newColumns };
//         console.log("New Data after update:", newData.columns);
//         return newData;
//       });
//     });

//     return () => {
//       channel.stopListening(".list.updated");
//     };
//   }, [boardId, queryClient]);

//   return query;
// };

export const useLists = (boardId) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [errorState, setErrorState] = useState(null);

  const query = useQuery({
    queryKey: ["lists", boardId],
    queryFn: async () => {
      const { data, error } = await getListByBoardId(boardId);

      if (error) {
        setErrorState(error);
      }

      return data;
    },
    enabled: !!boardId,
    staleTime: 0,
    cacheTime: 1000 * 60 * 30,
  });

  // Xử lý lỗi: nếu không có quyền hoặc không tìm thấy board
  useEffect(() => {
    if (errorState === "no_access" || errorState === "not_found") {
      navigate("/404");
    } else if (errorState === "unknown_error") {
      console.error("Lỗi không xác định xảy ra!");
    }
  }, [errorState, navigate]);

  useEffect(() => {
    if (!boardId) return;

    const channel = echoInstance.channel(`board.${boardId}`);

    // 📡 Nhận event khi tạo mới list
    channel.listen(".list.created", (data) => {
      console.log("📡 Nhận event từ Pusher: list.created", data);

      queryClient.setQueryData(["lists", boardId], (oldBoard) => {
        if (!oldBoard) return { columns: [data.newList] };

        const listsArray = Array.isArray(oldBoard.columns)
          ? [...oldBoard.columns]
          : [];

        if (listsArray.some((list) => list.id === data.newList.id))
          return oldBoard;

        return { ...oldBoard, columns: [...listsArray, data.newList] };
      });
    });

    // 📡 Nhận event khi cập nhật list
    channel.listen(".list.updated", (data) => {
      console.log("📡 Nhận event từ Pusher: list.updated", data);

      queryClient.setQueryData(["lists", boardId], (oldBoard) => {
        if (!oldBoard) return oldBoard;

        const listsArray = Array.isArray(oldBoard.columns)
          ? [...oldBoard.columns]
          : [];

        const updatedLists = listsArray
          .map((list) =>
            list.id === data.updatedList.id
              ? { ...list, ...data.updatedList }
              : list
          )
          .sort((a, b) => a.position - b.position);

        return { ...oldBoard, columns: updatedLists };
      });
    });

    // 📡 Nhận event khi tạo mới card
    channel.listen(".card.created", (data) => {
      console.log("📡 Nhận event từ Pusher: card.created", data);

      queryClient.setQueryData(["lists", boardId], (oldBoard) => {
        if (!oldBoard) return oldBoard;

        const listsArray = Array.isArray(oldBoard.columns)
          ? [...oldBoard.columns]
          : [];

        return {
          ...oldBoard,
          columns: listsArray.map((list) =>
            list.id === data.columnId
              ? { ...list, cards: [...(list.cards || []), data] }
              : list
          ),
        };
      });
    });

    // 📡 Nhận event khi card được cập nhật
    channel.listen(".card.updated", (data) => {
      console.log("📡 Nhận event từ Pusher: card.updated", data);

      queryClient.setQueryData(["lists", boardId], (oldBoard) => {
        if (!oldBoard) return oldBoard;

        const listsArray = Array.isArray(oldBoard.columns)
          ? [...oldBoard.columns]
          : [];

        return {
          ...oldBoard,
          columns: listsArray.map((list) =>
            list.id === data.columnId
              ? {
                  ...list,
                  cards: (list.cards || []).map((card) =>
                    card.id === data.id ? { ...card, ...data } : card
                  ),
                }
              : list
          ),
        };
      });
    });

    return () => {
      channel.stopListening(".list.created");
      channel.stopListening(".list.updated");
      channel.stopListening(".card.created");
      channel.stopListening(".card.updated");
    };
  }, [boardId, queryClient]);

  return query;
};

export const useUpdatePositionList = () => {
  return useMutation({
    mutationFn: async ({ listId, position }) => {
      return await updatePositionList({ listId, position });
    },
    retry: 3,
    retryDelay: 1000,
  });
};

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

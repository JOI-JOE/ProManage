import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getListDetail,
  updateListName,
  updateClosed,
  createList,
  getListByBoardId,
  updateColPosition,
  deleteList,
  getListClosedByBoard,
} from "../api/models/listsApi";
import { useEffect } from "react";
import echoInstance from "./realtime/useRealtime";

export const useLists = (boardId) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["lists", boardId],
    queryFn: () => getListByBoardId(boardId),
    enabled: !!boardId,
    staleTime: 0, // ⚠ Luôn lấy dữ liệu mới từ API
    cacheTime: 1000 * 60 * 30, // 30 phút
  });

  useEffect(() => {
    if (!boardId) return;

    const channel = echoInstance.channel(`board.${boardId}`);

    // 📡 Khi có danh sách (list) mới được tạo
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

    // 📡 Khi danh sách được cập nhật
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

    // 📡 Khi có card mới được tạo
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

    // 📡 Khi card được cập nhật
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

export const useCreateList = () => {
  return useMutation({
    mutationFn: createList,
    onError: (error) => {
      console.error("❌ Lỗi khi tạo list:", error);
    },
  });
};

export const useUpdateColumnPosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (columns) => updateColPosition({ columns }),

    onMutate: async (columns) => {
      await queryClient.cancelQueries(["lists", columns.board_id]);

      const previousLists = queryClient.getQueryData([
        "lists",
        columns.board_id,
      ]);

      queryClient.setQueryData(["lists", columns.board_id], (oldLists) => {
        const listsArray = Array.isArray(oldLists) ? oldLists : [];
        return listsArray.map((list) => {
          const updatedColumn = columns.find((col) => col.id === list.id);
          return updatedColumn ? { ...list, ...updatedColumn } : list;
        });
      });

      return { previousLists };
    },

    onError: (error, variables, context) => {
      console.error("Lỗi khi cập nhật vị trí cột:", error);
      if (context?.previousLists) {
        queryClient.setQueryData(
          ["lists", variables.board_id],
          context.previousLists
        );
      }
    },

    onSuccess: (data, variables) => {
      // Kiểm tra nếu data là một mảng trước khi sử dụng .find()
      if (Array.isArray(data)) {
        queryClient.setQueryData(["lists", variables.board_id], (oldLists) => {
          const listsArray = Array.isArray(oldLists) ? oldLists : [];
          return listsArray.map((list) => {
            const updatedColumn = data.find((col) => col.id === list.id);
            return updatedColumn ? { ...list, ...updatedColumn } : list;
          });
        });
      } else {
        console.warn("Dữ liệu trả về không phải là một mảng:", data);
      }
    },

    onSettled: (data, error, variables) => {},
  });
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

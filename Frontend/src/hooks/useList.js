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
import { useEffect, useCallback, useMemo } from "react";

import echoInstance from "./realtime/useRealtime";

export const useLists = (boardId) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["lists", boardId], // Sử dụng queryKey chung
    queryFn: () => getListByBoardId(boardId),
    enabled: !!boardId,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (!boardId) return;

    const channel = echoInstance.channel(`board.${boardId}`);

    channel.listen(".list.created", (data) => {
      queryClient.setQueryData(["lists", boardId], (oldLists) => {
        const listsArray = Array.isArray(oldLists) ? oldLists : []; // Đảm bảo oldLists là mảng

        console.log("🚀 Trước khi cập nhật:", listsArray);

        // Kiểm tra nếu list đã tồn tại (tránh thêm trùng)
        const isExisting = listsArray.some(
          (list) => list.id === data.newList.id
        );
        if (isExisting) {
          console.log("⚠ List đã tồn tại, không thêm mới");
          return listsArray;
        }

        // Thêm list mới vào cache
        const updatedLists = [...listsArray, data.newList];
        console.log("✅ Sau khi cập nhật:", updatedLists);
        return updatedLists;
      });

      // Kích hoạt re-render bằng cách làm mới query
      queryClient.invalidateQueries(["lists", boardId]);
    });

    return () => {
      channel.stopListening(".list.created");
    };
  }, [boardId, queryClient]);

  return query;
};

// Hook tạo list mới
export const useCreateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newColumn) => createList(newColumn), // Gửi API
    onSuccess: (data, variables) => {
      // ⚡ Cập nhật board để phản hồi UI nhanh hơn
      queryClient.setQueryData(["board", variables.board_id], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          columns: [...oldData.columns, data], // Thêm column mới vào cache của board
        };
      });

      // 🔥 Cập nhật danh sách lists
      queryClient.setQueryData(["lists", variables.board_id], (oldLists) => {
        const listsArray = Array.isArray(oldLists) ? [...oldLists] : [];
        return [...listsArray, data]; // Thêm column vào danh sách lists
      });

      // 🛠 Ép fetch lại để đảm bảo dữ liệu chính xác
      queryClient.invalidateQueries(["lists", variables.board_id]);
    },
    onError: (error) => {
      console.error("❌ Lỗi khi tạo column:", error);
    },
  });
};

// Hook cập nhật vị trí cột (column)
export const useUpdateColumnPosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (columns) => updateColPosition({ columns }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["boardLists", variables.board_id]);
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật vị trí cột:", error);
    },
  });
};


// Hook lấy danh sách list đã đóng (archived)
export const useListsClosed = (boardId) => {
  const queryClient = useQueryClient();
  
  const { data: listsClosed, isLoading, error } = useQuery({
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

// Hook lấy danh sách chi tiết theo listId
export const useListById = (listId) => {
  const queryClient = useQueryClient();

  const listsDetail = useQuery({
    queryKey: ["list", listId],
    queryFn: () => getListDetail(listId),
    enabled: !!listId, // Chỉ kích hoạt query khi có boardId
    staleTime: 1000 * 60 * 5, // Cache trong 5 phút
    cacheTime: 1000 * 60 * 30, // Giữ dữ liệu trong 30 phút ngay cả khi query bị hủy
    onSuccess: (data) => {
      console.log("Query data:", data); // Log dữ liệu trả về từ query
    },
  });

  // Mutation để cập nhật tên list
  const updateListNameMutation = useMutation({
    mutationFn: (newName) => updateListName(listId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries(["list", listId]);
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật tên danh sách:", error);
    },
  });

  // Mutation để cập nhật trạng thái đóng/mở list
  const updateClosedMutation = useMutation({
    mutationFn: () => updateClosed(listId),
    onSuccess: () => {
      queryClient.invalidateQueries(["list", listId]);
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật trạng thái lưu trữ:", error);
    },
  });

  const memoizedReturnValue = useMemo(
    () => ({
      ...listsDetail,
      updateListName: updateListNameMutation.mutate,
      updateClosed: updateClosedMutation.mutate,
    }),
    [listsDetail, updateListNameMutation.mutate, updateClosedMutation.mutate]
  );
  return memoizedReturnValue;
};

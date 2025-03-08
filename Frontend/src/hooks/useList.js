import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getListDetail,
  updateListName,
  updateClosed,
  createList,
  getListByBoardId,
  updateColPosition,
  getListClosed,
  deleteList,
} from "../api/models/listsApi";
import { useMemo } from "react";

// Hook lấy danh sách list theo BoardId
export const useLists = (boardId) => {
  return useQuery({
    queryKey: ["boardLists", boardId],
    queryFn: () => getListByBoardId(boardId),
    enabled: !!boardId,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });
};

// Hook tạo list mới
export const useCreateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createList,
    onSuccess: (newList, variables) => {
      queryClient.setQueryData(["lists", variables.board_id], (oldLists = []) => [
        ...oldLists,
        newList,
      ]);
    },
    onError: (error) => {
      console.error("❌ Lỗi khi tạo danh sách:", error);
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
export const useListsClosed = () => {
  const queryClient = useQueryClient();

  const { data: listsClosed, isLoading, error } = useQuery({
    queryKey: ["listClosed"],
    queryFn: getListClosed,
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
        oldLists?.data ? oldLists?.data.filter((list) => list.id !== listId) : []
      );

      // Cập nhật danh sách list active (nếu có)
      queryClient.invalidateQueries(["list", listId]);
    },
    onError: (error) => {
      console.error("❌ Lỗi khi cập nhật trạng thái lưu trữ:", error);
    },
  });


  

  return { listsClosed, isLoading, error, deleteMutation, updateClosedMutation };
};

// Hook lấy danh sách chi tiết theo listId
export const useListById = (listId) => {
  const queryClient = useQueryClient();

  const listsDetail = useQuery({
    queryKey: ["list", listId],
    queryFn: () => getListDetail(listId),
    enabled: !!listId,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
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

  return useMemo(() => ({
    ...listsDetail,
    updateListName: updateListNameMutation.mutate,
    updateClosed: updateClosedMutation.mutate,
  }), [listsDetail, updateListNameMutation.mutate, updateClosedMutation.mutate]);
};

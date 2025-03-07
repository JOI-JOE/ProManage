import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getListDetail,
  updateListName,
  updateClosed,
  createList,
  getListByBoardId,
  updateColPosition,
} from "../api/models/listsApi";
import { useEffect, useCallback, useMemo } from "react";
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


export const useListById = (listId) => {
  // console.log('useListById called with listId:', listId); // Log kiểm tra listId
  const queryClient = useQueryClient();
  // const echoInstance = usePusher();

  const listsDetail = useQuery({
    queryKey: ["list", listId],
    queryFn: () => getListDetail(listId),
    enabled: !!listId, // Chỉ kích hoạt query khi có boardId
    staleTime: 1000 * 60 * 5, // Cache trong 5 phút
    cacheTime: 1000 * 60 * 30, // Giữ dữ liệu trong 30 phút ngay cả khi query bị hủy
    onSuccess: (data) => {
      console.log('Query data:', data); // Log dữ liệu trả về từ query
    }
  });



  // Mutation để cập nhật tên list
  const updateListNameMutation = useMutation({
    mutationFn: (newName) => updateListName(listId, newName),
    onSuccess: (data) => {
      console.log("Danh sách đã được cập nhật:", data);
      queryClient.invalidateQueries(["list", listId]);
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật tên danh sách:", error);
    },
  });

  // Mutation để cập nhật trạng thái đóng/mở list
  const updateClosedMutation = useMutation({
    mutationFn: (closed) => updateClosed(listId, closed),
    onSuccess: (data) => {
      console.log("Trạng thái lưu trữ đã được cập nhật:", data);
      queryClient.invalidateQueries(["list", listId]);
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật trạng thái lưu trữ:", error);
    },
  });

  // const handleListUpdateName = useCallback((event) => {
  //   console.log('📡 Nhận sự kiện từ Pusher:', event);

  //   if (event?.list?.id === listId) {
  //       queryClient.setQueryData(['list', listId], (oldData) => {
  //           console.log("Old Data:", oldData);
  //           if (oldData) {
  //               console.log("Updating name:", event.list.name);
  //               const newData = { ...oldData, name: event.list.name };
  //               console.log("New Data:", newData);
  //               queryClient.invalidateQueries(['list', listId]);
  //               return newData;
  //               // return newData;
  //           } else {
  //               console.warn('⚠️ Không tìm thấy dữ liệu cũ để cập nhật. Đang làm mới dữ liệu...');
  //               queryClient.invalidateQueries(['list', listId]);
  //               return oldData;
  //           }
  //       });
  //   }
  // }, [listId, queryClient]);


  // const handleListArchived = useCallback((event) => {
  //   console.log("📡 Nhận dữ liệu từ Pusher:", event);
  //   if (event?.list?.id === listId) {
  //       queryClient.setQueryData(["list", listId], (oldData) => {
  //           console.log("Old Data:", oldData);
  //           if (oldData) {

  //               const newData = { ...oldData, closed: event.list.closed };
  //               console.log("New Data:", newData);
  //               queryClient.invalidateQueries(['list', listId]);
  //               return newData;

  //           } else {
  //               queryClient.invalidateQueries(["list", listId]);
  //               return oldData;
  //           }
  //       });
  //   }
  // }, [listId, queryClient]);

  // useEffect(() => {
  //   if (!listId || !echoInstance) {
  //       console.warn("⚠️ Không có listId hoặc echoInstance chưa khởi tạo.");
  //       return;
  //   }

  //   const channel = echoInstance.channel(`list.${listId}`);

  //   channel.listen('.list.nameUpdated', handleListUpdateName);
  //   channel.listen('.list.archived', handleListArchived);

  //   return () => {
  //       channel.stopListening('.list.nameUpdated');
  //       channel.stopListening('.list.archived');
  //   };
  // }, [listId, echoInstance, handleListUpdateName, handleListArchived]);



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

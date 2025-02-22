import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getListByBoardId,
         updateListPositions,
         createList, 
         updateListName, 
         updateClosed } from "../api/models/listsApi";
import { useEffect } from 'react';
// import '../../utils/pusher';

// Custom hook dùng để lấy danh sách và cập nhật vị trí
export const useLists = (boardId) => {
    const queryClient = useQueryClient();

    // Lấy danh sách boards từ API
    const listsQuery = useQuery({
        queryKey: ["boardLists", boardId],
        queryFn: () => getListByBoardId(boardId),
        enabled: !!boardId, // Chỉ gọi khi boardId có giá trị
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 30,
    });

    const reorderMutation = useMutation({
        mutationFn: updateListPositions,
        onMutate: async ({ boardId, updatedPositions }) => {
            await queryClient.cancelQueries(["boardLists", boardId]);

            // Lưu lại dữ liệu cũ trước khi thay đổi
            const previousLists = queryClient.getQueryData(["boardLists", boardId]);

            // Cập nhật cache ngay lập tức
            queryClient.setQueryData(["boardLists", boardId], (oldData) => {
                if (!oldData) return [];
                return updatedPositions.map((pos) => ({
                    ...oldData.find((list) => list.id === pos.id),
                    position: pos.position,
                }));
            });

            return { previousLists };
        },
        onError: (error, _, context) => {
            console.error("❌ Lỗi khi cập nhật vị trí:", error);
            if (context?.previousLists) {
                queryClient.setQueryData(["boardLists", boardId], context.previousLists);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries(["boardLists", boardId]);
        },
    });

    const createListMutation = useMutation({
        mutationFn: (listName) => createList(boardId, listName),  // Truyền boardId vào trong api call
        onSuccess: (data) => {
            console.log("Danh sách mới đã được tạo:", data);
            // Có thể thêm logic xử lý sau khi thêm thành công (ví dụ: cập nhật danh sách trong state)

            queryClient.invalidateQueries(["boardLists", boardId]);
        },
        onError: (error) => {
            console.error("Lỗi khi tạo danh sách:", error);
        }
    });


    // const updateListNameMutation = useMutation({
    //     mutationFn: (data) => updateListName(data.listId, data.newName),
    //     onSuccess: (data) => {
    //         console.log("Danh sách đã được cập nhật:", data);
    //         // Thực hiện invalidate queries hoặc bất kỳ xử lý nào sau khi thành công
    //         queryClient.invalidateQueries(["boardLists", boardId]);
    //     },
    //     onError: (error) => {
    //         console.error("Lỗi khi cập nhật tên danh sách:", error);
    //     },
    // });





    return {
        ...listsQuery, // Trả về tất cả các giá trị từ useQuery như data, isLoading, error, ...
        reorderLists: reorderMutation.mutate,
        createList: createListMutation.mutate,
        // updateListName: updateListNameMutation.mutate,
    };

};


export const useListById = (listId) => {
    const queryClient = useQueryClient();
    const updateListNameMutation = useMutation({
        mutationFn: (newName) => updateListName(listId, newName),
        onSuccess: (data) => {
          // Sau khi thành công, làm mới dữ liệu danh sách
        //   queryClient.invalidateQueries(["boardLists", listId]);
          console.log("Danh sách đã được cập nhật:", data);
        },
        onError: (error) => {
          console.error("Lỗi khi cập nhật tên danh sách:", error);
        },
      });


      const updateClosedMutation = useMutation({
        mutationFn: (listId) => updateClosed(listId, closed),  // Gọi API để cập nhật trạng thái lưu trữ
        onSuccess: (data) => {
          console.log("Trạng thái lưu trữ đã được cập nhật:", data);
          // Bạn có thể thêm logic để làm mới danh sách hoặc thông báo thành công
          queryClient.invalidateQueries(["boardLists", listId]);
        },
        onError: (error) => {
          console.error("Lỗi khi cập nhật trạng thái lưu trữ:", error);
        },
      });

    return {
        updateListName: updateListNameMutation.mutate,
        updateClosed: updateClosedMutation.mutate,
    };
};



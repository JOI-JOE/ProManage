import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getListByBoardId, updateListPositions } from "../api/models/listsApi";
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


    return {
        ...listsQuery, // Trả về tất cả các giá trị từ useQuery như data, isLoading, error, ...
        reorderLists: reorderMutation.mutate,
    };

};

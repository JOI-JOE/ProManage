import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCalendar, UpdateCardCalendar } from "../api/models/calendarApi";
import { getBoardMembers } from "../api/models/inviteBoardApi";

/**
 * Custom hook để lấy calendar theo board_id và tháng.
 * @param {string|number} board_id - ID của board
 * @param {string} month - Chuỗi tháng định dạng YYYY-MM (ví dụ: 2025-04)
 * @returns {object} - Kết quả từ useQuery (data, isLoading, isError, ...)
 */
export const useCalendar = (board_id = [], month) => {

    return useQuery({
        queryKey: ["calendar", { board_id, month }],
        queryFn: () => getCalendar(board_id, month),
        enabled: !!board_id && !!month, // Chỉ chạy khi đủ điều kiện
        staleTime: 1000 * 60 * 5, // 5 phút
        cacheTime: 1000 * 60 * 30, // 30 phút
        refetchOnWindowFocus: false,
    });
};
export const useMultiBoardMembers = (boardIds) => {
    return useQueries({
        queries: boardIds.map((boardId) => ({
            queryKey: ['boardMembers', boardId],
            queryFn: () => getBoardMembers(boardId),
            enabled: !!boardId,
            staleTime: 60 * 1000,
            cacheTime: 5 * 60 * 1000,
            retry: 2,
            refetchOnWindowFocus: false,
        })),
    });
};
export const useUpdateCardCalendar = () => {
    const queryClient = useQueryClient();


    return useMutation({

        mutationFn: ({ cardId, board_id, end_date, month }) =>
            UpdateCardCalendar(cardId, board_id, end_date, month),
        onSuccess: (_, variables) => {
            const { board_id, month } = variables;

            queryClient.invalidateQueries({
                predicate: (query) => {
                    const key = query.queryKey[1];
                    return (
                        query.queryKey[0] === "calendar" &&
                        key?.month === month &&
                        key?.board_ids?.includes(board_id)
                    );
                },
            });
        },
        onError: (error) => {
            // ⚠️ Nếu backend trả lỗi, gọi revert() để quay lại vị trí cũ
            info.revert();

            // Hiển thị lỗi ra UI nếu cần
            toast.error(error.response?.data?.message || "Cập nhật thất bại");
        },
    });
};

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCalendar, UpdateCardCalendar } from "../api/models/calendarApi";
import { getBoardMembers } from "../api/models/inviteBoardApi";

/**
 * Custom hook để lấy calendar theo board_id và tháng.
 * @param {string|number} board_id - ID của board
 * @param {string} month - Chuỗi tháng định dạng YYYY-MM (ví dụ: 2025-04)
 * @returns {object} - Kết quả từ useQuery (data, isLoading, isError, ...)
 */
// export const useCalendar = (boardIds = [], month) => {

//     return useQuery({
//         queryKey: ["calendar",  boardIds, month ],
//         queryFn: () => getCalendar(boardIds, month),
//         enabled: boardIds.length > 0 && !!month,
//         staleTime: 1000 * 60 * 5, // 5 phút
//         cacheTime: 1000 * 60 * 30, // 30 phút
//         refetchOnWindowFocus: false,
//     });
// };
export const useCalendar = (boardIds = [], start, end) => {
    return useQuery({
      queryKey: ["calendar", boardIds, start, end],
      queryFn: () => getCalendar(boardIds, start, end),
      enabled: boardIds.length > 0 && !!start && !!end
    });
  };
export const useUpdateCardCalendar = () => {
    const queryClient = useQueryClient();


    return useMutation({

        mutationFn: ({ cardId, start_date, end_date  }) =>
            UpdateCardCalendar(cardId, start_date, end_date ),
        onError: (error) => {
            // ⚠️ Nếu backend trả lỗi, gọi revert() để quay lại vị trí cũ
            info.revert();

            // Hiển thị lỗi ra UI nếu cần
            toast.error(error.response?.data?.message || "Cập nhật thất bại");
        },
    });
};

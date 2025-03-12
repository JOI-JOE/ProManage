import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createComment, getCommentsByCardId, deleteComment, updateComment } from "../api/models/commentsApi"; // Import API thêm bình luận
import { useEffect, useMemo } from "react";




export const useCreateComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ card_id, user_id, content }) => createComment({ card_id, user_id, content }), // Gọi API thêm comment
        onSuccess: (newComment, { card_id }) => {
            // Cập nhật cache thủ công
            queryClient.setQueryData(["comments", card_id], (oldData) => {
                return [...oldData, newComment]; // Thêm comment mới vào danh sách comments
            });

            // Invalidate query để đảm bảo dữ liệu đồng bộ với server
            queryClient.invalidateQueries({ queryKey: ["comments", card_id] });
            queryClient.invalidateQueries({ queryKey: ["lists"] });
        },
        onError: (error) => {
            console.error("❌ Lỗi khi thêm bình luận:", error);
        },
    });
};

export const useCommentsByCard = (cardId) => {
    return useQuery({
        queryKey: ["comments", cardId], // Key duy nhất trong cache
        queryFn: () => getCommentsByCardId(cardId), // Gọi API lấy danh sách comment
        enabled: !!cardId, // Chỉ gọi API nếu có cardId
        staleTime: 1000 * 60 * 5, // Cache trong 5 phút
        cacheTime: 1000 * 60 * 30, // Giữ cache trong 30 phút
    });
};


export const useDeleteComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (commentId) => deleteComment(commentId), // Gọi API xóa
        // onSuccess: (_, commentId) => {
        //     console.log(`✅ Xóa bình luận thành công: ${commentId}`);

        //     // Cập nhật danh sách bình luận sau khi xóa
        //     queryClient.setQueryData(["comments"], (oldComments = []) =>
        //         oldComments.filter((c) => c.id !== commentId)
        //     );
        // },
        onError: (error) => {
            console.error("❌ Lỗi khi xóa bình luận:", error);
        }
    });
};

export const useUpdateComment = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: updateComment,
      onSuccess: (_, variables) => {
        // Cập nhật danh sách bình luận sau khi sửa
        // queryClient.invalidateQueries(["comments", variables.cardId]);
      },
      onError: (error) => {
        console.error("❌ Lỗi khi chỉnh sửa bình luận:", error);
      },
    });
  };

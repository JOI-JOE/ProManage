import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createComment, getCommentsByCardId, deleteComment, updateComment } from "../api/models/commentsApi"; // Import API thêm bình luận
import { useEffect, useMemo } from "react";
import echoInstance from "./realtime/useRealtime";


export const useCommentsByCard = (card_id) => {
    const queryClient = useQueryClient();
    const comments = useQuery({
        queryKey: ["comments", card_id], // Key duy nhất trong cache
        queryFn: () => getCommentsByCardId(card_id), // Gọi API lấy danh sách comment
        enabled: !!card_id, // Chỉ gọi API nếu có cardId
        staleTime: 1000 * 60 * 5, // Cache trong 5 phút
        cacheTime: 1000 * 60 * 30, // Giữ cache trong 30 phút
    });

    useEffect(() => {
        if (!card_id || !echoInstance) return;

        const channel = echoInstance.channel(`card.${card_id}`);

        channel.listen(".card.comment.added", async (event) => {
            // console.log("📡 Nhận event từ Pusher:", event);

            if (event?.comment?.card_id === card_id) {
                // Kiểm tra nếu comment từ Pusher có đầy đủ thông tin user không
                if (!event.comment.user) {
                    // console.warn("⚠️ Comment từ Pusher thiếu thông tin user. Gọi API để cập nhật lại...");

                    // Gọi API lại để lấy thông tin đầy đủ của comment
                    await queryClient.invalidateQueries({ queryKey: ["comments", card_id] });
                    // queryClient.invalidateQueries({ queryKey: ["lists"] });
                    return;
                }

                queryClient.setQueryData(["comments", card_id], (oldData) => {
                    // console.log("🔄 Dữ liệu cũ trước khi cập nhật:", oldData);

                    const newData = oldData ? [...oldData, event.comment] : [event.comment];

                    // console.log("✅ Dữ liệu mới sau khi cập nhật:", newData);
                    return newData;
                });

                // console.log("🛠 Cache hiện tại:", queryClient.getQueryData(["comments", card_id]));
            }
        });

        channel.listen(".card.comment.deleted", (event) => {
            // console.log("🗑 Nhận event xóa bình luận từ Pusher:", event);
    
            queryClient.setQueryData(["comments", card_id], (oldData) => {
                return oldData ? oldData.filter(comment => comment.id !== event.commentId) : [];
            });

         
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
    
        });

        channel.listen(".card.comment.updated", (event) => {
            // console.log("📡 Nhận event cập nhật comment:", event);
    
            queryClient.setQueryData(["comments", card_id], (oldData) => {
                if (!oldData) return [event.comment];
    
                return oldData.map(comment => 
                    comment.id === event.comment.id ? event.comment : comment
                );
            });
        });



        return () => {
            channel.stopListening(".card.comment.added");
            channel.stopListening(".card.comment.deleted");
            channel.stopListening(".card.comment.updated");
            echoInstance.leave(`card.${card_id}`);
           
        };
    }, [card_id, queryClient]);


    return comments;

};

export const useCreateComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ card_id, content, mentioned_usernames }) =>
            createComment({ card_id, content, mentioned_usernames }),

        onSuccess: (newComment, { card_id }) => {
            // Làm mới danh sách bình luận sau khi thêm
            queryClient.invalidateQueries({ queryKey: ["comments", card_id], exact: true });
        },

        onError: (error) => {
            console.error("❌ Lỗi khi thêm bình luận:", error);
        },
    });
};





export const useDeleteComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (commentId) => deleteComment(commentId), // Gọi API xóa comment

        onSuccess: (_, commentId) => {
            console.log(`✅ Bình luận ${commentId} đã được xóa thành công!`);
            // Invalidate để cập nhật danh sách comments và danh sách lists nếu có ảnh hưởng
            queryClient.invalidateQueries({ queryKey: ["comments"], exact: false });
            // queryClient.invalidateQueries({ queryKey: ["lists"] });
        },

        onError: (error) => {
            console.error("❌ Lỗi khi xóa bình luận:", error);
        }
    });
};

export const useUpdateComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateComment, // API nhận { commentId, content }
        onSuccess: (_, variables) => {
            console.log(`✅ Đã cập nhật bình luận ${variables.commentId} thành công!`);
            queryClient.invalidateQueries({ queryKey: ["comments"], exact: false });
            // queryClient.invalidateQueries({ queryKey: ["lists"] });
        },
        onError: (error) => {
            console.error("❌ Lỗi khi chỉnh sửa bình luận:", error);
        },
    });
};


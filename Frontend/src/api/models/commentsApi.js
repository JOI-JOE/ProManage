import authClient from "../authClient";

export const getCommentsByCardId = async (cardId) => {
    try {
        const response = await authClient.get(`/cards/${cardId}/comments`);

        return response.data; // Trả về danh sách comment
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách bình luận:", error);
        throw error;
    }
};

export const createComment = async ({ card_id, content, mentioned_usernames = [] }) => {
    try {
        const response = await authClient.post(`/comments`, {
            card_id,
            content,
            mentioned_usernames, // Gửi danh sách username được tag
        });

        return response.data;
    } catch (error) {
        console.error("❌ Lỗi khi thêm bình luận:", error);
        throw error;
    }
};


export const deleteComment = async (commentId) => {
    try {
        const response = await authClient.delete(`/comments/${commentId}`);
        return response.data; // Trả về dữ liệu phản hồi từ API
    } catch (error) {
        console.error("❌ Lỗi khi xóa bình luận:", error);
        throw error;
    }
};

export const updateComment = async ({ commentId, content }) => {
    try {
        const response = await authClient.put(`/comments/${commentId}`, {
            content,
        });

        return response.data;
    } catch (error) {
        console.error("❌ Lỗi khi chỉnh sửa bình luận:", error);
        throw error;
    }
};

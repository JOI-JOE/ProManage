import authClient from "../authClient";

// 📌 1. Lấy danh sách bảng của user
// export const getUserBoards = async () => {
//     try {
//     const response = await authClient.get(`/user/boards`);
//     return response.data;
//     } catch (error) {
//         console.error("Lỗi khi lấy ra danh sách bảng của user tham gia bảng (Chức năng mời thành viên vào bảng):", error);
//         throw error;
//     }
    
// }; Chưa dùng

export const getBoardMembers = async (boardId) => {
    try {
    const response = await authClient.get(`/boards/${boardId}/members`);
    return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy ra thành viên của bảng", error);
        throw error;
    }
    
};


export const generateInviteLink = async (boardId) => {
    try {
        const response = await authClient.post(`/board/${boardId}/invite`);
        return response.data; // Trả về link mời
    } catch (error) {
        console.error("Lỗi khi tạo link mời:", error);
        throw error;
    }
}

export const updateRoleMemberInBoards = async (boardId, userId, role) => {
    try {
        const response = await authClient.put(`/boards/update-role`, {
            board_id: boardId,
            user_id: userId,
            role: role
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Lỗi không xác định';
        console.error("Lỗi khi cập nhật vai trò thành viên:", errorMessage);
        throw new Error(errorMessage); // Ném lỗi với thông điệp cụ thể
    }
};

export const removeMemberFromBoard = async (boardId, userId) => {
    try {
        const response = await authClient.delete(`/boards/delete`, {
            data: {
                board_id: boardId,
                user_id: userId,
            }
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Lỗi không xác định';
        console.error("Lỗi khi xóa thành viên khỏi bảng:", errorMessage);
        throw new Error(errorMessage); // Ném lỗi với thông điệp cụ thể
    }
};



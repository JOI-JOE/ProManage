import authClient from "../authClient";

export const getListByBoardId = async (boardId) => {
    try {
        const response = await authClient.get(`/lists/${boardId}`);

        // Kiểm tra nếu response.data là một mảng và sắp xếp theo position
        if (Array.isArray(response.data)) {
            return response.data.sort((a, b) => a.position - b.position);
        } else {
            console.error("Lỗi: API không trả về danh sách đúng", response.data);
            return []; // Trả về mảng rỗng nếu dữ liệu không hợp lệ
        }
    } catch (error) {
        console.error("Lỗi khi lấy danh sách các list của board:", error);
        throw error;
    }
};




export const updateListPositions = async ({ boardId, updatedPositions }) => {
    try {
        const response = await authClient.put(`/lists/reorder`, {
            board_id: boardId,
            positions: updatedPositions,  // Đảm bảo positions không phải undefined
        });

        console.log("✅ Cập nhật vị trí thành công:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi cập nhật vị trí:", error);
        throw error;
    }
};


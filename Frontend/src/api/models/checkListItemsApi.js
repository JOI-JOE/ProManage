import authClient from "../authClient";

export const createCheckListItem = async ({ checklist_id, name }) => {
    try {
        const response = await authClient.post(`/checklist-items`, {
            checklist_id,
            name
        });

        return response.data;
    } catch (error) {
        console.error("❌ Lỗi khi thêm CheckListItem:", error);
        throw error;
    }
};

export const toggleCheckListItemStatus = async (itemId) => {
    try {
        const response = await authClient.put(`/item/${itemId}/completed`);
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật trạng thái checklist item:", error);
        throw error;
    }
};

export const updateCheckListItemName = async (itemId, name) => {
    try {
        // Gửi request cập nhật tên checklist item lên API
        const response = await authClient.put(`/item/${itemId}/name`, {
            name,
        });

        return response.data; // Trả về dữ liệu từ API
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật tên checklist item:", error);
        throw error;
    }
};

export const deleteCheckListItem = async (id) => {
    try {
        const response = await authClient.delete(`/item/${id}`);
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi khi xóa ChecklistItem:", error);
        throw error;
    }
};
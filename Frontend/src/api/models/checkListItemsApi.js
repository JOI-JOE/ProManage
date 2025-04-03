import authClient from "../authClient";


export const getChecklistItemsByCheckList = async (checklist_id) => {

    try {
        const response = await authClient.get(`/checklist/${checklist_id}/item`);
        return response.data; // Trả về dữ liệu từ API
    } catch (error) {
        console.error("Lỗi khi lấy danh sách checklist:", error);
        throw error;
    }
};

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

export const toggleCheckListItemMember = async (itemId, userId) => {
    try {
        // console.log("Sending toggle member for checklist item:", itemId, "user:", userId);
        const response = await authClient.post(`/checklist-items/${itemId}/toggle-member`, {
            user_id: userId,
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi toggle member của checklist item:", error.response?.data || error);
        throw error;
    }
};

export const toggleCardMember = async (cardId, userId) => {
    try {
        const response = await authClient.post(`/cards/${cardId}/toggle-member`, {
            user_id: userId, // Gửi user_id trong body
        });
        return response.data
    } catch (error) {
        console.error("Lỗi khi lấy ra thành viên của card:", error);
        throw error;
    }
}

export const getMembersInCheckListItem = async (itemId) => {
    try {
        const response = await authClient.get(`/checklist-items/${itemId}/members`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy ra thành viên của checklist-items:", error);
        throw error;
    }
}
export const updateDateItem = async (itemId, endDate, endTime, reminder) => {
    //   console.log(itemId,endDate,endTime);
    try {
        const response = await authClient.put(`/update-date/${itemId}/item`, {
            end_date: endDate,
            end_time: endTime,
            reminder: reminder
        });


        return response.data;
    } catch (error) {
        console.error("Error updating card date:", error);
        throw new Error(error.response?.data?.message || "Failed to update card date.");
    }
};
export const getChecklistItemsDate = async (targetId) => {

    try {
        const response = await authClient.get(`/item/${targetId}/dates-item`);
        return response.data.data; // Trả về dữ liệu từ API
    } catch (error) {
        console.error("Lỗi khi lấy danh sách checklist:", error);
        throw error;
    }
};
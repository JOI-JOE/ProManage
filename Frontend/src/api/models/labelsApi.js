import authClient from "../authClient";
export const getLabelsByBoard = async (boardId) => {
    try {
       
        const response = await authClient.get(`/boards/${boardId}/labels`);             
        return response.data.data;         
    } catch (error) {
        console.error("Lỗi khi lấy nhãn:", error);
        throw error;
    }
};
// thêm mới
export const createLabel = async (boardId, data) => {
    try {
        const response = await authClient.post(`/boards/${boardId}/labels`, data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo nhãn:", error.response?.data || error.message);
        throw error;
    }
};
// thêm nhãn và xóa khỏi thẻ
export const updateCardLabel = async (cardId, labelId, action) => {
    try {
        const response = await authClient.put(`/cards/${cardId}/labels/update-action`, {
            label_id: labelId,
            action: action,
        });
        // console.log("✅ API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật nhãn:", error.response?.data || error.message);
        throw error;
    }
};
  export const getLabelsByCard = async (cardId) => {
    try {
        const response = await authClient.get(`/cards/${cardId}/labels`);
        return response.data.data;
    } catch (error) {
        console.error("Lỗi khi lấy nhãn của thẻ:", error);
        throw error;
    }
};
export const deleteLabelByBoard = async ( labelId) => {
    try {
        
        const response = await authClient.delete(`labels/${labelId}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi xóa nhãn:", error);
        throw error;
    }
};
export const updateLabelName = async ( labelId, data) => {
    try {
        const response = await authClient.patch(`/labels/${labelId}/update-name`, data);

        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật nhãn:", error.response?.data || error.message);
        throw error;
    }
};




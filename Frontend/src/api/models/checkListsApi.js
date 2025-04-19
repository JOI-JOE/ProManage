import authClient from "../authClient";

// Function fix -------------------------------------------------------------
export const getChecklistsByCard = async (cardId) => {
  try {
    const response = await authClient.get(`/cards/${cardId}/checklists`);
    return response.data; // Trả về dữ liệu từ API
  } catch (error) {
    console.error("Lỗi khi lấy danh sách checklist:", error);
    throw error;
  }
};

// --------------------------------------------------------------------------

export const createCheckList = async ({ card_id, name }) => {
  try {
    // Gửi request tạo checklist lên API
    const response = await authClient.post(`/checklists`, {
      card_id,
      name,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi thêm checklist:", error);
    throw error;
  }
};

export const updateCheckList = async ({ id, name }) => {
  try {
    // Gửi request cập nhật checklist lên API
    const response = await authClient.put(`/checklists/${id}`, {
      name,
    });

    return response.data; // Trả về dữ liệu từ API
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật checklist:", error);
    throw error;
  }
};

export const deleteCheckList = async (id) => {
  try {
    const response = await authClient.delete(`/checklists/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi xóa checklist:", error);
    throw error;
  }
};

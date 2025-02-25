import authClient from "../authClient";

export const getCardByList = async (listId) => {
  try {
    const response = await authClient.get(`cards/${listId}/getCardsByList`);
    
    if (!response.data || !response.data.data) {
      throw new Error("Dữ liệu API trả về không hợp lệ");
    }

    // Sắp xếp danh sách card theo `position` từ nhỏ đến lớn
    return response.data.data.sort((a, b) => a.position - b.position);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách card:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Không thể lấy danh sách card");
  }
};

// Hàm cập nhật vị trí của card khi kéo thả
export const updateCardPositions = async ({ cardId, newListId, newPosition }) => {
  try {
    const response = await authClient.put(`/cards/update-position`, {
      list_id: newListId,
      position: newPosition,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật vị trí card:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Không thể cập nhật vị trí card");
  }
};

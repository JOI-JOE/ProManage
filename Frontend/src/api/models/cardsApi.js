import authClient from "../authClient";
// Lấy danh sách card theo list
export const getCardByList = async (listId) => {
  const response = await authClient.get(`/cards/list/${listId}`);
  return response.data.data;
};

// Tạo card mới
export const createCard = async (data) => {
  const response = await authClient.post("/cards", data);
  return response.data;
};

export const updateCardPosition = async ({
  cardId,
  sourceListId,
  targetListId,
  newPosition,
  boardId,
}) => {
  try {
    // Log dữ liệu trước khi gửi để debug
    console.log("📤 Gửi request cập nhật vị trí:", {
      card_id: cardId,
      source_list_id: sourceListId,
      target_list_id: targetListId,
      position: newPosition,
      board_id: boardId,
    });

    // Gọi API cập nhật vị trí card
    const response = await authClient.put(`/cards/update-position`, {
      card_id: cardId,
      source_list_id: sourceListId,
      target_list_id: targetListId,
      position: newPosition,
      board_id: boardId,
    });

    console.log("✅ Cập nhật vị trí thành công:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "❌ Lỗi khi cập nhật vị trí card:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Không thể cập nhật vị trí card"
    );
  }
};

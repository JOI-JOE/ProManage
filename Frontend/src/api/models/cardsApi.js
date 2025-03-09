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

export const updateCardPositionsSameCol = async ({ cards }) => {
  try {
    const response = await authClient.put("/boards/update-card-same-col", {
      cards,
    });
    return response.data;
  } catch (error) {
    console.error("Error in updateCardPositions:", error);
    throw new Error("Failed to update card positions");
  }
};

export const updateCardPositionsDiffCol = async ({ cards }) => {
  try {
    const response = await authClient.put("/boards/update-card-diff-col", {
      cards,
    });
    return response.data;
  } catch (error) {
    console.error("Error in updateCardPositionsDifferentColumn:", error);
    throw new Error("Failed to update card positions across columns");
  }
};





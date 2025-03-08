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

export const getCardById = async (cardId) => {
  try {
    const response = await authClient.get(`/cards/${cardId}/show`);
    console.log("API response:", response); // Kiểm tra toàn bộ response
    if (response.data) {
      return response.data;
    
    } else {
      console.error("No data returned from API.");
      throw new Error("No data from API.");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};


export const updateDescription = async (cardId, description) => {
  try {
    const response = await authClient.patch(`/cards/${cardId}/description`, {
      description: description,
    });

    if (response.data) {
      return response.data; // Trả về dữ liệu từ API
    } else {
      console.error("No data returned from API.");
      throw new Error("No data from API.");
    }
  } catch (error) {
    console.error("Error updating description:", error);
    throw error;
  }
};


export const updateCardTitle = async (cardId, title) => {
  try {
      const response = await authClient.put(`/cards/${cardId}/updatename`, { title });
      return response.data;
  } catch (error) {
      console.error("Lỗi khi cập nhật tên card:", error);
      throw error;
  }
};


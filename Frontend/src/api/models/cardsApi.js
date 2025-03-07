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
// 

export const updateCardPositions = async ({ cardId, newListId, newPosition }) => {
  try {
    const response = await authClient.put(`/cards/update-position`, {
      id: cardId, // Bổ sung ID của card
      new_list_board_id: newListId, // Đúng tên tham số trên API
      new_position: newPosition, // Đúng tên tham số trên API
    });

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật vị trí card:", error.response?.data || error.message);

    throw new Error(
      error.response?.data?.message || "Không thể cập nhật vị trí card"
    );
  }
};


export const createCard = async (cardData) => {
  try {
    const response = await authClient.post("/cards", cardData);
    return response.data; // Trả về dữ liệu từ API
  } catch (error) {
    console.error("Lỗi khi tạo thẻ:", error);
    throw error; // Ném lỗi để xử lý phía trên (nếu cần)
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


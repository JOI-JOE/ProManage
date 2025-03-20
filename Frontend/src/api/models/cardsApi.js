import authClient from "../authClient";
// Lấy danh sách card theo list
export const getCardByList = async (listId) => {
  const response = await authClient.get(`/cards/${listId}/getCardsByList`);
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
    // console.log("API response:", response); // Kiểm tra toàn bộ response
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

export const getCardArchivedByBoard = async (boardId) => {
  try {
    const response = await authClient.get(`/cards/boards/${boardId}/archived`);
    return response.data;
  } catch (error) {
    console.error("Error fetching cards:", error);

    // Kiểm tra nếu có response từ server
    if (error.response) {
      console.error("Server responded with:", error.response.status, error.response.data);

      // Ném lỗi để phía trên có thể xử lý nếu cần
      throw new Error(error.response.data.message || "Failed to fetch cards.");
    } else if (error.request) {
      console.error("No response received from server.");
      throw new Error("No response from server. Please check your internet connection.");
    } else {
      console.error("Unexpected error:", error.message);
      throw new Error("An unexpected error occurred.");
    }
  }
};

export const updateArchivedCard = async (cardId) => {
  try {
    const response = await authClient.patch(`/cards/${cardId}/toggle-archive`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái lưu trữ:", error);
    throw error;
  }   
}

// API xóa card
export const deleteCard = async (cardId) => {
  try {
    const response = await authClient.delete(`/cards/${cardId}/delete`);
    return response.data;
  } catch (error) {
    console.error("Error deleting card:", error);
    throw new Error(error.response?.data?.message || "Failed to delete card.");
  }
};



export const getMemberInCard = async (cardId) => {
  try {
    const response = await authClient.get(`/cards/${cardId}/members`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy ra thành viên của card:", error);
    throw error;
  }   
}

export const toggleCardMember = async (cardId,userId) => {
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
export const getDateByCard = async (cardId) => {
  const response = await authClient.get(`/cards/${cardId}/dates`);
  return response.data;
};
export const updateCardDate = async (cardId,startDate, endDate, endTime, reminder) => {
  
  try {
    const response = await authClient.put(`cards/${cardId}/dates`, {
      start_date:startDate,
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
export const addMemberToCard = async ( cardId, email ) => {
  console.log(cardId,email);
  try {
    const response = await authClient.post(`cards/${cardId}/members/email`, { email });
    
   
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm thành viên vào thẻ", error);
    throw error;
  }   
};
export const removeMember = async ( cardId, userId ) => {

  try {
    const response = await authClient.delete(`cards/${cardId}/members/${userId}`);
   
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm thành viên vào thẻ", error);
    throw error;
  }   
};



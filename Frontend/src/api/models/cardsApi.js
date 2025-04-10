import { data } from "react-router-dom";
import authClient from "../authClient";
// Lấy danh sách card theo list

// Fetch dữ liệu card -------------------------------------------------------
export const fetchCardById = async (cardId) => {
  try {
    const response = await authClient.get(`/card/${cardId}`);
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

export const fetchCheckLists = async (cardId) => {
  const { data } = await authClient.get(`/card/${cardId}/checklists`);
  return data;
};
// function create ----------------------------------------------------------
// - checklist
export const postCheckLists = async ({ cardId, data }) => {
  const response = await authClient.post(`/card/${cardId}/checklists`, data);
  return response.data;
};
// - checklistitem
//----
export const postChecklistItem = async ({ checklistId, data }) => {
  const response = await authClient.post(
    `/checklist/${checklistId}/items`,
    data
  );
  return response.data;
};

/// function update --------------------------------------------------------
// ChecklistItem
export const updateCheckListItem = async (checklistItemId, data) => {
  const response = await authClient.put(
    `/checklist/${checklistItemId}/items`,
    data
  );
  return response.data;
};
// Card
export const updateCardById = async (cardId, data) => {
  const response = await authClient.put(`/card/${cardId}`, data);
  return response.data;
};
// Member card
export const joinCard = async (cardId) => {
  const { data } = await authClient.post(`/card/${cardId}/idMember`);
  return data;
};
// Thêm thành viên cụ thể vào card
export const putMemberToCard = async (cardId, memberId) => {
  const { data } = await authClient.post(
    `/card/${cardId}/idMember/${memberId}`
  );
  return data;
};

//fucntion delete
// Bỏ ra
export const removeMemberFromCard = async (cardId, memberId) => {
  const { data } = await authClient.delete(
    `/card/${cardId}/idMember/${memberId}`
  );
  return data;
};

// checklist
export const removeCheckListFromCard = async (checklistId) => {
  const { data } = await authClient.delete(`/checklist/${checklistId}`);
  return data;
};

/// ---------------------------------------------------------------

// Tạo card mới
export const createCard = async (data) => {
  const response = await authClient.post("/card", data);
  return response.data;
};

export const updatePositionCard = async ({ cardId, listId, position }) => {
  try {
    const response = await authClient.put(`cards/${cardId}`, {
      listId: listId, // ID của list cần cập nhật
      position: position, // Vị trí bạn muốn cập nhật
    });
    return response.data;
  } catch (error) {
    console.error("Error in updateCardPositions:", error);
    throw new Error("Failed to update card positions");
  }
};

export const getCardByList = async (listId) => {
  const response = await authClient.get(`/cards/${listId}/getCardsByList`);
  return response.data.data;
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
    const response = await authClient.put(`/cards/${cardId}/updatename`, {
      title,
    });
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
      console.error(
        "Server responded with:",
        error.response.status,
        error.response.data
      );

      // Ném lỗi để phía trên có thể xử lý nếu cần
      throw new Error(error.response.data.message || "Failed to fetch cards.");
    } else if (error.request) {
      console.error("No response received from server.");
      throw new Error(
        "No response from server. Please check your internet connection."
      );
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
};

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
};

export const toggleCardMember = async (cardId, userId) => {
  try {
    const response = await authClient.post(`/cards/${cardId}/toggle-member`, {
      user_id: userId, // Gửi user_id trong body
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm thành viên của card:", error);
    throw error;
  }
};

export const getDateByCard = async (targetId) => {
  const response = await authClient.get(`/cards/${targetId}/dates`);
  return response.data;
};

export const updateCardDate = async (
  targetId,
  startDate,
  endDate,
  endTime,
  reminder
) => {
  try {
    const response = await authClient.put(`cards/${targetId}/dates`, {
      start_date: startDate,
      end_date: endDate,
      end_time: endTime,
      reminder: reminder,
    });

    return response.data;
  } catch (error) {
    console.error("Error updating card date:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update card date."
    );
  }
};
export const addMemberToCard = async (cardId, email) => {
  console.log(cardId, email);
  try {
    const response = await authClient.post(`cards/${cardId}/members/email`, {
      email,
    });

    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm thành viên vào thẻ", error);
    throw error;
  }
};
export const removeMember = async (cardId, userId) => {
  try {
    const response = await authClient.delete(
      `cards/${cardId}/members/${userId}`
    );

    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm thành viên vào thẻ", error);
    throw error;
  }
};

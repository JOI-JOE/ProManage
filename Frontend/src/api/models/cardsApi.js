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
// - checklists
export const fetchCheckLists = async (cardId) => {
  const { data } = await authClient.get(`/card/${cardId}/checklists`);
  return data;
};
// - attachments
export const fetchAttachments = async (cardId) => {
  const response = await authClient.get(`/card/${cardId}/attachments`);
  return response.data;
};
// - comments
export const fetchComments = async (cardId) => {
  const response = await authClient.get(`/card/${cardId}/comments`);
  return response.data;
};
// - activity
export const fetchActivities = async (cardId) => {
  const response = await authClient.get(`/activity/cards/${cardId}`);
  return response.data;
};
// function create ----------------------------------------------------------
// Copy card
export const copyCard = async ({ cardId, data }) => {
  const response = await authClient.post(`/card/${cardId}/copy`, data);
  return response.data;
};
// Move a card
export const moveCard = async ({ cardId, data }) => {
  const response = await authClient.post(`/card/${cardId}/move`, data);
  return response.data;
};
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
// - attachment - file
export const postAttachmentFile = async ({ cardId, file }) => {
  try {
    const response = await authClient.post(
      `/card/${cardId}/attachments`,
      file,
      {
        headers: {
          "Content-Type": "multipart/form-data", // Explicitly set the content type for file uploads
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải lên file:", error);
    throw error;
  }
};
// - attachment - link
export const postAttachmentLink = async ({ cardId, link }) => {
  try {
    const response = await authClient.post(
      `/card/${cardId}/attachments`,
      link
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm link:", error);
    throw error;
  }
};
// comment
export const postComment = async ({ cardId, content }) => {
  try {
    const response = await authClient.post(`/card/${cardId}/comments`, {
      content,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi thêm bình luận:", error);
    throw error;
  }
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
// Checklist
export const updateCheckList = async (checklistId, data) => {
  const response = await authClient.put(`card/checklist/${checklistId}`, data);
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
// Member card
export const putMemberToCard = async (cardId, memberId) => {
  const { data } = await authClient.post(
    `/card/${cardId}/idMember/${memberId}`
  );
  return data;
};
// Attachment
export const putAttachment = async (attachmentId, data) => {
  const response = await authClient.put(
    `/card/attachment/${attachmentId}`,
    data
  );
  return response.data; // Return only the data for consistency
};
// Comment
export const putComment = async (commentId, content) => {
  const response = await authClient.put(`card/comment/${commentId}`, {
    content: content,
  });
  return response.data;
};

//fucntion delete ---------------------------------------------------------------
// Bỏ ra
export const removeMemberFromCard = async (cardId, memberId) => {
  const { data } = await authClient.delete(
    `/card/${cardId}/idMember/${memberId}`
  );
  return data;
};
// Attachment
export const removeAttachment = async (attachmentId) => {
  const response = await authClient.delete(
    `/card/attachment/${attachmentId}`,
    data
  );
  return response.data;
};
// checklist
export const removeCheckListFromCard = async (checklistId) => {
  const { data } = await authClient.delete(`card/checklist/${checklistId}`);
  return data;
};
// checklistitem
export const removeCheckListItem = async (checklistItemId) => {
  const response = await authClient.delete(
    `/checklist/${checklistItemId}/items`,
    data
  );
  return response.data;
};
// Comment
export const removeComment = async (commentId) => {
  const response = await authClient.delete(`card/comment/${commentId}`);
  return response.data;
};
// card
export const removeCard = async (cardId) => {
  const response = await authClient.delete(`card/${cardId}`);
  return response.data;
};
/// ---------------------------------------------------------------

// Tạo card mới
export const createCard = async (data) => {
  const response = await authClient.post("/card", data);
  return response.data;
};

export const updatePositionCard = async ({ cardId, listId, position }) => {
  try {
    const response = await authClient.put(`card/${cardId}/drag`, {
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


import authClient from "../authClient";

export const getAttachmentsByCard = async (cardId) => {
  try {
    const response = await authClient.get(`/${cardId}/attachments`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đính kèm của card:", error);
    throw error;
  }   
}

export const createAttachments = async (cardId, data) => {
  try {
    console.log("📥 Dữ liệu nhận được trong createAttachments:", {  data });
    const formData = new FormData();

    if (data.file) {
      // Nếu là file đính kèm
      formData.append("file", data.file); // File thực tế để upload
      formData.append("file_name_defaut", data.file.name); // Tên file mặc định
      formData.append("card_id", cardId); // Gửi card_id để backend xử lý

      console.log("📤 Gửi file:", {
        file_name: data.file.name,
        file_type: data.file.type,
        file_size: (data.file.size / 1024).toFixed(2) + "KB",
      });
    } else if (data.path_url) {
      // Nếu là link
      formData.append("path_url", data.path_url);
      formData.append("file_name_defaut", data.file_name_defaut || "Liên kết không tên");
      formData.append("card_id", cardId); // Thêm card_id cho link nếu BE yêu cầu
    } else {
      throw new Error("Vui lòng cung cấp file hoặc đường dẫn hợp lệ!");
    }

    // Debug dữ liệu gửi lên
    console.log("📤 Dữ liệu gửi lên backend:", Object.fromEntries(formData.entries()));

    const response = await authClient.post(`/${cardId}/attachments/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Phản hồi từ backend:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo đính kèm:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// Chỉnh sửa tên attachment
export const updateFileNameAttachment = async (cardId, attachmentId, fileName) => {
  try {
    const response = await authClient.patch(`/${cardId}/attachments/${attachmentId}/update-name`, {
      file_name_defaut: fileName, // Gửi dữ liệu cần cập nhật
    });

    return response.data;
  } catch (error) {
    console.error("Error updating file_name_defaut attachment:", error);
    throw new Error(error.response?.data?.error || "Failed to update file_name_defaut attachment.");
  }
};

// QUỐC ///////
export const setCoverImage = async (cardId,attachmentId) => {
  try {
    const response = await authClient.patch(`/${cardId}/attachments/${attachmentId}/set-cover-image`);
    return response.data;
  } catch (error) {
    console.error("Error deleting attachments:", error);
    throw new Error(error.response?.data?.message || "Failed to delete attachments.");
  }
};


// API xóa attachmentattachment
export const deleteAttachment = async (cardId,attachmentId) => {
  try {
    const response = await authClient.delete(`/${cardId}/attachments/${attachmentId}/delete`);
    return response.data;
  } catch (error) {
    console.error("Error deleting attachments:", error);
    throw new Error(error.response?.data?.message || "Failed to delete attachments.");
  }
};



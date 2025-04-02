import axios from "axios";
import authClient from "../authClient";

const UNSPLASH_ACCESS_KEY = "3FSDAzFI1-_UTdXCx6QonPOxi8C8R6EBCg0Y_PrSQmk"; // Thay bằng Access Key của bạn
///------------------------------------------------------

export const fetchBoardById = async (boardId) => {
  if (!boardId || typeof boardId !== "string") {
    throw new Error("Board ID không hợp lệ");
  }

  try {
    const { data } = await authClient.get(`/boards/${boardId}`);
    if (!data?.board) {
      throw new Error("Dữ liệu bảng không hợp lệ");
    }
    return {
      ...data,
      action: data.action || data.board?.action || null, // Normalize action field
    };
  } catch (error) {
    // Handle 403 response with action
    if (error.response?.status === 403 && error.response.data?.action) {
      return { action: error.response.data.action };
    }

    // Log and throw for other errors
    console.error("Lỗi khi lấy dữ liệu bảng:", error);
    throw new Error(
      error.response?.data?.message || "Lỗi khi tải dữ liệu bảng"
    );
  }
};

///------------------------------------------------------

export const getBoardsAllByClosed = async () => {
  try {
    const response = await authClient.get("boards");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy workspace của người dùng:", error);
    throw error;
  }
};

export const createBoard = async (data) => {
  try {
    const response = await authClient.post("/createBoard", data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo bảng:", error);
    throw error;
  }
};

export const showBoardByWorkspaceId = async (workspaceId) => {
  try {
    const response = await authClient.get(`workspaces/${workspaceId}/boards`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy workspace của người dùng:", error);
    throw error;
  }
};

export const getRecentBoards = async () => {
  try {
    const response = await authClient.get("/recent-boards");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bảng gần đây:", error);
    throw error;
  }
};

export const logBoardAccess = async (boardId) => {
  try {
    const response = await authClient.post("/recent-boards", {
      board_id: boardId,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lưu thông tin bảng:", error);
    throw error;
  }
};

export const updateBoardName = async (boardId, name) => {
  try {
    const response = await authClient.patch(`/boards/${boardId}/name`, {
      name,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật tên bảng:", error);
    throw error;
  }
};

export const toggleBoardMarked = async (boardId) => {
  try {
    const response = await authClient.patch(`/boards/${boardId}/marked`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đánh dấu bảng:", error);
    throw error;
  }
};

export const getBoardMarked = async () => {
  try {
    const response = await authClient.get(`/boards_marked`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi hiển thị bảng được đánh dấu:", error);
    throw error;
  }
};
export const getUnsplashImages = async () => {
  try {
    const response = await axios.get(
      "https://api.unsplash.com/search/photos?query=workspace&per_page=10&client_id=3FSDAzFI1-_UTdXCx6QonPOxi8C8R6EBCg0Y_PrSQmk"
    );

    return response.data.results; // Lấy danh sách ảnh từ `results`
  } catch (error) {
    console.error(
      "❌ Lỗi khi lấy ảnh từ Unsplash:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateBoardVisibility = async (boardId, visibility) => {
  if (!boardId) {
    throw new Error("Lỗi: boardId không hợp lệ!");
  }

  try {
    const response = await authClient.patch(`/boards/${boardId}/visibility`, {
      visibility,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật visibility của bảng:", error);
    throw error;
  }
};

export const toggleBoardClosed = async (boardId) => {
  try {
    const response = await authClient.delete(`/boards/${boardId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đánh dấu bảng:", error);
    throw error;
  }
};

export const getBoardClosed = async () => {
  try {
    const response = await authClient.get(`/closed`);
    return response.data;
  } catch (error) {
    console.error("False get board closed:", error);
    throw error;
  }
};

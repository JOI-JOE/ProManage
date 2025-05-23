import axios from "axios";
import authClient from "../authClient";

const UNSPLASH_ACCESS_KEY = "3FSDAzFI1-_UTdXCx6QonPOxi8C8R6EBCg0Y_PrSQmk"; // Thay bằng Access Key của bạn

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

export const getBoardById = async (boardId) => {
  if (!boardId) {
    throw new Error("boardId không hợp lệ");
  }

  try {
    const response = await authClient.get(`/boards/${boardId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Lỗi khi lấy bảng:",
      error?.response?.data?.message || error.message
    );

    throw new Error(
      error?.response?.data?.message ||
        "Không thể lấy dữ liệu bảng, vui lòng thử lại sau."
    );
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

export const updateBoardLastAccessed = async (boardId) => {
  try {
    const response = await authClient.post(`/boards/${boardId}/update-last-accessed`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật last_accessed của board:", error);
    throw error;
  }
};


export const updateBoardName = async (boardId, name) => {
  try {
    const response = await authClient.patch(`/boards/${boardId}/name`, { name });
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật tên bảng:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Không thể cập nhật tên bảng");
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
      "https://api.unsplash.com/search/photos?query=mountain&per_page=10&orientation=landscape&client_id=3FSDAzFI1-_UTdXCx6QonPOxi8C8R6EBCg0Y_PrSQmk"
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
    const response = await authClient.patch(`/boards/${boardId}/visibility`, { visibility });
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

export const fetchBoardDetails = async (boardId) => {
  const response = await authClient.get(`/boards/${boardId}/details`);
  return response.data;
};


export const copyBoard = async (data) => {
  try {
    const response = await authClient.post(`/boards/copy`, data);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi sao chép bảng:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Không thể sao chép bảng");
  }
};



export const forceDestroyBoard = async (boardId) => {
  const response = await authClient.delete(`/boards/${boardId}/fDestroy`);
  return response.data;
};
export const getLinkInviteBoard = async (boardId) => {
  try {
    const response = await authClient.get(`/${boardId}/invitation`);
    return response.data;
  } catch (error) {
    console.error("False get board closed:", error);
    throw error;
  }
};











import authClient from "../authClient";

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
    const response = await authClient.post("/recent-boards", { board_id: boardId });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lưu thông tin bảng:", error);
    throw error;
  }
};

export const updateBoardName = async (boardId, name) => {
  try {
    const response = await authClient.patch(`/boards/${boardId}/name`, { name });
    return response.data;
  } catch (error) {  
    console.error("Lỗi khi cập nhật tên bảng:", error);
    throw error;
  }
};




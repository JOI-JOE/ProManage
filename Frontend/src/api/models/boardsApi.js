import authClient from "../authClient";

export const getBoardsAll = async () => {
  try {
    const response = await authClient.get("boards");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy workspace của người dùng:", error);
    throw error;
  }
};

export const createBoard = async (boardData) => {
  try {
    const response = await authClient.post("boards", boardData);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Lỗi từ server:", error.response.data);
    } else {
      console.error("Lỗi kết nối:", error.message);
    }
    throw error;
  }
};



import authClient from "../authClient";

export const fetchBoardStars = async () => {
  try {
    // Gửi request POST để star board
    const response = await authClient.get(`boardstars`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thực hiện star board:", error);
    throw error;
  }
};

export const addStarToBoard = async (userId, boardId) => {
  try {
    // Gửi request POST để star board với boardId
    const response = await authClient.post(`member/${userId}/boardStars`, {
      boardId: boardId, // Thêm userId vào request body nếu cần thiết
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thực hiện star board:", error);
    throw error;
  }
};

export const unStarToBoard = async (userId, boardId) => {
  try {
    const response = await authClient.delete(
      `/member/${userId}/boardStars/${boardId}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thực hiện unstar board:", error);
    throw error;
  }
};

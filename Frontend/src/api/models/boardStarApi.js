import authClient from "../authClient";

// Hàm để "star" board với userId
export const starBoard = async (userId, boardId) => {
  try {
    // Gửi request POST để star board
    const response = await authClient.post(`/member/${userId}/boardStars`, {
      board_id: boardId, // Thêm boardId vào request body
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thực hiện star board:", error);
    throw error;
  }
};

// Hàm để "unstar" board với userId và boardStarId
export const unstarBoard = async (userId, boardStarId) => {
  try {
    // Gửi request DELETE để unstar board
    const response = await authClient.delete(
      `/member/${userId}/boardStars/${boardStarId}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thực hiện unstar board:", error);
    throw error;
  }
};

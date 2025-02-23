import authClient from "../authClient";

export const getAllColors = async () => {
    try {
      const response = await authClient.get("/colors");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy màu:", error);
      throw error;
    }
  };
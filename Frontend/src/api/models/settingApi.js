import authClient from "../authClient";
export const getSetting = async () => {
    try {
      const response = await authClient.get("/settings");
      
      
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy màu:", error);
      throw error;
    }
  };
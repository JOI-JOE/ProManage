import authClient from "../authClient";

export const getNotifications = async () => {
  try {
    const response = await authClient.get(`/notifications`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy ra thông báo ", error);
    throw error;
  }
};

import authClient from "../authClient";

export const getActivityByCardId = async (cardId) => {
    try {
        const response = await authClient.get(`/activities/${cardId}`);
        return response.data; // Trả về dữ liệu từ API
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách activity:", error);
        throw error;
    }
};
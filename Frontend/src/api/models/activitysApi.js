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

export const getActivityByUser = async () => {
    try {
        const response = await authClient.get(`user/activities`);
        return response.data; // Trả về dữ liệu từ API
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách activity:", error);
        throw error;
    }
};
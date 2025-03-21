import authClient from "../authClient";

export const search = async (query, userId) => {
    try {
        const response = await authClient.get(`/search`, {
            params: { query, userId }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tìm kiếm", error);
        throw error;
    }
};
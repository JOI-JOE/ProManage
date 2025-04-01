import authClient from "../authClient";



export const fetchMemberCardsAndItems = async (boardId, memberId) => {
    try {
      // Gửi yêu cầu API để lấy danh sách thẻ và checklist items
      const [cardRes, itemRes] = await Promise.all([
        authClient.get(`/boards/${boardId}/members/${memberId}/cards`),
        authClient.get(`/boards/${boardId}/members/${memberId}/items`)
      ]);
  
      // Lấy dữ liệu từ response (Axios trả về response.data)
      const cards = cardRes.data || [];
      const items = itemRes.data || [];
  
      return { cards, items };
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu thẻ và checklist:", error.response?.data || error.message);
      return { cards: [], items: [] }; // Trả về mảng rỗng để tránh lỗi tiếp tục
    }
  };
  
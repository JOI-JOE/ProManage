import authClient from "../authClient";

/**
 * Gọi API để lấy dữ liệu calendar theo board_id và month.
 * @param {Object} params - Tham số truyền vào: { board_id, month }
 * @returns {Promise} - Dữ liệu trả về từ API
 */
// export const getCalendar = async (boardIds = [], month) => {
//   if (boardIds.length === 0 || !month) return [];

//   try {
//     const responses = await Promise.all(
//       boardIds.map(id =>
//         authClient.get(`/calendar?board_id=${id}&month=${month}`)
//       )
//     );

//     // Gộp kết quả từ các bảng
//     const allCards = responses.flatMap(res => res.data || []);
//     return allCards;
//   } catch (error) {
//     console.error("Lỗi khi lấy calendar:", error);
//     return [];
//   }
// };

export const getCalendar = async (boardIds = [], start, end) => {
  if (boardIds.length === 0 || !start || !end) return [];

  try {
    const responses = await Promise.all(
      boardIds.map(id =>
        authClient.get(`/calendar?board_id=${id}&start=${start}&end=${end}`)
      )
    );
    return responses.flatMap(res => res.data || []);
  } catch (error) {
    console.error("Lỗi khi lấy calendar:", error);
    return [];
  }
};


export const UpdateCardCalendar = async (cardId,start_date, end_date,) => {
  console.log("dữ liệu trả về ",end_date)
  try {
    const response = await authClient.put(
      `/calendar/${cardId}`,
      {
        start_date:start_date,
        end_date:end_date,
        

      }
    );

    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm thành viên vào thẻ", error);
   
    throw error;
    
  }
};
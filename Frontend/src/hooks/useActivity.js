import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getActivityByCardId, getActivityByUser } from "../api/models/activitysApi";

export const useActivityByCardId = (cardId) => {
  return useQuery({
    queryKey: ["activities", cardId],
    queryFn: async () => {
      const res = await getActivityByCardId(cardId);
      // console.log("📌 API Response:", res); // Kiểm tra dữ liệu từ API
      return res.activities || []; // Đảm bảo luôn trả về mảng
    },
    enabled: !!cardId, // Chỉ gọi API nếu có cardId
    staleTime: 1000 * 60 * 5, // Cache trong 5 phút
    cacheTime: 1000 * 60 * 30, // Giữ cache trong 30 phút
  });
};

// export const useActivitiesByUser = () => {

//   return useQuery({
//     queryKey: ["activities", "me"],
//     queryFn: getActivityByUser,
//   });
// };

export const useActivitiesByUser = () => {
  return useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const res = await getActivityByUser();
      return res.activities || [];
    },
    staleTime: 1000 * 60 * 5,  // cache 5 phút
    cacheTime: 1000 * 60 * 30, // giữ cache 30 phút
  });
};


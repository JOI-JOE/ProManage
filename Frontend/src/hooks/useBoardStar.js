import { fetchBoardStars } from "../api/models/boardStarApi";
import { useQuery } from "@tanstack/react-query";

export const useBoardStars = (userId) => {
  return useQuery({
    queryKey: ["boardStars", userId], // Định danh theo userId để tránh xung đột dữ liệu
    queryFn: () => fetchBoardStars(userId),
    enabled: !!userId, // Chỉ chạy query khi userId có giá trị hợp lệ
    cacheTime: 5 * 60 * 1000, // 5 phút để giảm số lần gọi API khi không cần thiết
  });
};

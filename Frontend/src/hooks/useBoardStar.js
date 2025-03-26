import { useDispatch } from "react-redux";
import {
  fetchBoardStars,
  // starBoard,
  // unstarBoard,
} from "../api/models/boardStarApi";
import { useQuery } from "@tanstack/react-query";

export const useBoardStars = () => {
  return useQuery({
    queryKey: ["boardStars"], // Định danh theo userId
    queryFn: () => fetchBoardStars(),
    staleTime: 0, // Luôn lấy dữ liệu mới nhất
    cacheTime: 5 * 60 * 1000, // 5 phút để giảm số lần gọi API khi không cần thiết
  });
};

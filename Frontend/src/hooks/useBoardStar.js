import { fetchBoardStars } from "../api/models/boardStarApi";
import { useQuery } from "@tanstack/react-query";

export const useBoardStars = () => {
  return useQuery({
    queryKey: ["boardStars"], // Định danh query theo userId
    queryFn: () => fetchBoardStars(), // Truyền userId vào fetchBoardStars nếu API yêu cầu
    staleTime: 5 * 60 * 1000, // Dữ liệu coi là "tươi" trong 5 phút
    cacheTime: 10 * 60 * 1000, // Giữ dữ liệu trong cache 10 phút
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

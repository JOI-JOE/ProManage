import { useQuery } from "@tanstack/react-query";
import { getAllColors } from "../api/models/colorsApi";

/**
 * Custom hook để lấy danh sách workspaces mà user tham gia.
 * @returns {object} - Kết quả từ useQuery (data, isLoading, isError, ...)
 */
export const useColor = () => {
  return useQuery({
    queryKey: ["colors"], // Cache theo key "colors"
    queryFn: getAllColors,   // Hàm gọi API
    staleTime: 1000 * 60 * 5, // Cache trong 5 phút (tránh gọi lại quá sớm)
    cacheTime: 1000 * 60 * 30, // Giữ dữ liệu trong cache 30 phút
    refetchOnWindowFocus: false, // Không gọi lại API khi đổi tab
  });
};
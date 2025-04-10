import { useQuery } from "@tanstack/react-query";
import { getSetting } from "../api/models/settingApi";


/**
 * Custom hook để lấy danh sách workspaces mà user tham gia.
 * @returns {object} - Kết quả từ useQuery (data, isLoading, isError, ...)
 */
export const useSetting = () => {
  return useQuery({
    queryKey: ["setting"], // Cache theo key "colors"
    queryFn: getSetting,   // Hàm gọi API
    staleTime: 1000 * 60 * 5, // Cache trong 5 phút (tránh gọi lại quá sớm)
    cacheTime: 1000 * 60 * 30, // Giữ dữ liệu trong cache 30 phút
    refetchOnWindowFocus: false, // Không gọi lại API khi đổi tab
  });
};
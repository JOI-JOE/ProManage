import { useQuery } from "@tanstack/react-query";
import { getAllColors } from "../api/models/colorsApi";

/**
 * Custom hook để lấy danh sách workspaces mà user tham gia.
 * @returns {object} - Kết quả từ useQuery (data, isLoading, isError, ...)
 */
export const useColor = () => {
    return useQuery({
      queryKey: ["colors"], // Key để cache dữ liệu
      queryFn: getAllColors,
      onError: (error) => {
        console.error("Lỗi không lấy được màu", error);
      },
    });
  };
import { create } from "zustand";
import { useColor } from "../hooks/useColor";
import { useEffect, useRef } from "react";

const useColorStore = create((set) => ({
  colors: [],
  setColors: (newColors) => set({ colors: newColors }),
}));

// Hook fetch color chỉ chạy 1 lần
export const useFetchColors = () => {
  const { data: colors, isLoading, error } = useColor();
  const setColors = useColorStore((state) => state.setColors);
  const hasFetched = useRef(false); // Biến kiểm tra đã fetch chưa

  useEffect(() => {
    if (!hasFetched.current && colors && Array.isArray(colors)) {
      setColors(
        colors.map((color) => ({
          id: color.id,
          hex: color.hex_code || "#1693E1",
        }))
      );
      hasFetched.current = true; // Đánh dấu đã fetch
    }
  }, [colors, setColors]);

  return { isLoading, error };
};

export default useColorStore;

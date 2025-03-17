import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale"; // Locale tiếng Việt

export const formatTime = (timestamp) => {
  const time = new Date(timestamp);
  const now = new Date();
  const diffMinutes = Math.floor((now - time) / (1000 * 60)); // Chênh lệch phút

  if (diffMinutes < 1) return "Vừa xong"; // Dưới 1 phút
  if (diffMinutes < 60) return `${diffMinutes} phút trước`; // Dưới 1 giờ
  if (diffMinutes < 24 * 60) return formatDistanceToNow(time, { addSuffix: true, locale: vi }); // Trong ngày
  return format(time, "HH:mm - dd 'thg' MM',' yyyy", { locale: vi }); // Ngày khác
};
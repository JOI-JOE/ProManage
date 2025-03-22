import { MIN_SPACING, SPACING } from "./position.constant";

/**
 * Tính toán position mới cho một item được chèn vào danh sách.
 *
 * Ý tưởng:
 *  - Loại bỏ item đang di chuyển khỏi danh sách (nếu có).
 *  - Clamp index vào khoảng [0, items.length].
 *  - Nếu danh sách sau khi loại bỏ trống, trả về SPACING.
 *  - Nếu chèn vào đầu danh sách (không có item trước), trả về trung bình giữa 0 và position của item sau, không nhỏ hơn MIN_SPACING.
 *  - Nếu chèn vào cuối danh sách (không có item sau), trả về position của item trước cộng SPACING.
 *  - Nếu chèn vào giữa, trả về trung bình của position của item trước và item sau; nếu khoảng cách quá nhỏ, ép thành prevPos + SPACING.
 *
 * @param {number} index - Vị trí bạn muốn chèn item vào (sau khi đã clamp).
 * @param {Array} allItems - Danh sách các item hiện có (mỗi item có thuộc tính id và position).
 * @param {Object} [item] - Item đang được di chuyển (có thể null).
 * @returns {number} - Giá trị position mới.
 */
export const calculateItemPosition = (index, allItems, item) => {
  // Loại bỏ item được di chuyển khỏi danh sách (nếu có)
  const items = allItems.filter((thisItem) => !item || item.id !== thisItem.id);

  // Clamp index vào khoảng [0, items.length]
  const indexBounded = Math.min(Math.max(index, 0), items.length);

  // Nếu không có item nào trong danh sách sau khi loại bỏ, trả về SPACING
  if (items.length === 0) {
    return SPACING;
  }

  // Lấy item liền trước và liền sau vị trí indexBounded
  const prevItem = items[indexBounded - 1] || null;
  const nextItem = items[indexBounded] || null;

  const prevPos = prevItem ? prevItem.position : 0;
  const nextPos = nextItem ? nextItem.position : prevPos + SPACING;

  // Nếu chèn vào đầu danh sách (không có item trước)
  if (!prevItem) {
    let newPos = nextPos / 2;
    // Sử dụng MIN_SPACING để đảm bảo vị trí tối thiểu
    return Math.max(newPos, MIN_SPACING);
  }

  // Nếu chèn vào cuối danh sách (không có item sau)
  if (!nextItem) {
    return prevPos + SPACING;
  }

  // Nếu chèn vào giữa danh sách: tính trung bình giữa prevPos và nextPos
  let newPos = (prevPos + nextPos) / 2;
  const minGap = SPACING * MIN_SPACING;
  if (nextPos - prevPos < minGap) {
    newPos = prevPos + SPACING;
  }
  return Math.max(newPos, 0);
};

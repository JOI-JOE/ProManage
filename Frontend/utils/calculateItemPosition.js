import { SPACING } from "./position.constant";

export const calculateItemPosition = (index, allItems, item) => {
  // Trường hợp danh sách rỗng
  if (allItems.length === 0) return SPACING;

  // Trường hợp chèn vào đầu danh sách
  if (index === 0) {
    return allItems[0].position / 2;
  }

  // Trường hợp chèn vào cuối danh sách
  if (index >= allItems.length) {
    return allItems[allItems.length - 1].position + SPACING;
  }

  // Trường hợp chèn vào giữa hai phần tử
  const prevPosition = allItems[index - 1].position;
  const nextPosition = allItems[index].position;

  // Đảm bảo có khoảng trống đủ lớn giữa các phần tử
  if (nextPosition - prevPosition > 1) {
    return prevPosition + Math.floor((nextPosition - prevPosition) / 2);
  }

  // Nếu khoảng cách quá nhỏ, tái cân bằng toàn bộ danh sách
  let newPosition = prevPosition;
  for (let i = index; i < allItems.length; i++) {
    newPosition += SPACING;
    allItems[i].position = newPosition;
  }
  return prevPosition + SPACING;
};

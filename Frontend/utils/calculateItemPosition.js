import { SPACING } from "./position.constant";

/**
 * Kiểm tra xem một phần tử có đang ở vị trí mong muốn không.
 */
export const isInPosition = (index, allItems, item) => {
  if (!item?.id) {
    return false;
  }
  const itemAtPosition = allItems[index];
  return itemAtPosition?.id === item.id;
};

/**
 * Tính toán giá trị `position` mới cho một phần tử khi kéo thả.
 */
export const calculateItemPosition = (index, allItems, item) => {
  const items = allItems.filter((thisItem) => item?.id !== thisItem.id);

  if (item && isInPosition(index, allItems, item)) {
    return item.position;
  }

  const indexBounded = Math.min(Math.max(index, 0), items.length);

  if (!items.length) {
    return SPACING;
  }

  const itemPrev = items[indexBounded - 1];
  const itemNext = items[indexBounded];

  const posItemCurr = item?.position ?? -1;
  const posItemPrev = itemPrev?.position ?? -1;
  const posItemNext = itemNext?.position ?? -1;

  if (posItemNext === -1) {
    if (item && posItemCurr > posItemPrev) {
      return posItemCurr;
    } else {
      return posItemPrev + SPACING;
    }
  } else {
    if (item && posItemCurr > posItemPrev && posItemCurr < posItemNext) {
      return posItemCurr;
    } else if (posItemPrev >= 0) {
      return (posItemNext + posItemPrev) / 2;
    } else {
      return posItemNext / 2;
    }
  }
};

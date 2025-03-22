import { cloneDeep, isEmpty } from "lodash";
import { generatePlaceholderCard } from "./formatters";
import { calculateItemPosition } from "./calculateItemPosition";

/**
 * Chuẩn hóa vị trí của tất cả các card trong danh sách.
 */
const normalizePositions = (cards) => {
  return cards.map((card, index) => ({
    ...card,
    position: calculateItemPosition(index, cards, card),
  }));
};

/**
 * Di chuyển card trong cùng một column.
 */
export const moveCardWithinSameColumn = async (
  column,
  activeCardId,
  overCardId,
  setOrderedColumns
) => {
  await Promise.resolve();
  setOrderedColumns((prevColumns) => {
    const nextColumns = cloneDeep(prevColumns);
    const targetColumn = nextColumns.find((col) => col.id === column.id);
    if (!targetColumn) return prevColumns;

    const validCards = targetColumn.cards.filter((c) => !c.FE_PlaceholderCard);
    const activeIndex = validCards.findIndex((c_1) => c_1.id === activeCardId);
    const overIndex = validCards.findIndex((c_2) => c_2.id === overCardId);

    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
      return prevColumns;
    }

    const [movedCard] = validCards.splice(activeIndex, 1);
    validCards.splice(overIndex, 0, movedCard);

    // Chuẩn hóa lại vị trí
    targetColumn.cards = normalizePositions(validCards);
    targetColumn.cardOrderIds = targetColumn.cards.map((c_3) => c_3.id);

    return nextColumns;
  });
};

/**
 * Di chuyển card giữa các column khác nhau.
 */
export const moveCardBetweenDifferentColumns = async (
  overColumn,
  overCardId,
  activeColumn,
  activeCardId,
  activeCardData,
  setOrderedColumns
) => {
  return Promise.resolve().then(() => {
    setOrderedColumns((prevColumns) => {
      const nextColumns = cloneDeep(prevColumns);
      const sourceColumn = nextColumns.find(
        (col) => col.id === activeColumn.id
      );
      const targetColumn = nextColumns.find((col) => col.id === overColumn.id);
      if (!sourceColumn || !targetColumn) return prevColumns;

      // Lấy card cần di chuyển
      const movedCard = sourceColumn.cards.find(
        (card) => card.id === activeCardId
      );
      if (!movedCard) return prevColumns;

      // Xóa card khỏi column nguồn
      sourceColumn.cards = sourceColumn.cards.filter(
        (card) => card.id !== activeCardId
      );
      if (isEmpty(sourceColumn.cards)) {
        sourceColumn.cards = [generatePlaceholderCard(sourceColumn)];
      }

      // Xác định vị trí mới trong column đích
      const targetCards = targetColumn.cards.filter(
        (c) => !c.FE_PlaceholderCard
      );
      let newIndex = targetCards.findIndex((c) => c.id === overCardId);
      newIndex = newIndex >= 0 ? newIndex : targetCards.length;

      // Cập nhật position dựa vào index mới
      movedCard.position = calculateItemPosition(
        newIndex,
        targetCards,
        movedCard
      );
      movedCard.columnId = targetColumn.id;

      // Chèn card vào vị trí mới
      targetCards.splice(newIndex, 0, movedCard);

      // Chuẩn hóa lại vị trí cho cả hai column
      targetColumn.cards = normalizePositions(targetCards);
      sourceColumn.cards = normalizePositions(sourceColumn.cards);

      targetColumn.cardOrderIds = targetColumn.cards.map((c) => c.id);
      sourceColumn.cardOrderIds = sourceColumn.cards.map((c) => c.id);

      return nextColumns;
    });
  });
};

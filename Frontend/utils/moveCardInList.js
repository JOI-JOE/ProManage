import { cloneDeep, isEmpty } from "lodash";
import { generatePlaceholderCard } from "./formatters";
import { calculateItemPosition } from "./calculateItemPosition";
import { SPACING } from "./position.constant";

/**
 * Di chuyển card trong cùng một column.
 * Sau khi di chuyển, tính lại giá trị `position` cho tất cả các card theo thứ tự mới.
 */
export const moveCardWithinSameColumn = (
  column,
  activeCardId,
  overCardId,
  setOrderedColumns
) => {
  return new Promise((resolve) => {
    setOrderedColumns((prevColumns) => {
      const nextColumns = cloneDeep(prevColumns);
      const targetColumn = nextColumns.find((col) => col.id === column.id);
      if (!targetColumn) return prevColumns;

      // Lọc bỏ placeholder cards
      const validCards = targetColumn.cards.filter(
        (c) => !c.FE_PlaceholderCard
      );

      // Tìm và di chuyển card
      const activeIndex = validCards.findIndex((c) => c.id === activeCardId);
      const overIndex = validCards.findIndex((c) => c.id === overCardId);
      if (activeIndex === -1 || overIndex === -1) return prevColumns;

      const [movedCard] = validCards.splice(activeIndex, 1);
      validCards.splice(overIndex, 0, movedCard);

      // Tính toán lại position cho tất cả các card
      const updatedCards = validCards.map((card, index) => ({
        ...card,
        position: calculateItemPosition(index, validCards, card),
      }));

      // Giữ lại placeholder nếu cần
      targetColumn.cards = targetColumn.cards.some((c) => c.FE_PlaceholderCard)
        ? [...updatedCards, generatePlaceholderCard(targetColumn)]
        : updatedCards;

      targetColumn.cardOrderIds = updatedCards.map((c) => c.id);

      resolve(
        updatedCards.map((card) => ({
          id: card.id,
          position: card.position,
          list_board_id: column.id,
        }))
      );

      return nextColumns;
    });
  });
};

/**
 * Di chuyển card giữa các column khác nhau.
 * Quá trình này thực hiện:
 *  - Loại bỏ card khỏi column nguồn.
 *  - Nếu column nguồn rỗng sau khi loại bỏ, thêm một placeholder.
 *  - Xác định vị trí chèn trong column đích và tính position mới cho card chuyển.
 *  - Sau đó, cập nhật lại position cho các card trong cả column nguồn và đích.
 */
export const moveCardBetweenDifferentColumns = (
  overColumn,
  overCardId,
  activeColumn,
  activeCardId,
  activeCardData,
  setOrderedColumns
) => {
  return new Promise((resolve) => {
    setOrderedColumns((prevColumns) => {
      const nextColumns = cloneDeep(prevColumns);
      const sourceColumn = nextColumns.find(
        (col) => col.id === activeColumn.id
      );
      const targetColumn = nextColumns.find((col) => col.id === overColumn.id);

      if (!sourceColumn || !targetColumn) return prevColumns;

      // 1. Xử lý column nguồn
      const movedCard = sourceColumn.cards.find(
        (card) => card.id === activeCardId
      );
      sourceColumn.cards = sourceColumn.cards.filter(
        (card) => card.id !== activeCardId
      );

      // Thêm placeholder nếu column trống
      if (isEmpty(sourceColumn.cards)) {
        sourceColumn.cards = [generatePlaceholderCard(sourceColumn)];
      }

      // 2. Xử lý column đích
      const targetCards = targetColumn.cards.filter(
        (c) => !c.FE_PlaceholderCard
      );
      let newIndex = targetCards.findIndex((c) => c.id === overCardId);
      newIndex = newIndex >= 0 ? newIndex : targetCards.length;

      // Tính toán position mới
      const newPosition = calculateItemPosition(newIndex, targetCards, movedCard);

      // 3. Cập nhật card di chuyển
      const updatedCard = {
        ...movedCard,
        columnId: targetColumn.id,
        position: newPosition,
      };

      // 4. Chèn vào vị trí chính xác
      targetColumn.cards = [
        ...targetCards.slice(0, newIndex),
        updatedCard,
        ...targetCards.slice(newIndex),
      ];

      // 5. Chuẩn hóa position cho cả hai column
      const normalizePosition = (cards) => {
        return cards.map((card, index) => ({
          ...card,
          position: calculateItemPosition(index, cards, card),
        }));
      };

      targetColumn.cards = normalizePosition(targetColumn.cards);
      sourceColumn.cards = normalizePosition(sourceColumn.cards);

      // 6. Cập nhật order IDs
      targetColumn.cardOrderIds = targetColumn.cards.map((c) => c.id);
      sourceColumn.cardOrderIds = sourceColumn.cards.map((c) => c.id);

      const changedCards = [
        {
          id: activeCardId,
          position: newPosition,
          list_board_id: targetColumn.id,
        },
        ...targetColumn.cards.map((card) => ({
          id: card.id,
          position: card.position,
          list_board_id: targetColumn.id,
        })),
        ...sourceColumn.cards.map((card) => ({
          id: card.id,
          position: card.position,
          list_board_id: sourceColumn.id,
        })),
      ];

      resolve(changedCards);
      return nextColumns;
    });
  });
};

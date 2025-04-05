  import { cloneDeep, isEmpty } from "lodash";
  import { generatePlaceholderCard } from "./formatters";
  import { calculateItemPosition } from "./calculateItemPosition";

  /**
   * Di chuyển card trong cùng một column với xử lý position số lẻ
   */
  export const moveCardWithinSameColumn = async (
    overList,
    overCardId,
    activeList,
    activeCardId,
    activeData,
    setOrderedLists
  ) => {
    try {
      await Promise.resolve();

      setOrderedLists((prevLists) => {
        const nextLists = cloneDeep(prevLists);
        const targetList = nextLists.find((list) => list.id === overList.id);
        if (!targetList) return prevLists;

        const validCards = targetList.cards.filter((c) => !c.FE_PlaceholderCard);
        const activeIndex = validCards.findIndex((c) => c.id === activeCardId);
        const overIndex = validCards.findIndex((c) => c.id === overCardId);

        if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
          return prevLists;
        }

        // Tạo bản sao cards để thao tác (loại bỏ card đang di chuyển)
        const cardsWithoutActive = validCards.filter(
          (c) => c.id !== activeCardId
        );

        // Tính toán vị trí mới sử dụng calculateItemPosition
        const newPosition = calculateItemPosition(
          overIndex,
          validCards,
          validCards.find((c) => c.id === activeCardId)
        );

        // Cập nhật position cho card di chuyển
        const updatedCards = validCards.map((card) => {
          if (card.id === activeCardId) {
            return {
              ...card,
              position: newPosition,
            };
          }
          return card;
        });

        // Sắp xếp lại cards theo position
        targetList.cards = updatedCards.sort((a, b) => a.position - b.position);

        return nextLists;
      });
    } catch (error) {
      console.error("Error in moveCardWithinSameColumn:", error);
      throw error;
    }
  };

  /**
   * Di chuyển card giữa các column khác nhau với xử lý position số lẻ
   */
  export const moveCardBetweenDifferentColumns = async (
    overColumn,
    overCardId,
    activeColumn,
    activeCardId,
    activeCardData,
    setOrderedLists
  ) => {
    try {
      await Promise.resolve();

      setOrderedLists((prevLists) => {
        const nextLists = cloneDeep(prevLists);
        const sourceList = nextLists.find((list) => list.id === activeColumn.id);
        const targetList = nextLists.find((list) => list.id === overColumn.id);

        if (!sourceList || !targetList) return prevLists;

        // Lấy card di chuyển
        const movedCard = sourceList.cards.find((c) => c.id === activeCardId);
        if (!movedCard) return prevLists;

        // Xóa card khỏi list nguồn
        sourceList.cards = sourceList.cards.filter((c) => c.id !== activeCardId);
        if (isEmpty(sourceList.cards)) {
          sourceList.cards = [generatePlaceholderCard(sourceList)];
        }

        // Xác định vị trí mới trong list đích
        const targetCards = targetList.cards.filter((c) => !c.FE_PlaceholderCard);
        let newIndex = targetCards.findIndex((c) => c.id === overCardId);
        newIndex = newIndex >= 0 ? newIndex : targetCards.length;

        // Tính position mới với calculateItemPosition
        const newPosition = calculateItemPosition(
          newIndex,
          targetCards,
          movedCard
        );

        // Tạo card mới với position được tính toán
        const newCard = {
          ...movedCard,
          position: newPosition,
          list_board_id: targetList.id,
        };

        // Chèn vào list đích và sắp xếp
        targetList.cards.push(newCard);
        targetList.cards = targetList.cards
          .filter((c) => !c.FE_PlaceholderCard)
          .sort((a, b) => a.position - b.position);

        // Sắp xếp lại list nguồn
        sourceList.cards = sourceList.cards.sort(
          (a, b) => a.position - b.position
        );

        return nextLists;
      });
    } catch (error) {
      console.error("Error in moveCardBetweenDifferentColumns:", error);
      throw error;
    }
  };

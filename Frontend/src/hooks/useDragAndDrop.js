import { useState, useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";

const useDragAndDrop = (
  orderedLists,
  setOrderedLists,
  boardId,
  reorderLists,
  updateCardPosition
) => {
  const [activeItem, setActiveItem] = useState(null); // State để lưu trữ item đang được kéo

  const handleDragStart = useCallback(
    (event) => {
      const { active } = event;
      const activeData = active.data.current;
      if (!activeData) return;

      // Kiểm tra nếu phần tử kéo là một column
      if (activeData.type === "column") {
        const activeColumn = orderedLists.find((col) => col.id === active.id);
        if (activeColumn) {
          setActiveItem({ type: "column", item: activeColumn }); // Lưu column đang kéo
        }
      }
      // Kiểm tra nếu phần tử kéo là một card
      else if (activeData.type === "card") {
        const activeCard = orderedLists
          .flatMap((list) => list.cards || [])
          .find((card) => card.id === active.id);
        if (activeCard) {
          setActiveItem({ type: "card", item: activeCard }); // Lưu card đang kéo
        }
      }
    },
    [orderedLists]
  );

  const handleColumnDragEnd = useCallback(
    async (active, over) => {
      if (!over) return;

      const activeIndex = orderedLists.findIndex((col) => col.id === active.id);
      const overIndex = orderedLists.findIndex((col) => col.id === over.id);
      if (activeIndex === -1 || overIndex === -1) return;

      const newOrderedLists = arrayMove(orderedLists, activeIndex, overIndex);
      setOrderedLists(newOrderedLists);

      try {
        await reorderLists({
          boardId,
          updatedPositions: newOrderedLists.map((list, index) => ({
            id: list.id,
            position: (index + 1) * 65535,
          })),
        });
      } catch (error) {
        console.error("Lỗi khi cập nhật vị trí column:", error);
      }
    },
    [orderedLists, setOrderedLists, boardId, reorderLists]
  );

  const handleCardDragEnd = useCallback(
    async (active, over) => {
      if (!over) return;

      const activeCard = orderedLists
        .flatMap((list) => list.cards || [])
        .find((card) => card.id === active.id);
      if (!activeCard) return;

      const overList = orderedLists.find((list) =>
        list.cards.some((card) => card.id === over.id)
      );
      if (!overList) return;

      const updatedLists = orderedLists.map((list) => {
        if (list.id === overList.id) {
          return {
            ...list,
            cards: arrayMove(
              list.cards.filter((card) => card.id !== activeCard.id),
              0,
              list.cards.length
            ),
          };
        }
        return list;
      });

      setOrderedLists(updatedLists);

      try {
        await useUpdateCardPosition;
        ({
          cardId: activeCard.id,
          sourceListId: activeCard.list_board_id,
          targetListId: overList.id,
          newPosition: overList.cards.length + 1,
          boardId: boardId,
        });
      } catch (error) {
        console.error("Lỗi khi cập nhật vị trí card:", error);
        setOrderedLists(orderedLists);
      }
    },
    [orderedLists, setOrderedLists, boardId, updateCardPosition]
  );

  const handleDragEnd = useCallback(
    async (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      if (activeItem?.type === "column") {
        await handleColumnDragEnd(active, over);
      } else if (activeItem?.type === "card") {
        await handleCardDragEnd(active, over);
      }

      setActiveItem(null); // Reset activeItem sau khi kéo thả
    },
    [activeItem, handleColumnDragEnd, handleCardDragEnd]
  );

  return {
    handleDragStart,
    handleDragEnd,
    activeItem, // Trả về activeItem để sử dụng trong DragOverlay
  };
};

export default useDragAndDrop;

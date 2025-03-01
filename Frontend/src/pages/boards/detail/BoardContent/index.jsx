import { Box } from "@mui/material";
import { DndContext } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ListColumns from "./ListColumns/ListColumns";
import BoardBar from "./BoardBar";
import { useLists } from "../../../../hooks/useList";
// import { updateCardPositions } from "../../../../api/cards";
// import { useCardByList, useUpdateCardPositions } from "../../../../hooks/useCard";
import { updateCardPositions } from "../../../../api/models/cardsApi";
import { mapOrder } from "../../../../../utils/sort";
import {
  useCardByList,
  useUpdateCardPositions,
} from "../../../../hooks/useCard";

// const ACTIVE_DRAG_ITEM_TYPE = {
//   COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
//   CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
// };
//  Import API cập nhật vị trí card


const BoardContent = () => {
  const { boardId } = useParams();
  const queryClient = useQueryClient();
  const { data: lists, isLoading, error, reorderLists } = useLists(boardId);
  const updateCardPosition = useUpdateCardPositions();

  const [orderedColumns, setOrderedColumns] = useState([]);

  const lastOverId = useRef(null);

  const draggedCardRef = useRef(null);

  // console.log("🛠 list:", lists);

  useEffect(() => {
    if (lists) {
      setOrderedColumns(lists);
    }
  }, [lists]);

  const handleDragStart = (event) => {
    const { active } = event;
    if (!active) return;

    const activeIdCard = active.id.toString(); // ID của card đang kéo
    const activeIdColumn = active.data.current.columnId; // ID của column chứa card

    // Tìm danh sách chứa card đang kéo
    const oldListBeForeDrag = lists.find(
      (list) => list.id.toString() === String(activeIdColumn)
    );
    console.log("🔥 oldListBeForeDrag:", oldListBeForeDrag);

    if (!oldListBeForeDrag) {
      console.error("⚠️ Không tìm thấy danh sách chứa card!");
      return;
    }

    /// Tìm được thẻ đang kéo
    const activePosition = oldListBeForeDrag.cards.find(
      (card) => card.id.toString() === activeIdCard
    );

    // const activePosition = oldListBeForeDrag.cards.findIndex(
    //   (card) => card.id.toString() === activeIdCard
    // );

    // Tìm vị trí thực tế của card trong danh sách
    const activePositionTrue = activePosition.position;
    console.log("🔥 activePosition:", activePositionTrue);

    if (activePosition === -1) {
      console.error("⚠️ Không tìm thấy card trong danh sách!");
      return;
    }

    // Lưu thông tin vào ref
    draggedCardRef.current = {
      id: activeIdCard,
      position: activePosition.position, // Index thực tế trong danh sách
      columnId: activeIdColumn,
    };

    console.log("🔥 Card đang kéo:", {
      activeIdCard,
      activePositionTrue,
      activeIdColumn,
    });
    // console.log("🔥 draggedCardRef:", draggedCardRef.current);
  };

  const handleDragOver = (event) => {
    
    const { over,active } = event;
  
  
  }

  // Hàm xử lý kéo thả
  const handleDragEnd = useCallback(
    async (event) => {
      const { active, over } = event;

      if (!active || !over || active.id === over.id) return;

      // Kiểm tra xem phần tử bị kéo là column hay card
      const activeId = active.id.toString();
      const overId = over.id.toString();
      // console.log('das:',overId);

      // Kéo thả trong danh sách (List)
      const oldIndex = lists.findIndex(
        (list) => list.id.toString() === activeId
      );
      const newIndex = lists.findIndex((list) => list.id.toString() === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const updatedLists = arrayMove(lists, oldIndex, newIndex);

        // Cập nhật cache ngay lập tức (Optimistic Update)
        queryClient.setQueryData(["boardLists", boardId], updatedLists);

        const updatedPositions = updatedLists.map((list, index) => ({
          id: list.id,
          position: index + 1,
        }));

        console.log("🛠 Gửi lên API danh sách:", updatedPositions);

        try {
          await reorderLists({ boardId, updatedPositions });
          console.log("✅ Cập nhật danh sách thành công");
        } catch (error) {
          console.error("❌ Lỗi cập nhật danh sách:", error);
          queryClient.setQueryData(["boardLists", boardId], lists);
        }
      }

     /////////////////////// Xử lý kéo thả card /////////////////////
    /////////////////////// Xử lý kéo thả card /////////////////////
    const activeCardId = draggedCardRef.current.id;
    const activeCardPositionInList = draggedCardRef.current.position;
    //  console.log("🔥 activeIndex:", activeIndex);
    // Vị trí index của card đang kéo
    const overIndex = over.data.current?.sortable.index; // Vị trí index của card được kéo đến
    console.log(
      "🔥 Card ID đang kéo:",
      activeCardId,
      "🔥 Vị trí cũ:",
      activeCardPositionInList,
      "➡ Vị trí mới:",
      overIndex
    );

    if (
      activeCardId === undefined ||
      overIndex === undefined ||
      activeCardId === overIndex
    ) {
      console.warn("⚠️ Không có thay đổi vị trí, dừng xử lý.");
      return;
    }

    // Tìm danh sách chứa card đang kéo
    const oldList = orderedColumns.find(
      (list) =>
        list.id.toString() === String(draggedCardRef.current?.columnId)
    );
    // console.log("🔥 oldList:", oldList);

    if (!oldList) return;

    // Lấy danh sách card
    const newCards = [...oldList.cards];
    // console.log("🔥 newCards:", newCards);

    // Tìm vị trí thực tế của card trong danh sách (tránh lỗi do danh sách thay đổi)
    const actualMovedCardIndex = newCards.findIndex(
      (card) => card.id.toString() === activeCardId
    );
    const actualMovedCard = newCards.find(
      (card) => card.id.toString() === activeCardId
    );

    // console.log("🔥 actualMovedCard:", actualMovedCard);

    if (actualMovedCardIndex === -1 || !actualMovedCard) {
      console.error("⚠️ Không tìm thấy card để di chuyển!");
      return;
    }

    // Xóa card khỏi vị trí cũ
    newCards.splice(actualMovedCardIndex, 1);

    // Chèn vào vị trí mới
    newCards.splice(overIndex, 0, actualMovedCard);

    // Cập nhật lại position cho tất cả các card
    const updatedCards = newCards.map((card, index) => {
      return {
        ...card,
        position: index + 1, // Đảm bảo position duy nhất
      };
    });
    

    // Cập nhật state danh sách cột
    const updatedColumns = orderedColumns.map((list) =>
      list.id === oldList.id ? { ...list, cards: updatedCards } : list
    );

    // console.log("🛠 updatedColumns:", updatedColumns);

    // Cập nhật state với setTimeout để tránh lag UI khi kéo thả nhanh
    requestAnimationFrame(() => {
      setOrderedColumns(updatedColumns);
    });

    // Gọi API cập nhật vị trí
    try {
      await updateCardPosition.mutateAsync({
        cardId: actualMovedCard.id,
        newListId: oldList.id,
        newPosition: overIndex,
      });
      console.log("✅ API cập nhật vị trí thành công:", {
        cardId: actualMovedCard.id,
        newListId: oldList.id,
        newPosition: overIndex,
      });
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật vị trí:", error);
    }
    
    },
    [
      boardId,
      lists,
      queryClient,
      reorderLists,
      updateCardPosition,
      orderedColumns,
    ]
  );

  const memoizedLists = useMemo(() => lists, [lists]);

  if (isLoading) return <p>Đang tải danh sách...</p>;
  if (error) return <p>Lỗi: {error.message}</p>;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Box
        sx={{
          backgroundColor: "primary.main",
          height: (theme) => theme.trello.boardContentHeight,
          padding: "18px 0 7px 0px",
        }}
      >
        <ListColumns lists={memoizedLists} />
      </Box>
    </DndContext>

  );
};

export default BoardContent;

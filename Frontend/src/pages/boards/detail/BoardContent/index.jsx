import { Box } from "@mui/material";
import { DndContext } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ListColumns from "./ListColumns/ListColumns";
import { useLists } from "../../../../hooks/useList";
// import { updateCardPositions } from "../../../../api/cards";
import { useCardByList } from "../../../../hooks/useCard";
import { updateCardPositions } from "../../../../api/models/cardsApi";
import { mapOrder } from "../../../../../utils/sort";

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
  CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};
 // Import API cập nhật vị trí card

const BoardContent = () => {
  const { boardId } = useParams();
  const queryClient = useQueryClient();
  const { data: lists, isLoading, error, reorderLists } = useLists(boardId);
  // const { cards, isLoadingCard, errorCard, moveCard } = useCardByList(listId);


  const [orderedColumns, setOrderedColumns] = useState([]);
  const [activeDragItemId, setActiveDragItemId] = useState(null);
  const [activeDragItemType, setActiveDragItemType] = useState(null);
  const [activeDragItemData, setActiveDragItemData] = useState(null);
  const [oldColumnDraggingCard, setOldColumnDraggingCard] = useState(null);
  const lastOverId = useRef(null);



  console.log("🛠 list:", lists);

//   useEffect(() => {
//     if (lists) {
//       // console.log(lists)
//         setOrderedColumns(mapOrder(lists, lists.map(list => list.id), "id"));
//     }
// }, [lists]);

// const findColumnByCardId = (cardId) => {
//   return orderedColumns.find((column) =>
//       column?.cards?.map((card) => card.id)?.includes(cardId)
//   );
// };

// const moveCardBetweenDifferentColumns = (overColumn, overCardId, active, over, activeColumn, activeCardId, activeCardData) => {
//   setOrderedColumns((prevColumns) => {
//       const overCardIndex = overColumn?.cards?.findIndex((card) => card.id === overCardId);
//       let newCardIndex;
//       const isBelowOverItem = active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
//       const modifier = isBelowOverItem ? 1 : 0;
//       newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1;

//       const nextColumns = cloneDeep(prevColumns);
//       const nextActiveColumn = nextColumns.find((column) => column.id === activeColumn.id);
//       const nextOverColumn = nextColumns.find((column) => column.id === overColumn.id);

//       if (nextActiveColumn) {
//           nextActiveColumn.cards = nextActiveColumn.cards.filter((card) => card.id !== activeCardId);
//       }

//       if (nextOverColumn) {
//           nextOverColumn.cards = nextOverColumn.cards.filter((card) => card.id !== activeCardId);
//           const rebuild_activeCardData = { ...activeCardData, list_board_id: nextOverColumn.id };
//           nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeCardData);
//       }

//       return nextColumns;
//   });
// };

// const handleDragStart = (event) => {
//   setActiveDragItemId(event?.active?.id);
//   setActiveDragItemType(event?.active?.data?.current?.list_board_id ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN);
//   setActiveDragItemData(event?.active?.data?.current);
//   if (event?.active?.data?.current?.list_board_id) {
//       setOldColumnDraggingCard(findColumnByCardId(event?.active?.id));
//   }
// };

const handleDragOver = (event) => {
  if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return;
  const { active, over } = event;
  if (!active || !over) return;
  const { id: activeCardId, data: { current: activeCardData } } = active;
  const { id: overCardId } = over;
  const activeColumn = findColumnByCardId(activeCardId);
  const overColumn = findColumnByCardId(overCardId);
  if (!activeColumn || !overColumn) return;
  if (activeColumn.id !== overColumn.id) {
      moveCardBetweenDifferentColumns(overColumn, overCardId, active, over, activeColumn, activeCardId, activeCardData);
  }
};

  // Hàm xử lý kéo thả
  const handleDragEnd = useCallback(
    async (event) => {
      const { active, over } = event;
      if (!active || !over || active.id === over.id) return;

      // Kiểm tra xem phần tử bị kéo là column hay card
      const activeId = active.id.toString();
      const overId = over.id.toString();

      // Kéo thả trong danh sách (List)
      const oldIndex = lists.findIndex((list) => list.id.toString() === activeId);
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

  //     if(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD){
  //       const { id: activeCardId, data: { current: activeCardData } } = active;
  //       const { id: overCardId } = over;
  //       const activeColumn = findColumnByCardId(activeCardId);
  //       const overColumn = findColumnByCardId(overCardId);
  //       if (!activeColumn || !overColumn) return;

  //       if (oldColumnDraggingCard.id !== overColumn.id) {
  //           moveCardBetweenDifferentColumns(overColumn, overCardId, active, over, activeColumn, activeCardId, activeCardData);
  //           try {
  //               await updateCardPositions({ card_id: activeCardId, new_position: overColumn.cards.findIndex(c => c.id === overCardId) + 1, new_list_board_id: overColumn.id });
  //               console.log("✅ Cập nhật vị trí card giữa 2 danh sách thành công");
  //           } catch (error) {
  //               console.error("❌ Lỗi cập nhật vị trí card:", error);
  //               queryClient.setQueryData(["cards", activeColumn.id], activeColumn.cards);
  //               queryClient.setQueryData(["cards", overColumn.id], overColumn.cards);
  //           }
  //       } else {
  //           const oldCardIndex = oldColumnDraggingCard?.cards?.findIndex(c => c.id === activeDragItemId);
  //           const newCardIndex = overColumn?.cards?.findIndex(c => c.id === overCardId);
  //           if (oldCardIndex !== -1 && newCardIndex !== -1) {
  //               const updatedCards = arrayMove(cloneDeep(oldColumnDraggingCard.cards), oldCardIndex, newCardIndex); // Use cloneDeep
  //               setOrderedColumns((prevColumns) => {
  //                   const nextColumns = cloneDeep(prevColumns);
  //                   const targetColumn = nextColumns.find(col => col.id === overColumn.id);
  //                   if (targetColumn) {
  //                       targetColumn.cards = updatedCards;
  //                   }
  //                   return nextColumns;
  //               });
  //               try {
  //                   await updateCardPositions({ listId: overColumn.id, updatedCardPositions: updatedCards.map((card, index) => ({ id: card.id, position: index + 1 })) });
  //                   console.log("✅ Cập nhật vị trí card thành công");
  //               } catch (error) {
  //                   console.error("❌ Lỗi cập nhật vị trí card:", error);
  //     }
  //   }
  // }






  //     ///////////////////Card////////////

  //   // Xác định danh sách chứa card trước và sau khi kéo thả
  //   // let sourceList = null;
  //   // let destinationList = null;
  //   // //  
  //   // lists.forEach((list) => {
  //   //   if (Array.isArray(list.cards) && list.cards.some((card) => card.id.toString() === activeId)) {
  //   //     sourceList = list;
  //   //   }
  //   //   if (Array.isArray(list.cards) && list.cards.some((card) => card.id.toString() === overId)) {
  //   //     destinationList = list;
  //   //   }
  //   // });
    
  //   // if (!sourceList || !destinationList) return;

  //   // const oldCardIndex = sourceList.cards.findIndex((card) => card.id.toString() === activeId);
  //   // const newCardIndex = destinationList.cards.findIndex((card) => card.id.toString() === overId);

  //   // // Nếu kéo thả trong cùng một danh sách
  //   // if (sourceList.id === destinationList.id) {
  //   //   if (oldCardIndex !== -1 && newCardIndex !== -1) {
  //   //     const updatedCards = arrayMove(sourceList.cards, oldCardIndex, newCardIndex);
        
  //   //     // Cập nhật cache ngay lập tức
  //   //     queryClient.setQueryData(["cards", sourceList.id], updatedCards);

  //   //     const updatedCardPositions = updatedCards.map((card, index) => ({
  //   //       id: card.id,
  //   //       position: index + 1,
  //   //     }));

  //   //     console.log("🛠 Gửi lên API vị trí card trong cùng danh sách:", updatedCardPositions);

  //   //     try {
  //   //       await updateCardPositions({ listId: sourceList.id, updatedCardPositions });
  //   //       console.log("✅ Cập nhật vị trí card thành công");
  //   //     } catch (error) {
  //   //       console.error("❌ Lỗi cập nhật vị trí card:", error);
  //   //       queryClient.setQueryData(["cards", sourceList.id], sourceList.cards);
  //   //     }
  //   //   }
  //   // } else {
  //   //   // Nếu kéo thả giữa hai danh sách khác nhau
  //   //   const movedCard = sourceList.cards.find((card) => card.id.toString() === activeId);
  //   //   if (!movedCard) return;

  //   //   // Xóa card khỏi danh sách cũ và thêm vào danh sách mới
  //   //   const updatedSourceCards = sourceList.cards.filter((card) => card.id.toString() !== activeId);
  //   //   const updatedDestinationCards = [
  //   //     ...destinationList.cards.slice(0, newCardIndex),
  //   //     { ...movedCard, list_board_id: destinationList.id },
  //   //     ...destinationList.cards.slice(newCardIndex),
  //   //   ];

  //   //   // Cập nhật cache React Query
  //   //   queryClient.setQueryData(["cards", sourceList.id], updatedSourceCards);
  //   //   queryClient.setQueryData(["cards", destinationList.id], updatedDestinationCards);

  //   //   // Gửi API cập nhật vị trí mới
  //   //   try {
  //   //     await updateCardPositions({
  //   //       card_id: movedCard.id,
  //   //       new_position: newCardIndex + 1,
  //   //       new_list_board_id: destinationList.id,
  //   //     });
  //   //     console.log("✅ Cập nhật vị trí card giữa 2 danh sách thành công");
  //   //   } catch (error) {
  //   //     console.error("❌ Lỗi cập nhật vị trí card:", error);
  //   //     queryClient.setQueryData(["cards", sourceList.id], sourceList.cards);
  //   //     queryClient.setQueryData(["cards", destinationList.id], destinationList.cards);
  //   //   }
  //   // }
  // }
},
    [boardId, lists, queryClient, reorderLists]
  );

  const memoizedLists = useMemo(() => lists, [lists]);

  if (isLoading) return <p>Đang tải danh sách...</p>;
  if (error) return <p>Lỗi: {error.message}</p>;

  return (
    <DndContext onDragEnd={handleDragEnd}>
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

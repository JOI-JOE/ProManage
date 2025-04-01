import { Box } from "@mui/material";
import { cloneDeep } from "lodash";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  pointerWithin,
  closestCenter,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useRef, useState } from "react";
import Col from "./Columns/Col";
import Col_list from "./Columns/Col_list";
import BoardBar from "./BoardBar/index";
import C_ard from "./Cards/C_ard";
import { moveCardBetweenDifferentColumns, moveCardWithinSameColumn } from "../../../../../utils/moveCardInList";
import { calculateItemPosition } from "../../../../../utils/calculateItemPosition";
import { useUpdatePositionList } from "../../../../hooks/useList";
import { useUpdateCardPosition } from "../../../../hooks/useCard";
import { useParams } from "react-router-dom";
import { useBoard } from "../../../../contexts/BoardContext";


const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
  CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};

const BoardContent = () => {
  const { boardId } = useParams();
  const { board, listData, isLoading, error } = useBoard()
  console.log(board)

  const updatePositionListMutation = useUpdatePositionList();
  const updateCardPositionMutation = useUpdateCardPosition();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }), // Giảm độ nhạy xuống 5px
    useSensor(TouchSensor, { activationConstraint: { delay: 0, tolerance: 0 } }) // Thêm delay nhỏ cho cảm ứng
  );

  const [orderedLists, setOrderedLists] = useState([]);
  const [activeDragItemId, setActiveDragItemId] = useState(null);
  const [activeDragItemType, setActiveDragItemType] = useState(null);
  const [activeDragItemData, setActiveDragItemData] = useState(null);
  const [oldListDraggingCard, setOldListDraggingCard] = useState(null);
  const [initialLists, setInitialLists] = useState([]);
  const initialActiveRef = useRef(null);
  const initialOverRef = useRef(null);

  // Reset tất cả trạng thái khi boardId thay đổi
  // Reset tất cả trạng thái khi boardId thay đổi
  useEffect(() => {
    setOrderedLists([]);
    setActiveDragItemId(null);
    setActiveDragItemType(null);
    setActiveDragItemData(null);
    setOldListDraggingCard(null);
    setInitialLists([]);
    initialActiveRef.current = null;
    initialOverRef.current = null;
  }, [boardId]);

  // Transform listData into orderedLists with cards
  useEffect(() => {
    if (isLoading) {
      setOrderedLists([]);
      return;
    }

    if (error) {
      setOrderedLists([]);
      return;
    }

    if (!listData?.lists?.length) {
      setOrderedLists([]);
      return;
    }

    const sortedLists = [...listData.lists].sort((a, b) => parseFloat(a.position) - parseFloat(b.position));
    const listsWithCards = sortedLists.map((list) => {
      let listCards = [];

      if (Array.isArray(listData?.cards)) {
        listCards = listData.cards
          .filter((card) => card.list_board_id === list.id)
          .map((card) => ({
            ...card,
            position: parseFloat(card.position),
            listId: card.list_board_id,
            boardId: card.boardId,
            memberId: card.memberId,
            labelId: card.labelId,
            closed: Boolean(card.closed),
            dueComplete: Boolean(card.dueComplete),
          }))
          .sort((a, b) => parseFloat(a.position) - parseFloat(b.position));
      } else {
        listCards = [];
      }

      return {
        ...list,
        cards: listCards,
        closed: Boolean(list.closed),
      };
    });
    setOrderedLists(listsWithCards);
  }, [listData, isLoading, error, boardId]);

  // Tìm list theo cardId
  const findListByCardId = (cardId) => {
    if (!cardId || !Array.isArray(orderedLists)) return null;

    return orderedLists.find(list =>
      list.cards.some(card => card.id === cardId)
    );
  };

  const handleDragStart = (event) => {
    const { active } = event;
    if (!active) return;

    initialActiveRef.current = active;
    initialOverRef.current = active;

    setActiveDragItemId(active.id);
    setActiveDragItemType(active?.data?.current?.list_board_id ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN);
    setActiveDragItemData(active?.data?.current);

    if (active?.data?.current?.list_board_id) {
      setOldListDraggingCard(findListByCardId(active.id));
    } else {
      setInitialLists(cloneDeep(orderedLists));
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!active || !over) return;

    if (over.id !== active.id) {
      initialOverRef.current = over;
    }

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      handleCardDragOver(active, over);
    } else if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      if (!initialLists.length) {
        setInitialLists([...orderedLists]);
      }
      handleColumnDragOver(active, over);
    }
  };

  const handleCardDragOver = (active, over) => {
    const activeList = findListByCardId(active.id);
    const overList = findListByCardId(over.id) || activeList;
    if (!activeList || !overList) return;

    if (activeList.id === overList.id) {
      moveCardWithinSameColumn(activeList, active.id, over.id, setOrderedLists)
        .then(() => { })
        .catch((error) => console.error("Error reordering cards:", error));
    } else {
      moveCardBetweenDifferentColumns(
        overList,
        over.id,
        activeList,
        active.id,
        active.data.current,
        setOrderedLists
      )
        .then(() => { })
        .catch((error) => console.error("Error moving card:", error));
    }
  };

  const handleColumnDragOver = (active, over) => {
    if (!over || !active) return;
    const activeListIndex = orderedLists.findIndex(list => list.id === active.id);
    const overListIndex = orderedLists.findIndex(list => list.id === over.id);
    if (activeListIndex === -1 || overListIndex === -1 || activeListIndex === overListIndex) return;

    const tempLists = arrayMove([...orderedLists], activeListIndex, overListIndex);
    setOrderedLists(tempLists);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      const effectiveActive = initialActiveRef.current;
      const effectiveOver = initialOverRef.current;

      const activeList = findListByCardId(active.id);
      const newIndex = activeList.cards.findIndex(c => c.id === effectiveActive.id);
      const draggedCard = activeList.cards[newIndex];

      updateCardPositionMutation.mutate({
        cardId: draggedCard.id,
        listId: draggedCard.list_board_id, // Sử dụng list_board_id thay vì columnId
        position: draggedCard.position,
      });
    }

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      const previousIndex = initialLists.findIndex(list => list.id === active.id);
      const newIndex = orderedLists.findIndex(list => list.id === over.id);

      if (previousIndex === -1 || newIndex === -1 || previousIndex === newIndex) {
        console.log("⚠️ Vị trí không hợp lệ hoặc không thay đổi, bỏ qua...");
        return;
      }

      let updatedLists = arrayMove([...initialLists], previousIndex, newIndex);
      const draggedList = initialLists.find(list => list.id === active.id);
      const newPosition = calculateItemPosition(newIndex, updatedLists, draggedList);

      updatePositionListMutation.mutate({
        listId: draggedList.id,
        position: newPosition,
      });

      setOrderedLists(updatedLists);
    }

    setActiveDragItemId(null);
    setActiveDragItemType(null);
    setActiveDragItemData(null);
    setOldListDraggingCard(null);
    setInitialLists([]);
    initialActiveRef.current = null;
    initialOverRef.current = null;
  };

  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          transition: 'none',
        },
        dragOverlay: {
          transition: 'none',
        },
      },
    }),
  };

  const customCollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    return pointerCollisions.length > 0 ? pointerCollisions : closestCenter(args);
  };
  return (
    <>
      <BoardBar />
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={(theme) => ({
            backgroundColor: "#1693E1",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            imageRendering: "auto",
            height: theme.trello.boardContentHeight,
            padding: "18px 0 7px 0px",
          })}
        >
          <Col_list columns={orderedLists} boardId={listData?.id} />
          <DragOverlay dropAnimation={customDropAnimation}>
            {!activeDragItemType && null}
            {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
              <Col column={activeDragItemData} />
            )}
            {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
              <C_ard card={activeDragItemData} />
            )}
          </DragOverlay>
        </Box>
      </DndContext>
    </>
  );
};

export default BoardContent
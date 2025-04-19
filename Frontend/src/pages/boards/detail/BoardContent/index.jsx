import { Box, Typography } from "@mui/material";
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
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Col from "./Columns/Col";
import Col_list from "./Columns/Col_list";
import BoardBar from "./BoardBar";
import C_ard from "./Cards/C_ard";
import { moveCardBetweenDifferentColumns, moveCardWithinSameColumn } from "../../../../../utils/moveCardInList";
import { calculateItemPosition } from "../../../../../utils/calculateItemPosition";
import { useUpdatePositionList } from "../../../../hooks/useList";
import { useUpdateCardById, useUpdateCardPosition } from "../../../../hooks/useCard";
import { useBoard } from "../../../../contexts/BoardContext";
import SendRequest from "./SendRequest";
import LogoLoading from "../../../../components/LogoLoading";
import { useParams } from "react-router-dom";

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
  CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};

const BoardContent = () => {
  const { boardId } = useParams();
  const { orderedLists, updateOrderedLists, isActive, isLoading, error, refetchListData } = useBoard();

  const updatePositionListMutation = useUpdatePositionList();
  const updateCardPositionMutation = useUpdateCardPosition();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const [dragState, setDragState] = useState({
    activeId: null,
    activeType: null,
    activeData: null,
    oldList: null,
    initialLists: [],
  });

  const initialActiveRef = useRef(null);
  const initialOverRef = useRef(null);

  useEffect(() => {
    setDragState({
      activeId: null,
      activeType: null,
      activeData: null,
      oldList: null,
      initialLists: [],
    });
    initialActiveRef.current = null;
    initialOverRef.current = null;
  }, [boardId]);

  const findListByCardId = useCallback(
    (cardId) => {
      return orderedLists.find(list => list.cards.some(card => card.id === cardId)) || null;
    },
    [orderedLists]
  );

  const findListById = useCallback(
    (listId) => {
      return orderedLists.find(list => list.id === listId) || null;
    },
    [orderedLists]
  );

  const handleDragStart = useCallback(
    (event) => {
      const { active } = event;
      if (!active) return;

      initialActiveRef.current = active;
      initialOverRef.current = active;

      const isCard = !!active?.data?.current?.list_board_id;
      setDragState({
        activeId: active.id,
        activeType: isCard ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN,
        activeData: active.data.current,
        oldList: isCard ? findListByCardId(active.id) : null,
        initialLists: !isCard ? cloneDeep(orderedLists) : [],
      });
    },
    [findListByCardId, orderedLists]
  );

  const handleCardDragOver = useCallback(
    (active, over) => {
      if (!active || !over) return;

      const activeList = findListByCardId(active.id);
      if (!activeList) return;

      let overList = null;
      let overCardId = null;

      console.log("handleCardDragOver - over:", over);

      // Xử lý khi over là card
      if (over.data.current?.type === "card") {
        overList = findListByCardId(over.id);
        overCardId = over.id;
      }
      // Xử lý khi over là column
      else if (over.data.current?.type === "column") {
        overList = findListById(over.id);
        overCardId = null; // Thêm vào cuối column
      }
      // Xử lý trường hợp không xác định được type (column trống)
      else {
        // Tìm column gần nhất dựa trên over.id
        overList = orderedLists.find(list =>
          list.cards.some(card => card.id === over.id) || list.id === over.id
        ) || null;
        overCardId = overList?.cards.some(card => card.id === over.id) ? over.id : null;
      }

      if (!overList) {
        console.log("handleCardDragOver - overList not found for over:", over);
        return;
      }

      console.log("handleCardDragOver - activeList:", activeList.id, "overList:", overList.id, "overCardId:", overCardId);

      const moveCard = activeList.id === overList.id ? moveCardWithinSameColumn : moveCardBetweenDifferentColumns;

      try {
        moveCard(
          overList,
          overCardId,
          activeList,
          active.id,
          active.data.current,
          updateOrderedLists
        );
      } catch (error) {
        console.error("Error in handleCardDragOver:", error);
      }
    },
    [findListByCardId, findListById, orderedLists, updateOrderedLists]
  );

  const handleColumnDragOver = useCallback(
    (active, over) => {
      if (!over || !active || !dragState.initialLists.length) return;

      const activeIndex = orderedLists.findIndex(list => list.id === active.id);
      const overIndex = orderedLists.findIndex(list => list.id === over.id);

      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return;

      updateOrderedLists(arrayMove([...orderedLists], activeIndex, overIndex));
    },
    [orderedLists, dragState.initialLists, updateOrderedLists]
  );

  const handleDragOver = useCallback(
    (event) => {
      const { active, over } = event;
      if (!active || !over || over.id === active.id) return;

      initialOverRef.current = over;

      if (dragState.activeType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
        handleCardDragOver(active, over);
      } else if (dragState.activeType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
        handleColumnDragOver(active, over);
      }
    },
    [dragState.activeType, handleCardDragOver, handleColumnDragOver]
  );

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over) return;

      const processDrag = async () => {
        if (dragState.activeType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
          const activeList = findListByCardId(active.id);
          if (activeList) {
            const newIndex = activeList.cards.findIndex(c => c.id === initialActiveRef.current.id);
            const draggedCard = activeList.cards[newIndex];

            await updateCardPositionMutation.mutateAsync({
              cardId: draggedCard.id,
              listId: draggedCard.list_board_id,
              position: draggedCard.position,
            });

            await refetchListData();
          }
        } else if (dragState.activeType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
          const previousIndex = dragState.initialLists.findIndex(list => list.id === active.id);
          const newIndex = orderedLists.findIndex(list => list.id === over.id);

          if (previousIndex !== -1 && newIndex !== -1 && previousIndex !== newIndex) {
            const draggedList = dragState.initialLists[previousIndex];
            const newPosition = calculateItemPosition(newIndex, dragState.initialLists, draggedList);

            await updatePositionListMutation.mutateAsync({
              listId: draggedList.id,
              position: newPosition,
            });

            await refetchListData();
          }
        }

        setDragState({
          activeId: null,
          activeType: null,
          activeData: null,
          oldList: null,
          initialLists: [],
        });
        initialActiveRef.current = null;
        initialOverRef.current = null;
      };

      processDrag();
    },
    [
      dragState,
      orderedLists,
      findListByCardId,
      updateCardPositionMutation,
      updatePositionListMutation,
      refetchListData,
    ]
  );

  const dropAnimation = useMemo(
    () => ({
      sideEffects: defaultDropAnimationSideEffects({
        styles: {
          active: { transition: "none" },
          dragOverlay: { transition: "none" },
        },
      }),
    }),
    []
  );

  const collisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    return closestCorners(args); // Sử dụng closestCorners thay vì closestCenter để nhận diện tốt hơn
  }, []);

  if (isLoading) return <LogoLoading />;
  if (isActive === "request_access") return <SendRequest />;


  return (
    <Box
      sx={{
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        imageRendering: "auto",
      }}
    >
      <BoardBar />
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={theme => ({
            height: theme.trello.boardContentHeight,
            padding: "18px 0 7px 0",
            display: "flex",
            overflowX: "auto",
          })}
        >
          <Col_list columns={orderedLists} boardId={boardId} />
          <DragOverlay dropAnimation={dropAnimation}>
            {dragState.activeType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
              <Col column={dragState.activeData} />
            )}
            {dragState.activeType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
              <C_ard card={dragState.activeData} />
            )}
          </DragOverlay>
        </Box>
      </DndContext>
    </Box>
  );
};

export default BoardContent;
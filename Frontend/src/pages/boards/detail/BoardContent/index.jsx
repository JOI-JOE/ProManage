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
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Col from "./Columns/Col";
import Col_list from "./Columns/Col_list";
import BoardBar from "./BoardBar";
import C_ard from "./Cards/C_ard";
import { moveCardBetweenDifferentColumns, moveCardWithinSameColumn } from "../../../../../utils/moveCardInList";
import { calculateItemPosition } from "../../../../../utils/calculateItemPosition";
import { useUpdatePositionList } from "../../../../hooks/useList";
import { useUpdateCardPosition } from "../../../../hooks/useCard";
import { useParams } from "react-router-dom";
import { useBoard } from "../../../../contexts/BoardContext";
import SendRequest from "./SendRequest";
import LogoLoading from "../../../../components/LogoLoading";

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
  CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};

const BoardContent = () => {
  const { boardId } = useParams();
  const { listData, isActive, boardLoading, listLoading, error } = useBoard();

  const updatePositionListMutation = useUpdatePositionList();
  const updateCardPositionMutation = useUpdateCardPosition();

  // Memoized sensors configuration
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 0, tolerance: 0 } })
  );

  const [orderedLists, setOrderedLists] = useState([]);
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
    setOrderedLists([]);
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

  useEffect(() => {
    if (listLoading) {
      // Reset if loading or error occurs
      if (orderedLists.length > 0) setOrderedLists([]);
      return;
    }

    // Ensure we have valid data structure
    const { lists = [], cards = [] } = listData || {};

    // If no lists or empty array
    if (!lists.length) {
      setOrderedLists([]);
      return;
    }

    // Process lists and cards
    const processedLists = lists
      .filter(list => !list.closed) // Filter out closed lists
      .sort((a, b) => a.position - b.position) // Sort lists by position
      .map(list => {
        const listCards = cards
          .filter(card => card.list_board_id === list.id && !card.is_archived) // Filter cards by list_id and not archived
          .sort((a, b) => a.position - b.position); // Sort cards by position
        return {
          ...list,
          cards: listCards
        };
      });

    setOrderedLists(processedLists);
  }, [listData, listLoading]);


  // Utility functions
  const findListByCardId = useCallback((cardId) => {
    return orderedLists.find(list =>
      list.cards.some(card => card.id === cardId)
    ) || null;
  }, [orderedLists]);

  // Drag handlers
  const handleDragStart = useCallback((event) => {
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
  }, [findListByCardId, orderedLists]);

  const handleCardDragOver = useCallback((active, over) => {
    // Tìm list chứa card đang được kéo
    const activeList = findListByCardId(active.id);
    if (!activeList) return;

    // Xác định list đích (overList)
    let overList;
    if (over.data.current?.listId) {
      // Nếu over là card, lấy listId từ data của nó
      overList = orderedLists.find(list => list.id === over.data.current.listId) || activeList;
    } else {
      // Nếu over là list, dùng trực tiếp ID của list
      overList = orderedLists.find(list => list.id === over.id) || activeList;
    }

    if (!overList) return;

    if (typeof setOrderedLists !== 'function') {
      console.error('setOrderedLists is not available');
      return;
    }
    const moveCard = activeList.id === overList.id
      ? moveCardWithinSameColumn
      : moveCardBetweenDifferentColumns;

    try {
      moveCard(
        overList,
        over.id,
        activeList,
        active.id,
        active.data.current,
        setOrderedLists
      );
    } catch (error) {
      console.error("Error moving card:", error);
    }
  }, [findListByCardId, orderedLists]);

  const handleColumnDragOver = useCallback((active, over) => {
    if (!over || !active || !dragState.initialLists.length) return;

    const activeIndex = orderedLists.findIndex(list => list.id === active.id);
    const overIndex = orderedLists.findIndex(list => list.id === over.id);

    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return;

    setOrderedLists(prev => arrayMove([...prev], activeIndex, overIndex));
  }, [orderedLists, dragState.initialLists]);

  const handleDragOver = useCallback((event) => {
    const { active, over } = event;
    if (!active || !over || over.id === active.id) return;

    initialOverRef.current = over;

    if (dragState.activeType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      handleCardDragOver(active, over);
    } else if (dragState.activeType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      handleColumnDragOver(active, over);
    }
  }, [dragState.activeType, handleCardDragOver, handleColumnDragOver]);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over) return;

    if (dragState.activeType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      const activeList = findListByCardId(active.id);
      const newIndex = activeList.cards.findIndex(c => c.id === initialActiveRef.current.id);
      const draggedCard = activeList.cards[newIndex];

      updateCardPositionMutation.mutate({
        cardId: draggedCard.id,
        listId: draggedCard.list_board_id,
        position: draggedCard.position,
      });

      console.log(draggedCard.position)
    } else if (dragState.activeType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      const previousIndex = dragState.initialLists.findIndex(list => list.id === active.id);
      const newIndex = orderedLists.findIndex(list => list.id === over.id);

      if (previousIndex !== -1 && newIndex !== -1 && previousIndex !== newIndex) {
        const draggedList = dragState.initialLists[previousIndex];
        const newPosition = calculateItemPosition(newIndex, dragState.initialLists, draggedList);

        updatePositionListMutation.mutate({
          listId: draggedList.id,
          position: newPosition,
        });
      }
    }
    // Reset drag state
    setDragState({
      activeId: null,
      activeType: null,
      activeData: null,
      oldList: null,
      initialLists: [],
    });
    initialActiveRef.current = null;
    initialOverRef.current = null;
  }, [dragState, orderedLists, findListByCardId, updateCardPositionMutation, updatePositionListMutation]);

  // Memoized configurations
  const dropAnimation = useMemo(() => ({
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: { transition: 'none' },
        dragOverlay: { transition: 'none' },
      },
    }),
  }), []);

  const collisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    return pointerCollisions.length > 0 ? pointerCollisions : closestCenter(args);
  }, []);

  // Loading and access states
  if (boardLoading || listLoading) return <LogoLoading />;
  if (isActive === 'request_access') return <SendRequest />;

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
        <Box sx={theme => ({
          height: theme.trello.boardContentHeight,
          padding: "18px 0 7px 0",
        })}>
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
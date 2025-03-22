import { Box } from "@mui/material";
import { cloneDeep, isEmpty, isEqual, over } from "lodash";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  pointerWithin,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Col from "./Columns/Col";
import Col_list from "./Columns/Col_list";
import BoardBar from "./BoardBar/index";
import { generatePlaceholderCard } from "../../../../../utils/formatters";
import { useParams } from "react-router-dom";
import C_ard from "./Cards/C_ard";
import { mapOrder } from "../../../../../utils/sort";
import BoardContext from "../../../../contexts/BoardContext";
import { moveCardBetweenDifferentColumns, moveCardWithinSameColumn } from "../../../../../utils/moveCardInList";
import { calculateItemPosition } from "../../../../../utils/calculateItemPosition";
import { useUpdatePositionList } from "../../../../hooks/useList";
import { useUpdateCardPosition } from "../../../../hooks/useCard";

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
  CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};

const BoardContent = () => {
  const { boardId } = useParams();
  const { board } = useContext(BoardContext);
  const updatePositionListMutation = useUpdatePositionList();
  const updateCardPositionMutation = useUpdateCardPosition();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 0 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 0, tolerance: 0 } })
  );

  const [orderedColumns, setOrderedColumns] = useState([]); // Lưu danh sách cột
  const [activeDragItemId, setActiveDragItemId] = useState(null); // ID của item đang kéo
  const [activeDragItemType, setActiveDragItemType] = useState(null); // Loại item đang kéo (CARD | COLUMN)
  const [activeDragItemData, setActiveDragItemData] = useState(null); // Dữ liệu của item đang kéo
  const [oldColumnDraggingCard, setOldColumnDraggingCard] = useState(null); // Column cũ khi kéo Card
  const [initialColumns, setInitialColumns] = useState([]); // Lưu trạng thái ban đầu của column trước khi kéo

  useEffect(() => {
    if (!board?.columns?.length) return;

    const columnOrderIds = board.columnOrderIds || board.columns.map(col => col.id);
    const newOrder = mapOrder(board.columns, columnOrderIds, "id");

    setOrderedColumns(prevColumns => (isEqual(prevColumns, newOrder) ? prevColumns : newOrder));
  }, [board, board?.columnOrderIds]);

  // Tìm column theo cardId
  const findColumnByCardId = (cardId) => {
    if (!cardId || !Array.isArray(orderedColumns)) return null;

    return (
      orderedColumns.find(col => col.id === cardId) ||
      orderedColumns.find(col => col.cards.some(card => card.id === cardId))
    );
  };

  const handleDragStart = (event) => {
    const { active } = event;
    if (!active) return;

    setActiveDragItemId(active.id);
    setActiveDragItemType(active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN);
    setActiveDragItemData(active?.data?.current);

    if (active?.data?.current?.columnId) {
      setOldColumnDraggingCard(findColumnByCardId(active.id));
    } else {
      setInitialColumns(cloneDeep(orderedColumns)); // Dùng cloneDeep để tránh mutation
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!active || !over) return;

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      handleCardDragOver(active, over);
    }
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      if (!initialColumns.length) {
        setInitialColumns([...orderedColumns]);
      }
      handleColumnDragOver(active, over);
    }
  };

  const handleCardDragOver = (active, over) => {
    const activeColumn = findColumnByCardId(active.id);
    const overColumn = findColumnByCardId(over.id);

    if (!activeColumn || !overColumn) return;

    if (activeColumn.id === overColumn.id) {
      moveCardWithinSameColumn(activeColumn, active.id, over.id, setOrderedColumns).catch((error) =>
        console.error("Error reordering cards:", error)
      );
    } else {
      moveCardBetweenDifferentColumns(overColumn, over.id, activeColumn, active.id, active.data.current, setOrderedColumns).catch((error) =>
        console.error("Error moving card:", error)
      );
    }
  };

  const handleColumnDragOver = (active, over) => {
    if (!over || !active) return;
    const activeColumnIndex = orderedColumns.findIndex(col => col.id === active.id);
    const overColumnIndex = orderedColumns.findIndex(col => col.id === over.id);
    if (activeColumnIndex === -1 || overColumnIndex === -1 || activeColumnIndex === overColumnIndex) return;
    // Chỉ hoán đổi vị trí UI tạm thời để hoạt ảnh mượt hơn
    const tempColumns = arrayMove([...orderedColumns], activeColumnIndex, overColumnIndex);
    setOrderedColumns(tempColumns);
  };


  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!active || !over) return;


    // 🔍 Cập nhật lại `overId` để đảm bảo nó không bị thay đổi từ onDragOver
    const overId = over.id === active.id ? null : over.id;

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      const activeColumn = findColumnByCardId(active.id);
      const overColumn = findColumnByCardId(over.id) || orderedColumns.find(col => col.id === over.id);

      if (!activeColumn || !overColumn) return;

      const draggedCard = activeColumn.cards.find(c => c.id === active.id);

      // updateCardPositionMutation.mutate({
      //   cardId: draggedCard.id,
      //   listId: draggedCard.columnId,
      //   position: draggedCard.position,
      // });
    }

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      console.log("🔄 Đang kéo thả column...");

      const previousIndex = initialColumns.findIndex(col => col.id === active.id);
      const newIndex = orderedColumns.findIndex(col => col.id === over.id);

      if (previousIndex === -1 || newIndex === -1 || previousIndex === newIndex) {
        console.log("⚠️ Vị trí không hợp lệ hoặc không thay đổi, bỏ qua...");
        return;
      }
      // Hoán đổi vị trí của các column theo thứ tự ban đầu
      let updatedColumns = arrayMove([...initialColumns], previousIndex, newIndex);
      // Lấy column đang kéo từ danh sách ban đầu
      const draggedColumn = initialColumns.find(col => col.id === active.id);
      // Tính toán vị trí mới dựa trên updatedColumns và newIndex.
      const newPosition = calculateItemPosition(newIndex, updatedColumns, draggedColumn);
      console.log("New Position:", newPosition);
      console.log("Dragged Column:", draggedColumn);

      updatePositionListMutation.mutate({
        listId: active.id,
        position: newPosition,
        boardId: board.id,
      });

      setOrderedColumns(updatedColumns);
    }


    setActiveDragItemId(null);
    setActiveDragItemType(null);
    setActiveDragItemData(null);
    setOldColumnDraggingCard(null);
    setInitialColumns([]);
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

  return (
    <>
      <BoardBar />
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={(theme) => ({
            background: board?.thumbnail
              ? board?.thumbnail.startsWith("#")
                ? board?.thumbnail
                : `url(${board?.thumbnail})`
              : "#1693E1",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            imageRendering: "auto",
            height: theme.trello.boardContentHeight, // Đặt giá trị height từ theme
            padding: "18px 0 7px 0px",
          })}
        >
          <Col_list columns={orderedColumns} boardId={boardId} />
          <DragOverlay dropAnimation={customDropAnimation}>
            {/* <DragOverlay> */}
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

export default BoardContent;

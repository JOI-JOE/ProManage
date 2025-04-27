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
import { MIN_SPACING } from "../../../../../utils/position.constant";
import LogoLoading from "../../../../components/Common/LogoLoading";

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
  CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};

const BoardContent = () => {
  const { boardId } = useParams();
  const { board, isLoadingBoard } = useContext(BoardContext);
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
  const [oldColumnDraggingCard, setOldColumnDraggingCard] = useState(null); // Column cũ khi kéo Cardo
  const [initialColumns, setInitialColumns] = useState([]); // Lưu trạng thái ban đầu của column trước khi kéo
  const initialActiveRef = useRef(null);
  const initialOverRef = useRef(null); // Thêm ref để lưu trữ over mới nhất

  useEffect(() => {
    if (!board?.columns?.length) {
      setOrderedColumns([]); // reset lại khi board không có column
      return;
    }

    const columnOrderIds = board.columnOrderIds || board.columns.map(col => col.id);
    const newOrder = mapOrder(board.columns, columnOrderIds, "id");

    setOrderedColumns(prevColumns =>
      isEqual(prevColumns, newOrder) ? prevColumns : newOrder
    );
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

    // Lưu active ban đầu
    // Lưu active ban đầu và mặc định initialOverRef là active
    initialActiveRef.current = active;
    initialOverRef.current = active;


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

    // Nếu over hợp lệ (over.id khác active.id) thì cập nhật initialOverRef
    if (over.id !== active.id) {
      initialOverRef.current = over;
    }

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      handleCardDragOver(active, over);
    } else if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      if (!initialColumns.length) {
        setInitialColumns([...orderedColumns]);
      }
      handleColumnDragOver(active, over);
    }
  };

  const handleCardDragOver = (active, over) => {
    const activeColumn = findColumnByCardId(active.id);
    // Ưu tiên tìm cột mục tiêu từ over.id; nếu không tìm thấy, dùng activeColumn
    const overColumn = findColumnByCardId(over.id) || activeColumn;
    if (!activeColumn || !overColumn) return;

    if (activeColumn.id === overColumn.id) {
      // Khi kéo thả trong cùng một cột, cập nhật UI ngay để sắp xếp lại các card
      moveCardWithinSameColumn(activeColumn, active.id, over.id, setOrderedColumns)
        .then(() => {
        })
        .catch((error) =>
          console.error("Error reordering cards:", error)
        );
    } else {
      // Khi chuyển card sang cột khác, cập nhật UI ngay bằng cách chuyển card
      moveCardBetweenDifferentColumns(
        overColumn,
        over.id,
        activeColumn,
        active.id,
        active.data.current,
        setOrderedColumns
      )
        .then(() => {
        })
        .catch((error) =>
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
    if (!over) return;

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // Lấy effective active và effective over từ ref (ban đầu)
      const effectiveActive = initialActiveRef.current;
      const effectiveOver = initialOverRef.current;

      const activeColumn = findColumnByCardId(active.id);

      console.log("Dữ liệu column", effectiveOver)
      console.log("Dữ liệu card", effectiveActive)

      console.log("dữ liệu của card", activeColumn.cards)
      const newIndex = activeColumn.cards.findIndex(c => c.id === effectiveActive.id);

      const draggedCard = activeColumn.cards[newIndex]

      updateCardPositionMutation.mutate({
        cardId: draggedCard.id,
        listId: draggedCard.columnId,
        position: draggedCard.position,
      });
    }

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      const previousIndex = initialColumns.findIndex(col => col.id === active.id);
      const newIndex = orderedColumns.findIndex(col => col.id === over.id);

      if (previousIndex === -1 || newIndex === -1 || previousIndex === newIndex) {
        console.log("⚠️ Vị trí không hợp lệ hoặc không thay đổi, bỏ qua...");
        return;
      }
      let updatedColumns = arrayMove([...initialColumns], previousIndex, newIndex);
      const draggedColumn = initialColumns.find(col => col.id === active.id);
      const newPosition = calculateItemPosition(newIndex, updatedColumns, draggedColumn);
      console.log("New Position:", newPosition);
      console.log("Dragged Column:", draggedColumn);

      updatePositionListMutation.mutate({
        listId: draggedColumn.id,
        position: newPosition,
      });

      setOrderedColumns(updatedColumns);
    }


    setActiveDragItemId(null);
    setActiveDragItemType(null);
    setActiveDragItemData(null);
    setOldColumnDraggingCard(null);
    setInitialColumns([]);
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

  if (isLoadingBoard) return <LogoLoading />;

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
            backgroundSize: "100% 100%", // Stretch image to fill container
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            imageRendering: "auto",
            height: theme.trello.boardContentHeight,
            padding: "18px 0 7px 0px",
            display: "flex",
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

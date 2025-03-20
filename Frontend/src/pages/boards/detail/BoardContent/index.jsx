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
  closestCorners,
  pointerWithin,
  getFirstCollision,
  rectIntersection,
  closestCenter,
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
    useSensor(MouseSensor, {
      activationConstraint: { distance: 0 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 0, tolerance: 0 },
    })
  );


  const [orderedColumns, setOrderedColumns] = useState([]);
  const [activeDragItemId, setActiveDragItemId] = useState(null);
  const [activeDragItemType, setActiveDragItemType] = useState(null);
  const [activeDragItemData, setActiveDragItemData] = useState(null);
  const [oldColumnDraggingCard, setOldColumnDraggingCard] = useState(null);
  const lastOverId = useRef(null);
  // const columnOrderIds = []

  useEffect(() => {
    if (!board?.columns?.length) return;

    const columnOrderIds = board.columnOrderIds || board.columns.map(col => col.id);
    const newOrder = mapOrder(board.columns, columnOrderIds, "id");

    setOrderedColumns(prevColumns => (isEqual(prevColumns, newOrder) ? prevColumns : newOrder));
  }, [board, board?.columnOrderIds]);

  // Tìm column theo cardId
  const findColumnByCardId = (cardId) => {
    if (!cardId || !Array.isArray(orderedColumns)) return null;

    // Trường hợp cardId thực sự là id của column
    const column = orderedColumns.find(col => col.id === cardId);
    if (column) return column;

    // Tìm column chứa card
    return orderedColumns.find((column) =>
      column?.cards?.some((card) => card.id === cardId)
    );
  };


  const handleDragStart = (event) => {
    const { active } = event;
    if (!active) return;

    setActiveDragItemId(active?.id);

    setActiveDragItemType(
      active?.data?.current?.columnId
        ? ACTIVE_DRAG_ITEM_TYPE.CARD
        : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    );

    setActiveDragItemData(active?.data?.current);

    if (active?.data?.current?.columnId) {
      setOldColumnDraggingCard(findColumnByCardId(active?.id));
    }
  };
  // Theo dõi sự thay đổi của oldColumnDraggingCard
  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!active || !over) return;

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      const {
        id: activeCardId,
        data: { current: activeCardData },
      } = active;
      const { id: overCardId } = over;

      const activeColumn = findColumnByCardId(activeCardId);
      const overColumn =
        findColumnByCardId(overCardId) || orderedColumns.find((col) => col.id === overCardId);

      if (!activeColumn || !overColumn) return;

      if (activeColumn.id === overColumn.id) {
        moveCardWithinSameColumn(activeColumn, activeCardId, overCardId, setOrderedColumns)
          .then((changedCards) => {
            // Xử lý thành công (nếu cần)
          })
          .catch((error) => console.error("Error reordering cards:", error));
      } else {
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          activeColumn,
          activeCardId,
          activeCardData,
          setOrderedColumns
        )
          .then((changedCards) => {
            // Xử lý thành công (nếu cần)
          })
          .catch((error) => console.error("Error moving card:", error));
      }
    }
    // Kiểm tra nếu đang kéo Column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      const activeColumnIndex = orderedColumns.findIndex((c) => c.id === active?.id);
      const overColumnIndex = orderedColumns.findIndex((c) => c.id === over?.id);

      if (activeColumnIndex === -1 || overColumnIndex === -1) return;

      if (activeColumnIndex !== overColumnIndex) {
        // Sắp xếp lại mảng cột theo thứ tự mới
        const dndOrderedColumns = arrayMove(orderedColumns, activeColumnIndex, overColumnIndex);

        // Tính toán lại position cho từng cột dựa trên thứ tự mới
        const recalculatedColumns = dndOrderedColumns.map((column, index, arr) => {
          // Nếu cột nằm ở cuối danh sách, calculateItemPosition sẽ tính: 
          // newPosition = position của cột liền trước + SPACING
          const newPosition = calculateItemPosition(index, arr, column);
          return { ...column, position: newPosition };
        });

        setOrderedColumns(recalculatedColumns);
      }
    }
  };
  // Kết thúc kéo một phần tử
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!active || !over) {
      return; // Không làm gì nếu không có active, không có over hoặc kéo thả vào chính nó
    }

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      const activeCardId = active.id;
      const activeColumn = findColumnByCardId(activeCardId);

      // Đảm bảo overColumn được định nghĩa (nếu chưa có, bạn có thể xử lý như sau)
      const overColumn = findColumnByCardId(over.id) || orderedColumns.find(col => col.id === over.id);
      if (!overColumn) return;

      // Lấy card đang kéo từ danh sách card của activeColumn
      const draggedCard = activeColumn.cards.find(c => c.id === activeCardId);

      updateCardPositionMutation.mutate({
        cardId: draggedCard.id,
        listId: draggedCard.columnId,
        position: draggedCard.position,
      });
    }

    // Xử lý kéo thả Column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      const draggedColumn = orderedColumns.find(c => c.id === active.id);
      if (draggedColumn) {
        const { boardId, id, position } = draggedColumn;
        updatePositionListMutation.mutate({
          listId: id,
          position: position,
          boardId: boardId,
        });
      }
    }
    // Xử lý kéo thả Card

    setActiveDragItemId(null);
    setActiveDragItemType(null);
    setActiveDragItemData(null);
    setOldColumnDraggingCard(null);
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
  const customCollisionDetection = useCallback(
    (args) => {
      if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
        return closestCorners({ ...args });
      }

      if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
        const { active, droppableContainers, collisionRect } = args;

        const pointerIntersections = pointerWithin(args);
        const intersections =
          pointerIntersections.length > 0
            ? pointerIntersections
            : rectIntersection(args);

        let overId = getFirstCollision(intersections, "id");

        if (!overId) {
          return lastOverId.current ? [{ id: lastOverId.current }] : [];
        }

        const checkColumn = orderedColumns.find((column) => column.id === overId);
        if (checkColumn) {
          if (checkColumn.cards.length === 0) {
            lastOverId.current = overId;
            return [{ id: overId }];
          }

          const closestIntersection = closestCenter({
            ...args,
            droppableContainers: droppableContainers.filter((container) => {
              return (
                container.id !== overId &&
                checkColumn?.cardOrderIds?.includes(container.id)
              );
            }),
          })[0];

          if (closestIntersection) {
            overId = closestIntersection.id;
          }

          const firstCard = checkColumn.cards[0];
          const lastCard = checkColumn.cards[checkColumn.cards.length - 1];

          if (firstCard && lastCard) {
            const firstCardRect = document
              .getElementById(firstCard.id)
              ?.getBoundingClientRect();
            const lastCardRect = document
              .getElementById(lastCard.id)
              ?.getBoundingClientRect();

            if (collisionRect && firstCardRect && lastCardRect) {
              const draggedCenter = collisionRect.top + collisionRect.height / 2;
              const firstCenter = firstCardRect.top + firstCardRect.height / 2;
              const lastCenter = lastCardRect.top + lastCardRect.height / 2;

              // Nếu tâm dragged card gần với card cuối hơn
              if (
                Math.abs(draggedCenter - lastCenter) <
                Math.abs(draggedCenter - firstCenter)
              ) {
                overId = lastCard.id;
              } else {
                overId = firstCard.id;
              }
            }
          }
        }

        lastOverId.current = overId;
        return [{ id: overId }];
      }

      return [];
    },
    [activeDragItemType, orderedColumns]
  );

  // //Sử lý va chạm khi kéo thả
  // const customCollisionDetection = useCallback(
  //   (args) => {
  //     if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
  //       return closestCorners({ ...args });
  //     }

  //     if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
  //       const pointerIntersections = pointerWithin(args);
  //       const intersections =
  //         pointerIntersections.length > 0
  //           ? pointerIntersections
  //           : rectIntersection(args);

  //       let overId = getFirstCollision(intersections, "id");

  //       if (!overId) {
  //         return lastOverId.current ? [{ id: lastOverId.current }] : [];
  //       }

  //       const checkColumn = orderedColumns.find((column) => column.id === overId);
  //       if (checkColumn) {
  //         if (checkColumn.cards.length === 0) {
  //           lastOverId.current = overId;
  //           return [{ id: overId }];
  //         }

  //         const closestIntersection = closestCenter({
  //           ...args,
  //           droppableContainers: args.droppableContainers.filter((container) => {
  //             return (
  //               container.id !== overId &&
  //               checkColumn?.cardOrderIds?.includes(container.id)
  //             );
  //           }),
  //         })[0];

  //         if (closestIntersection) {
  //           overId = closestIntersection.id;
  //         }

  //         const firstCardInColumn = checkColumn.cards[0];
  //         if (firstCardInColumn) {
  //           const firstCardRect = document
  //             .getElementById(firstCardInColumn.id)
  //             ?.getBoundingClientRect();
  //           const draggedCardRect = args.collisionRect;

  //           if (draggedCardRect && firstCardRect) {
  //             if (draggedCardRect.top < firstCardRect.top) {
  //               overId = checkColumn.id;
  //             }
  //           }
  //         }
  //       }

  //       lastOverId.current = overId;
  //       return [{ id: overId }];
  //     }

  //     return [];
  //   },
  //   [activeDragItemType, orderedColumns]
  // );


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

import { Box } from "@mui/material";
import ListColumns from "./ListColumns/ListColumns";
import Column from "./ListColumns/Column/Column";
import C_ard from "./ListColumns/Column/ListCards/Card/Card";
import { mapOrder } from "../../../../utils/sort";

import { cloneDeep } from "lodash";
import {
  DndContext,
  MouseSensor,
  // PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  pointerWithin,
  // rectIntersection,
  getFirstCollision,
  // closestCenter,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useEffect, useRef, useState } from "react";

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
  CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};

const BoardContent = ({ board }) => {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 5 },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const [orderedColumns, setOrderedColumns] = useState([]);

  const [activeDragItemId, setActiveDragItemId] = useState(null);
  const [activeDragItemType, setActiveDragItemType] = useState(null);
  const [activeDragItemData, setActiveDragItemData] = useState(null);
  const [oldColumnDraggingCard, setOldColumnDraggingCard] = useState(null);

  const lastOverId = useRef(null);

  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, "_id"));
  }, [board]);

  //Tìm column theo cardId
  const findColumnByCardId = (cardId) => {
    return orderedColumns.find((column) =>
      column?.cards?.map((card) => card._id)?.includes(cardId)
    );
  };

  //Cập nhật lại State khi di chuyển Card giữa các Column khác nhau
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeCardId,
    activeCardData
  ) => {
    setOrderedColumns((prevColumns) => {
      //Tìm vị trí của overCard trong column sắp được thả
      const overCardIndex = overColumn?.cards?.findIndex(
        (card) => card._id === overCardId
      );

      // Tính toán vị trí cardIndex mới
      let newCardIndex;
      const isBelowOverItem =
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;

      const modifier = isBelowOverItem ? 1 : 0;
      newCardIndex =
        overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.length + 1;

      //Clone mảng orderedColumns cũ ra để xử lý data rồi return cập nhập lại orderedColumns mới
      const nextColumns = cloneDeep(prevColumns);
      const nextActiveColumn = nextColumns.find(
        (column) => column._id === activeColumn._id
      );
      const nextOverColumn = nextColumns.find(
        (column) => column._id === overColumn._id
      );

      if (nextActiveColumn) {
        //Xóa card ở column cũ khi kéo sang column mới
        nextActiveColumn.cards = nextActiveColumn.cards.filter(
          (card) => card._id !== activeCardId
        );

        // Cập nhật lại mảng cardOrderIds mới
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(
          (card) => card._id
        );
      }

      //nextOverColumn: Column mới
      if (nextOverColumn) {
        // Kiểm tra card đang kéo tồn tại ở overColumn chưa, nếu có thì xóa trước
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => card._id !== activeCardId
        );

        const rebuild_activeCardData = {
          ...activeCardData,
          columnId: nextOverColumn._id,
        };

        // Thêm card đang kéo vào vị trí mới của column mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(
          newCardIndex,
          0,
          rebuild_activeCardData
        );
        // Cập nhật lại mảng
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(
          (card) => card._id
        );
      }
      console.log("nextColumns:", nextColumns);

      return nextColumns;
    });
  };

  //Bắt đầu kéo một phần tử
  const handleDragStart = (event) => {
    // console.log("handleDragStart:", event);
    setActiveDragItemId(event?.active?.id);

    setActiveDragItemType(
      event?.active?.data?.current?.columnId
        ? ACTIVE_DRAG_ITEM_TYPE.CARD
        : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    );

    setActiveDragItemData(event?.active?.data?.current);

    //Nếu kéo Card thì mới set giá trị oldColumn
    if (event?.active?.data?.current?.columnId) {
      setOldColumnDraggingCard(findColumnByCardId(event?.active?.id));
    }
  };

  // Trong quá trình kéo một phần tử
  const handleDragOver = (event) => {
    //K làm gì nếu kéo column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return;
    }
    //console.log("handleDragOver:", event);

    const { active, over } = event;
    //K tồn tại active hoặc over thì k làm gì
    if (!active || !over) return;

    const {
      id: activeCardId, //activeCard: Card đang được kéo
      data: { current: activeCardData }, //current: activeCardData: Là active.data.current
    } = active;
    const { id: overCardId } = over; //overCard: Là card đang tương tác trên, dưới với card đang được kéo

    //Tìm column theo cardId
    const activeColumn = findColumnByCardId(activeCardId);
    const overColumn = findColumnByCardId(overCardId);

    if (!activeColumn || !overColumn) return;

    //Card di chuyển giữa 2 column khác nhau mới chạy vào đây còn trong 1 column thì k. Xử lý lúc kéo onDragOver
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeCardId,
        activeCardData
      );
    }
  };

  // Kết thúc kéo một phần tử
  const handleDragEnd = (event) => {
    // console.log("handleDragEnd:", event);

    const { active, over } = event;

    if (!active || !over) return;

    //Xử lý kéo thả Card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      const {
        id: activeCardId, //activeCard: Card đang được kéo
        data: { current: activeCardData }, //current: activeCardData: Là active.data.current
      } = active;
      const { id: overCardId } = over; //overCard: Là card đang tương tác trên, dưới với card đang được kéo

      //Tìm column theo cardId
      const activeColumn = findColumnByCardId(activeCardId);
      const overColumn = findColumnByCardId(overCardId);

      if (!activeColumn || !overColumn) return;

      if (oldColumnDraggingCard._id !== overColumn._id) {
        //Kéo thả Card giữa 2 column
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeCardId,
          activeCardData
        );
      } else {
        //Kéo thả Card cùng 1 column

        //Lấy vị trí cũ từ oldColumnDraggingCard
        const oldCardIndex = oldColumnDraggingCard?.cards?.findIndex(
          (c) => c._id === activeDragItemId
        );

        //Lấy vị trí mới từ OverColumn
        const newCardIndex = overColumn?.cards.findIndex(
          (c) => c._id === overCardId
        );

        const dndOrderedCards = arrayMove(
          oldColumnDraggingCard?.cards,
          oldCardIndex,
          newCardIndex
        );
        setOrderedColumns((prevColumns) => {
          //Clone mảng orderedColumns cũ ra để xử lý data rồi return cập nhập lại orderedColumns mới
          const nextColumns = cloneDeep(prevColumns);

          const targetColumn = nextColumns.find(
            (column) => column._id === overColumn._id
          );

          //Cập nhật lại 2 giá trị card và cardOrderIds
          targetColumn.cards = dndOrderedCards;
          targetColumn.cardOrderIds = dndOrderedCards.map((card) => card._id);

          return nextColumns;
        });
      }
    }

    //Xử lý kéo thả Column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      if (active.id !== over.id) {
        //Lấy vị trí cũ từ active
        const oldColumnIndex = orderedColumns.findIndex(
          (c) => c._id === active.id
        );

        //Lấy vị trí mới
        const newColumnIndex = orderedColumns.findIndex(
          (c) => c._id === over.id
        );

        //arrayMove(dnd-kit): Sắp xếp lại mảng column ban đầu
        const dndOrderedColumns = arrayMove(
          orderedColumns,
          oldColumnIndex,
          newColumnIndex
        );
        // const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id);
        // console.log("dndOrderedColumns: ", dndOrderedColumns);
        // console.log("dndOrderedColumnsIds: ", dndOrderedColumnsIds);

        setOrderedColumns(dndOrderedColumns);
      }
    }

    setActiveDragItemId(null);
    setActiveDragItemType(null);
    setActiveDragItemData(null);
    setOldColumnDraggingCard(null);
  };

  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  //Sử lý va chạm khi kéo thả
  const collisionDetectionStrategy = useCallback(
    (args) => {
      if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
        return closestCorners({ ...args });
      }
      //Tìm các điểm giao nhau, va chạm
      const pointerIntersections = pointerWithin(args);
      if (!pointerIntersections?.length) return;

      // THuật toán phát hiện va chạm => Trả về một mảng các va chạm
      // const intersections = !!pointerIntersections?.length
      //   ? pointerIntersections
      //   : rectIntersection(args);

      let overId = getFirstCollision(pointerIntersections, "id");

      if (overId) {
        const checkColumn = orderedColumns.find(
          (column) => column._id === overId
        );
        if (checkColumn) {
          overId = closestCorners({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (container) => {
                return (
                  container.id !== overId &&
                  checkColumn?.cardOrderIds?.includes(container.id)
                );
              }
            ),
          })[0]?.id;
        }
        lastOverId.current = overId;
        return [{ id: overId }];
      }

      // overId là null trả về mảng rỗng
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeDragItemType, orderedColumns]
  );

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      sensors={sensors}
      //collisionDetection={closestCorners}
      collisionDetection={collisionDetectionStrategy}
    >
      <Box
        sx={{
          backgroundColor: "primary.main",
          height: (theme) => theme.trello.boardContentHeight,
          padding: "18px 0 7px 0px",
        }}
      >
        <ListColumns columns={orderedColumns} />
        <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
            <Column column={activeDragItemData} />
          )}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
            <C_ard card={activeDragItemData} />
          )}
        </DragOverlay>
      </Box>
    </DndContext>
  );
};

export default BoardContent;

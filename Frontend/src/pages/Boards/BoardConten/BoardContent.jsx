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
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
  CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};

const BoardContent = ({ board }) => {
  // const poiterSensor = useSensor(PointerSensor, {
  //   activationConstraint: { distance: 10 },
  // });

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

  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, "_id"));
  }, [board]);

  //Tìm column theo cardId
  const findColumnByCardId = (cardId) => {
    return orderedColumns.find((column) =>
      column?.cards?.map((card) => card._id)?.includes(cardId)
    );
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
          overCardIndex >= 0
            ? overCardIndex + modifier
            : overColumn?.length + 1;

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

        if (nextOverColumn) {
          // Kiểm tra card đang kéo tồn tại ở overColumn chưa, nếu có thì xóa trước
          nextOverColumn.cards = nextOverColumn.cards.filter(
            (card) => card._id !== activeCardId
          );
          // Thêm card đang kéo vào vị trí mới của column mới
          nextOverColumn.cards = nextOverColumn.cards.toSpliced(
            newCardIndex,
            0,
            activeCardData
          );
          // Cập nhật lại mảng
          nextOverColumn.cardOrderIds = nextOverColumn.cards.map(
            (card) => card._id
          );
        }
        console.log("nextColumns:", nextColumns);

        return nextColumns;
      });
    }
  };

  // Kết thúc kéo một phần tử
  const handleDragEnd = (event) => {

    // console.log("handleDragEnd:", event);

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      //console.log("Done");
      return;
    }

    const { active, over } = event;

    if (!active || !over) return;

    if (active.id !== over.id) {
      //Lấy vị trí cũ
      const oldIndex = orderedColumns.findIndex((c) => c._id === active.id);

      //Lấy vị trí mới
      const newIndex = orderedColumns.findIndex((c) => c._id === over.id);

      //arrayMove(dnd-kit): Sắp xếp lại mảng column ban đầu
      const dndOrderedColumns = arrayMove(orderedColumns, oldIndex, newIndex);
      // const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id);
      // console.log("dndOrderedColumns: ", dndOrderedColumns);
      // console.log("dndOrderedColumnsIds: ", dndOrderedColumnsIds);

      setOrderedColumns(dndOrderedColumns);
    }

    setActiveDragItemId(null);
    setActiveDragItemType(null);
    setActiveDragItemData(null);
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

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      sensors={sensors}
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
import { Box } from "@mui/material";
import ListColumns from "./ListColumns/ListColumns";
import Column from "./ListColumns/Column/Column";
import C_ard from "./ListColumns/Column/ListCards/Card/Card";
import { mapOrder } from "../../../../../utils/sort";

import { cloneDeep, isEmpty } from "lodash";
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
import '../../../../../utils/pusher';
import { arrayMove } from "@dnd-kit/sortable";
// import { useCallback, useEffect, useRef, useState } from "react";
import { generatePlaceholderCard } from "../../../../../utils/formatters";
import { useParams } from 'react-router-dom';
import { useLists } from "../../../../hooks/useList";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from 'react';


// import { updateListPositions } from "../api/lists";

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
  CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};

const BoardContent = ({ }) => {

  const { boardId } = useParams();
  // console.log("boardId:", boardId); // Kiểm tra giá trị boardId
  const [orderedColumns, setOrderedColumns] = useState([]);

  const { data: lists, isLoading, error, reorderLists } = useLists(boardId);
  console.log("🛠 list:", lists);

  // console.log("🛠 boardId:", boardId);

  const queryClient = useQueryClient();

  // Kiểm tra trạng thái khi gọi API
  if (isLoading) return <p>Đang tải danh sách...</p>;
  if (error) return <p>Lỗi: {error.message}</p>;

  // Kiểm tra nếu không có dữ liệu
  // if (!lists || lists.length === 0) return <p>Không có danh sách nào.</p>;


  // useEffect(() => {
  //   // Sử dụng Echo để kết nối và lắng nghe sự kiện
  //   const channel = window.Echo.channel(`board.${boardId}`);
  //   channel.listen('.list.reordered', (event) => {
  //     // Cập nhật danh sách từ sự kiện Echo
  //     const newListPositions = event.positions.sort((a, b) => a.position - b.position);
  //     setOrderedColumns(newListPositions);
  //   });

  //   // Cleanup khi component unmount
  //   return () => {
  //     channel.stopListening('.list.reordered');
  //     channel.unsubscribe();
  //   };
  // }, [boardId]);


  // const [lists, setLists] = useState([]);

  // const mouseSensor = useSensor(MouseSensor, {
  //   activationConstraint: { distance: 10 },
  // });

  // const touchSensor = useSensor(TouchSensor, {
  //   activationConstraint: { delay: 250, tolerance: 5 },
  // });

  // const sensors = useSensors(mouseSensor, touchSensor);

  // const [orderedColumns, setOrderedColumns] = useState([]);

  // const [activeDragItemId, setActiveDragItemId] = useState(null);
  // const [activeDragItemType, setActiveDragItemType] = useState(null);
  // const [activeDragItemData, setActiveDragItemData] = useState(null);
  // const [oldColumnDraggingCard, setOldColumnDraggingCard] = useState(null);

  // const lastOverId = useRef(null);

  // useEffect(() => {
  //   setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, "_id"));
  // }, [board]);

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

        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)];
        }

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

        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => !card.FE_PlaceholderCard
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
  // const handleDragStart = (event) => {
  //   // console.log("handleDragStart:", event);
  //   setActiveDragItemId(event?.active?.id);

  //   setActiveDragItemType(
  //     event?.active?.data?.current?.columnId
  //       ? ACTIVE_DRAG_ITEM_TYPE.CARD
  //       : ACTIVE_DRAG_ITEM_TYPE.COLUMN
  //   );

  //   setActiveDragItemData(event?.active?.data?.current);

  //   //Nếu kéo Card thì mới set giá trị oldColumn
  //   if (event?.active?.data?.current?.columnId) {
  //     setOldColumnDraggingCard(findColumnByCardId(event?.active?.id));
  //   }
  // };

  // Trong quá trình kéo một phần tử
  // const handleDragOver = (event) => {
  //   //K làm gì nếu kéo column
  //   if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
  //     return;
  //   }
  //   //console.log("handleDragOver:", event);

  //   const { active, over } = event;
  //   //K tồn tại active hoặc over thì k làm gì
  //   if (!active || !over) return;

  //   const {
  //     id: activeCardId, //activeCard: Card đang được kéo
  //     data: { current: activeCardData }, //current: activeCardData: Là active.data.current
  //   } = active;
  //   const { id: overCardId } = over; //overCard: Là card đang tương tác trên, dưới với card đang được kéo

  //   //Tìm column theo cardId
  //   const activeColumn = findColumnByCardId(activeCardId);
  //   const overColumn = findColumnByCardId(overCardId);

  //   if (!activeColumn || !overColumn) return;

  //   //Card di chuyển giữa 2 column khác nhau mới chạy vào đây còn trong 1 column thì k. Xử lý lúc kéo onDragOver
  //   if (activeColumn._id !== overColumn._id) {
  //     moveCardBetweenDifferentColumns(
  //       overColumn,
  //       overCardId,
  //       active,
  //       over,
  //       activeColumn,
  //       activeCardId,
  //       activeCardData
  //     );
  //   }
  // };

  // Kết thúc kéo một phần tử
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    const oldIndex = lists.findIndex((list) => list.id === Number(active.id));
    const newIndex = lists.findIndex((list) => list.id === Number(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const updatedLists = arrayMove(lists, oldIndex, newIndex);

    const updatedPositions = updatedLists.map((list, index) => ({
      id: list.id,
      position: index + 1, // Cập nhật vị trí mới
    }));


    console.log("🛠 Dữ liệu gửi lên API:", {
      board_id: boardId,
      positions: updatedPositions
  });

    // Cập nhật vị trí trên server
    try {
      await reorderLists({ boardId, updatedPositions });
      console.log("✅ Cập nhật vị trí thành công");
    } catch (error) {
      console.error("❌ Lỗi cập nhật vị trí:", error);
    }
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
  // const collisionDetectionStrategy = useCallback(
  //   (args) => {
  //     if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
  //       return closestCorners({ ...args });
  //     }
  //     //Tìm các điểm giao nhau, va chạm
  //     const pointerIntersections = pointerWithin(args);
  //     if (!pointerIntersections?.length) return;

  //     // THuật toán phát hiện va chạm => Trả về một mảng các va chạm
  //     // const intersections = !!pointerIntersections?.length
  //     //   ? pointerIntersections
  //     //   : rectIntersection(args);

  //     let overId = getFirstCollision(pointerIntersections, "id");

  //     if (overId) {
  //       const checkColumn = orderedColumns.find(
  //         (column) => column._id === overId
  //       );
  //       if (checkColumn) {
  //         overId = closestCorners({
  //           ...args,
  //           droppableContainers: args.droppableContainers.filter(
  //             (container) => {
  //               return (
  //                 container.id !== overId &&
  //                 checkColumn?.cardOrderIds?.includes(container.id)
  //               );
  //             }
  //           ),
  //         })[0]?.id;
  //       }
  //       lastOverId.current = overId;
  //       return [{ id: overId }];
  //     }

  //     // overId là null trả về mảng rỗng
  //     return lastOverId.current ? [{ id: lastOverId.current }] : [];
  //   },
  //   [activeDragItemType, orderedColumns]
  // );

  return (
    <DndContext
    // onDragStart={handleDragStart}
    // onDragOver={handleDragOver}
    onDragEnd={handleDragEnd}
    // sensors={sensors}
    //collisionDetection={closestCorners}
    // collisionDetection={collisionDetectionStrategy}
    >
      <Box
        sx={{
          backgroundColor: "primary.main",
          height: (theme) => theme.trello.boardContentHeight,
          padding: "18px 0 7px 0px",
        }}
      >
        <ListColumns lists={lists} />
        {/* <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
            <Column column={activeDragItemData} />
          )}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
            <C_ard card={activeDragItemData} />
          )}
        </DragOverlay> */}
      </Box>
    </DndContext>
  );
};

export default BoardContent;


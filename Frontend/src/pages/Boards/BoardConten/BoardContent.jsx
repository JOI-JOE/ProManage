// import { useEffect, useState } from "react";
// import Echo from "laravel-echo";
// import Pusher from "pusher-js";
// import axios from "axios";
// import { useParams } from "react-router-dom";
// import ListColumns from "./ListColumns/ListColumns";

// import { Box } from "@mui/material";
// import { DndContext, useSensor, useSensors, MouseSensor, TouchSensor } from "@dnd-kit/core";
// import { arrayMove } from "@dnd-kit/sortable";

// const BoardContent = () => {
//   const { boardId } = useParams();
//   const [lists, setLists] = useState([]);
//   const [draggingListId, setDraggingListId] = useState(null);
//   const [draggingPosition, setDraggingPosition] = useState(null);

//   useEffect(() => {
//     axios.get(`http://127.0.0.1:8000/api/lists/${boardId}`)
//       .then(response => {

//         if (Array.isArray(response.data)) {
//           setLists(response.data.sort((a, b) => a.position - b.position));
//         } else {
//           console.error("Lỗi: API không trả về danh sách đúng", response.data);
//         }
//       })
//       .catch(error => console.error("Lỗi khi lấy danh sách:", error));

//     // ✅ Kết nối Laravel Echo để nhận realtime
//     window.Pusher = Pusher;
//     window.Echo = new Echo({
//       broadcaster: "pusher",
//       key: "011ba3f5ec97a6948d45",
//       cluster: "ap1",
//       forceTLS: true,
//     });

//     // 🔥 Nhận sự kiện "list đang kéo"
//     window.Echo.channel(`board.${boardId}`).listen(".list.dragging", (event) => {
//       console.log("📢 List đang được kéo:", event.draggingListId, "ở vị trí", event.position);

//       setLists(prevLists => {
//         const updatedLists = [...prevLists];
//         const movingList = updatedLists.find(list => list.id === event.draggingListId);
//         if (movingList) {
//           updatedLists.splice(updatedLists.indexOf(movingList), 1); // Xóa list cũ
//           updatedLists.splice(event.position - 1, 0, movingList);  // Chèn vào vị trí mới
//         }
//         return updatedLists;
//       });

//       setDraggingListId(event.draggingListId);
//       setDraggingPosition(event.position);
//     });

//     // 🔥 Nhận sự kiện cập nhật danh sách khi thả
//     window.Echo.channel(`board.${boardId}`).listen(".list.reordered", (event) => {
//       console.log("📢 Realtime update received:", event);
//       setLists(event.positions.sort((a, b) => a.position - b.position));
//       setDraggingListId(null);
//       setDraggingPosition(null);
//     });

//     return () => {
//       window.Echo.leaveChannel(`board.${boardId}`);
//     };
//   }, [boardId]);

//   // const handleDragStart = (event) => {
//   //   const activeId = Number(event.active.id);
//   //   setDraggingListId(activeId);

//   //   axios.post(`http://127.0.0.1:8000/api/lists/dragging`, {
//   //     board_id: boardId,
//   //     dragging_list_id: activeId,
//   //     position: lists.findIndex(list => list.id === activeId) + 1
//   //   }).catch(error => console.error("❌ Lỗi gửi trạng thái kéo:", error));
//   // };

//   // const handleDragOver = (event) => {
//   //   const { active, over } = event;
//   //   if (!active || !over || active.id === over.id) return;

//   //   const newIndex = lists.findIndex((list) => list.id === Number(over.id));

//   //   axios.post(`http://127.0.0.1:8000/api/lists/dragging`, {
//   //     board_id: boardId,
//   //     dragging_list_id: Number(active.id),
//   //     position: newIndex + 1
//   //   }).catch(error => console.error("❌ Lỗi cập nhật vị trí kéo:", error));
//   // };

//   const handleDragEnd = (event) => {
//     const { active, over } = event;
//     if (!active || !over || active.id === over.id) return;

//     const oldIndex = lists.findIndex((list) => list.id === Number(active.id));
//     const newIndex = lists.findIndex((list) => list.id === Number(over.id));
//     if (oldIndex === -1 || newIndex === -1) return;

//     const updatedLists = arrayMove(lists, oldIndex, newIndex);
//     setLists(updatedLists);
//     setDraggingListId(null);
//     setDraggingPosition(null);

//     const updatedPositions = updatedLists.map((list, index) => ({
//       id: list.id,
//       position: index + 1,
//       // name: list.name,
//     }));

//     axios.put(`http://127.0.0.1:8000/api/lists/reorder`, {
//       board_id: boardId,
//       positions: updatedPositions
//     }).catch(error => console.error("❌ Lỗi cập nhật vị trí:", error));
//   };


//   return (
//     <DndContext 
//       // onDragStart={handleDragStart} 
//       // onDragOver={handleDragOver}
//       onDragEnd={handleDragEnd} 
//       sensors={useSensors(useSensor(MouseSensor), 
//       useSensor(TouchSensor))}>

//       <Box
//         sx={{
//           backgroundColor: "primary.main",
//           height: (theme) => theme.trello.boardContentHeight,
//           padding: "18px 0 7px 0px",
//         }}
//       >

//           <ListColumns lists={lists} draggingListId={draggingListId} draggingPosition={draggingPosition} />


//       </Box>
//     </DndContext>
//   );
// };

// export default BoardContent;




import { Box } from "@mui/material";
import ListColumns from "./ListColumns/ListColumns";
import Column from "./ListColumns/Column/Column";
import C_ard from "./ListColumns/Column/ListCards/Card/Card";
import { mapOrder } from "../../../../utils/sort";
import '../../../../utils/pusher';
import axios from "axios";
import { useParams } from "react-router-dom";

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
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useEffect, useRef, useState } from "react";
import { generatePlaceholderCard } from "../../../../utils/formatters";

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
  CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};

const BoardContent = () => {

  const { boardId } = useParams();
  const [lists, setLists] = useState([]);
  // const [draggingListId, setDraggingListId] = useState(null);
  // const [draggingPosition, setDraggingPosition] = useState(null);


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
    // Định nghĩa hàm async để gọi API
    const fetchLists = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/lists/${boardId}`);

        if (Array.isArray(response.data)) {
          setLists(response.data.sort((a, b) => a.position - b.position));
        } else {
          console.error("Lỗi: API không trả về danh sách đúng", response.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách:", error);
      }
    };

    // Gọi hàm fetchLists để lấy dữ liệu
    fetchLists();

    // Thiết lập kênh lắng nghe sự kiện realtime
    const channel = window.Echo.channel(`board.${boardId}`).listen(".list.reordered", (event) => {
      console.log("📢 Realtime update received:", event);
      setLists(event.positions.sort((a, b) => a.position - b.position));
      // setDraggingListId(null);
      // setDraggingPosition(null);
    });

    // Hủy kênh lắng nghe khi component unmount
    return () => {
      channel.stopListening(".list.reordered");
      window.Echo.leaveChannel(`board.${boardId}`);
    };

  }, [boardId]);

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
    setLists(updatedLists);
    // setDraggingListId(null);
    // setDraggingPosition(null);

    const updatedPositions = updatedLists.map((list, index) => ({
      id: list.id,
      position: index + 1,
      // name: list.name,
    }));

    try {
      await axios.put(`http://127.0.0.1:8000/api/lists/reorder`, {
        board_id: boardId,
        positions: updatedPositions
      });
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
      // onDragStart={handleDragStart} 
      // onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      sensors={useSensors(useSensor(MouseSensor),
        useSensor(TouchSensor))}>
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

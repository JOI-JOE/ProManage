import { Box } from "@mui/material";
import { cloneDeep, isEmpty } from "lodash";
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
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useEffect, useRef, useState } from "react";
import Col from "./Columns/Col";
import Col_list from "./Columns/Col_list";
import BoardBar from "./BoardBar/index";
import { generatePlaceholderCard } from "../../../../../utils/formatters";
import { useDragAndDropLists, useLists } from "../../../../hooks/useList";
import { useParams } from "react-router-dom";
import C_ard from "./Cards/C_ard";
import { mapOrder } from "../../../../../utils/sort";
// import { useUpdateCardSameCol } from "../../../../hooks/useCard";
// import { useUpdateCardSameCol } from "../../../../hooks/useCard";
import { useCardPositionsInColumns } from "../../../../hooks/useCard";

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
  CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};

const BoardContent = () => {
  const { boardId } = useParams();
  const { mutation } = useDragAndDropLists(boardId);
  // const { updateCardPositionsInColumns, isError } = useUpdateCardSameCol();
  const { data: board, isLoading, error } = useLists(boardId); // Lấy dữ liệu từ hook


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

  // Cập nhật orderedColumns khi board thay đổi
  // useEffect(() => {
  //   setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, "id"));
  // }, [board]);
  useEffect(() => {
    if (board?.columns && board?.columnOrderIds) {
      setOrderedColumns(mapOrder(board.columns, board.columnOrderIds, "id"));
    }
  }, [board]);

  // console.log(board)

  // Tìm column theo cardId
  const findColumnByCardId = (cardId) => {
    if (!cardId || !Array.isArray(orderedColumns)) return null;
    return orderedColumns.find((column) =>
      column?.cards?.some((card) => card.id === cardId)
    );
  };

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
      // Clone mảng orderedColumns cũ để xử lý
      const nextColumns = cloneDeep(prevColumns);

      // Tìm column hiện tại và column mới
      const nextActiveColumn = nextColumns.find(
        (column) => column.id === activeColumn.id
      );
      const nextOverColumn = nextColumns.find(
        (column) => column.id === overColumn.id
      );

      if (!nextActiveColumn || !nextOverColumn) return prevColumns;

      // Xóa card đang kéo khỏi column hiện tại
      nextActiveColumn.cards = nextActiveColumn.cards.filter(
        (card) => card.id !== activeCardId
      );

      // Nếu column hiện tại không còn card nào, thêm placeholder card
      if (isEmpty(nextActiveColumn.cards)) {
        nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)];
      }

      // Cập nhật lại cardOrderIds của column hiện tại
      nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map((card) => card.id);

      // Tính toán vị trí mới của card trong column mới
      const overCardIndex = nextOverColumn.cards.findIndex(
        (card) => card.id === overCardId
      );

      let newCardIndex;
      if (overCardIndex >= 0) {
        const isBelowOverItem =
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;
        newCardIndex = overCardIndex + (isBelowOverItem ? 1 : 0);
      } else {
        newCardIndex = nextOverColumn.cards.length;
      }

      // Thêm card đang kéo vào column mới tại vị trí mới
      const rebuild_activeCardData = {
        ...activeCardData,
        columnId: nextOverColumn.id,
      };

      nextOverColumn.cards = nextOverColumn.cards.toSpliced(
        newCardIndex,
        0,
        rebuild_activeCardData
      );

      // Loại bỏ placeholder card nếu có
      nextOverColumn.cards = nextOverColumn.cards.filter(
        (card) => !card.FE_PlaceholderCard
      );

      // Cập nhật lại cardOrderIds của column mới
      nextOverColumn.cardOrderIds = nextOverColumn.cards.map((card) => card.id);

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
      console.log(setOldColumnDraggingCard(findColumnByCardId(event?.active?.id)))
    }
  };

  // Trong quá trình kéo một phần tử
  const handleDragOver = (event) => {
    // console.log("handleDragOver:", event);
    const { active, over } = event;
    // Không tồn tại active hoặc over thì không làm gì
    if (!active || !over) return;

    const {
      id: activeItemId, // activeItem: Item đang được kéo
      data: { current: activeItemData }, // current: activeItemData: Là active.data.current
    } = active;
    const { id: overItemId } = over; // overItem: Là item đang tương tác trên, dưới với item đang được kéo

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      // Xử lý kéo thả Column
      const activeColumnIndex = orderedColumns.findIndex((c) => c.id === activeItemId);
      const overColumnIndex = orderedColumns.findIndex((c) => c.id === overItemId);

      if (activeColumnIndex !== -1 && overColumnIndex !== -1 && activeColumnIndex !== overColumnIndex) {
        const dndOrderedColumns = arrayMove(
          orderedColumns,
          activeColumnIndex,
          overColumnIndex
        );

        setOrderedColumns(dndOrderedColumns);
      }
      return;
    }

    // Tìm column theo cardId
    const activeColumn = findColumnByCardId(activeItemId);
    const overColumn = findColumnByCardId(overItemId);

    if (!activeColumn || !overColumn) return;

    // Card di chuyển giữa 2 column khác nhau mới chạy vào đây còn trong 1 column thì không. Xử lý lúc kéo onDragOver
    if (activeColumn.id !== overColumn.id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overItemId,
        active,
        over,
        activeColumn,
        activeItemId,
        activeItemData
      );
    }
  };

  // Kết thúc kéo một phần tử
  const handleDragEnd = async (event) => {
    // console.log("handleDragEnd:", event);
    const { active, over } = event;
    if (!active || !over) return;
    // Xử lý kéo thả Card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      const {
        id: activeCardId, // activeCard: Card đang được kéo
        data: { current: activeCardData }, // current: activeCardData: Là active.data.current
      } = active;
      const { id: overCardId } = over; // overCard: Là card đang tương tác trên, dưới với card đang được kéo
      // Tìm column theo cardId
      const activeColumn = findColumnByCardId(activeCardId);
      const overColumn = findColumnByCardId(overCardId);
      if (!activeColumn || !overColumn) return;
      if (oldColumnDraggingCard.id !== overColumn.id) {
        // Kéo thả Card giữa 2 column
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeCardId,
          activeCardData
        );
        // Debugging logs 📌
        const columnOldId = activeColumn.id; // ID của cột cũ
        const columnNewId = overColumn.id; // ID của cột mới
        const cardId = activeCardId; // ID của card đang di chuyển
        const cardOldPosition = activeCardData.position; // Vị trí cũ của card
        const cardNewPosition = over.position; // Vị trí mới của card

        // Hiển thị các giá trị đã lọc
        console.log("📌 Dữ liệu cần thiết: ");
        console.log("Cột cũ (ID):", columnOldId);
        console.log("Cột mới (ID):", columnNewId);
        console.log("Card đang di chuyển (ID):", cardId);
        console.log("Vị trí card cũ:", cardOldPosition);
        console.log("Vị trí mới của card:", cardNewPosition);


      } else {
        // START - KÉO THẢ CARD CÙNG MỘT COLUMN
        // Kéo thả Card cùng 1 column
        // Lấy vị trí cũ từ oldColumnDraggingCard
        const oldCardIndex = oldColumnDraggingCard?.cards?.findIndex(
          (c) => c.id === activeCardId
        );
        // Lấy vị trí mới từ OverColumn
        const newCardIndex = overColumn?.cards.findIndex(
          (c) => c.id === overCardId
        );
        // Kiểm tra nếu vị trí cũ hoặc mới không hợp lệ
        if (oldCardIndex === -1 || newCardIndex === -1) {
          console.warn("Vị trí card không hợp lệ.");
          return;
        }
        // Sắp xếp lại mảng cards
        const dndOrderedCards = arrayMove(
          oldColumnDraggingCard.cards,
          oldCardIndex,
          newCardIndex
        );
        // Cập nhật lại giá trị position của các card
        const updatedCards = dndOrderedCards.map((card, index) => ({
          ...card,
          position: (index + 1) * 1000, // Cập nhật position với khoảng cách 1000
        }));


        const filteredCards = updatedCards.map((card) => ({
          list_board_id: card.columnId, // Cột ID (list_board_id)
          position: card.position, // Vị trí
          id: card.id, // ID của card
        }));

        
        console.log("FilteredCards data:", filteredCards); // Sửa lại thành filteredCards
        // Cập nhật state local
        setOrderedColumns((prevColumns) => {
          // Clone mảng orderedColumns cũ ra để xử lý data rồi return cập nhập lại orderedColumns mới
          const nextColumns = cloneDeep(prevColumns);

          // Tìm column cần cập nhật
          const targetColumn = nextColumns.find(
            (column) => column.id === overColumn.id
          );

          // Cập nhật lại cards và cardOrderIds
          targetColumn.cards = updatedCards;
          targetColumn.cardOrderIds = updatedCards.map((card) => card.id);

          return nextColumns;
        });
        // Gọi API để cập nhật dữ liệu lên database
        try {
          // Gọi hàm cập nhật vị trí card
          await useCardPositionsInColumns(filteredCards);

          console.log("Cập nhật thành công:", filteredCards); // Sửa lại thành filteredCards
        } catch (error) {
          console.error("Lỗi khi cập nhật database:", error);

          // Rollback state local nếu có lỗi
          setOrderedColumns((prevColumns) => {
            const rollbackColumns = cloneDeep(prevColumns);
            const targetColumn = rollbackColumns.find(
              (column) => column.id === overColumn.id
            );
            targetColumn.cards = oldColumnDraggingCard.cards;
            targetColumn.cardOrderIds = oldColumnDraggingCard.cards.map(
              (card) => card.id
            );
            return rollbackColumns;
          });
        }
        // END - KÉO THẢ CARD CÙNG MỘT COLUMN
      }
    }

    // Xử lý kéo thả Column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      // Hàm hỗ trợ để tìm index của column dựa trên id
      const findColumnIndex = (id) => {
        const index = orderedColumns.findIndex((c) => c.id === id);
        console.log(`Tìm thấy column có id: ${id}, index: ${index}`);
        return index;
      };
      // Lấy vị trí cũ từ active
      const oldColumnIndex = findColumnIndex(active.id);

      // Nếu over không tồn tại (kéo đến đầu danh sách), đặt vị trí mới là 0
      const newColumnIndex = over ? findColumnIndex(over.id) : 0;
      // Kiểm tra nếu index hợp lệ
      if (oldColumnIndex === -1) {
        console.warn("Invalid column index. Cannot perform reordering.");
        return;
      }
      // Sắp xếp lại mảng column ban đầu
      const dndOrderedColumns = arrayMove(
        orderedColumns,
        oldColumnIndex,
        newColumnIndex
      );

      // Cập nhật lại giá trị position dựa trên vị trí mới, bắt đầu từ 0
      const updatedColumns = dndOrderedColumns.map((column, index) => ({
        ...column,
        position: (index + 1) * 1000,
      }));

      // Cập nhật state local
      setOrderedColumns(updatedColumns);

      // Gọi mutation để cập nhật dữ liệu trên server
      await mutation.mutate(updatedColumns, {
        onError: (error) => {
          // Rollback state local nếu có lỗi
          setOrderedColumns(orderedColumns);
          console.error("Failed to update column positions:", error);
        },
      });
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
      const intersections = !!pointerIntersections?.length
        ? pointerIntersections
        : rectIntersection(args);

      let overId = getFirstCollision(pointerIntersections, "id");

      if (overId) {
        const checkColumn = orderedColumns.find(
          (column) => column.id === overId
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
    <>
      <BoardBar />
      <DndContext
        collisionDetection={collisionDetectionStrategy}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={{
            backgroundColor: "primary.main",
            height: (theme) => theme.trello.boardContentHeight,
            padding: "18px 0 7px 0px",
          }}
        >
          <Col_list columns={orderedColumns} />
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

export default BoardContent;
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
import { useCardPositionsInColumns, useCardPositionsOutColumns } from "../../../../hooks/useCard";
import BoardContext from "../../../../contexts/BoardContext";
import { calculateItemPosition } from "../../../../../utils/calculateItemPosition";
import { useUpdatePositionList } from "../../../../hooks/useList";

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
  CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};

const BoardContent = () => {
  const { boardId } = useParams();
  const { board } = useContext(BoardContext);
  const updatePositionListMutation = useUpdatePositionList();


  // console.log(board)
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
  const [activeList, setActiveList] = useState(false);
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
    return orderedColumns.find((column) =>
      column?.cards?.some((card) => card.id === cardId)
    );
  };

  //Bắt đầu kéo một phần tử
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeCardId,
    activeCardData
  ) => {
    return new Promise((resolve) => {
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
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(
          (card) => card.id
        );

        // Tính toán vị trí mới của card trong column mới
        const overCardIndex = nextOverColumn.cards.findIndex(
          (card) => card.id === overCardId
        );

        let newCardIndex;
        if (overCardIndex >= 0) {
          const isBelowOverItem =
            active.rect.current.translated &&
            active.rect.current.translated.top >
            over.rect.top + over.rect.height;
          newCardIndex = overCardIndex + (isBelowOverItem ? 1 : 0);
        } else {
          newCardIndex = nextOverColumn.cards.length;
        }

        // Thêm card đang kéo vào column mới tại vị trí mới
        const rebuild_activeCardData = {
          ...activeCardData,
          columnId: nextOverColumn.id,
          position: newCardIndex, // Sử dụng chỉ số mảng làm position
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
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(
          (card) => card.id
        );

        // Xác định các card đã thay đổi
        const changedCardsMap = new Map();

        // Thêm card đang kéo vào danh sách thay đổi
        changedCardsMap.set(activeCardId, {
          id: activeCardId,
          position: newCardIndex, // Sử dụng chỉ số mảng làm position
          list_board_id: nextOverColumn.id,
        });

        // Thêm các card khác trong column hiện tại (nếu có)
        nextActiveColumn.cards.forEach((card, index) => {
          if (!card.FE_PlaceholderCard) {
            changedCardsMap.set(card.id, {
              id: card.id,
              position: index, // Sử dụng chỉ số mảng làm position
              list_board_id: nextActiveColumn.id,
            });
          }
        });

        // Thêm các card khác trong column mới (nếu có)
        nextOverColumn.cards.forEach((card, index) => {
          if (card.id !== activeCardId) {
            // Tránh thêm lại card đang kéo
            changedCardsMap.set(card.id, {
              id: card.id,
              position: index, // Sử dụng chỉ số mảng làm position
              list_board_id: nextOverColumn.id,
            });
          }
        });

        // Chuyển Map thành mảng
        const uniqueChangedCards = Array.from(changedCardsMap.values());

        // Trả về mảng chứa dữ liệu card thay đổi
        resolve(uniqueChangedCards);

        return nextColumns;
      });
    });
  };

  // Khi bắt đầu kéo
  const handleDragStart = (event) => {
    const { active } = event;
    if (!active) return;

    setActiveDragItemId(active?.id);

    // Kiểm tra xem đang kéo Column hay Card
    setActiveDragItemType(
      active?.data?.current?.columnId
        ? ACTIVE_DRAG_ITEM_TYPE.CARD
        : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    );

    setActiveDragItemData(active?.data?.current);

    // Nếu là Card, lưu lại cột cũ
    if (active?.data?.current?.columnId) {
      setOldColumnDraggingCard(findColumnByCardId(active?.id));
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!active || !over) return;

    const {
      id: activeItemId,
      data: { current: activeItemData },
    } = active;
    const { id: overItemId } = over;

    // Kiểm tra nếu đang kéo Column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      const activeColumnIndex = orderedColumns.findIndex(
        (c) => c.id === activeItemId
      );
      const overColumnIndex = orderedColumns.findIndex(
        (c) => c.id === overItemId
      );

      // Kiểm tra nếu cột đang kéo và cột được thả vào khác nhau
      if (
        activeColumnIndex !== -1 &&
        overColumnIndex !== -1 &&
        activeColumnIndex !== overColumnIndex
      ) {
        // Nếu active và over khác nhau thì mới di chuyển cột
        const dndOrderedColumns = arrayMove(
          orderedColumns,
          activeColumnIndex,
          overColumnIndex
        );
        setActiveList(true)
        setOrderedColumns(dndOrderedColumns);
      }
      return;
    }
    // Kiểm tra nếu đang kéo Card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // Tìm column của Card đang kéo và column mà thả vào
      const activeColumn = findColumnByCardId(activeItemId);
      const overColumn =
        findColumnByCardId(overItemId) ||
        orderedColumns.find((col) => col.id === overItemId);

      // Nếu có sự thay đổi cột, thực hiện việc di chuyển Card
      if (!activeColumn || !overColumn) return;

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
    }
  };
  // Kết thúc kéo một phần tử
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!active || !over) {
      return
    }
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
        ).then(async (changedCards) => {
          // Thêm async vào đây
          await useCardPositionsOutColumns(changedCards); // Sử dụng await
          // console.log("Dữ liệu card thay đổi:", changedCards);
        });
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
          // console.warn("Vị trí card không hợp lệ.");
          return;
        }

        // Kiểm tra nếu vị trí card không thay đổi
        if (oldCardIndex === newCardIndex) {
          // console.log("Card không thay đổi vị trí.");
          return; // Không cần cập nhật database hoặc state local
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

          // console.log("Cập nhật thành công:", filteredCards); // Sửa lại thành filteredCards
        } catch (error) {
          // console.error("Lỗi khi cập nhật database:", error);

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
      const activeIndex = orderedColumns.findIndex((c) => c.id === active.id);
      if (activeList) {
        const draggedColumn = orderedColumns.find(c => c.id === active.id);
        if (draggedColumn) {
          // Lấy chỉ mục hiện tại của draggedColumn trong orderedColumns
          const draggedColumnIndex = orderedColumns.findIndex((c) => c.id === draggedColumn.id);

          const newPosition = calculateItemPosition(draggedColumnIndex, orderedColumns, draggedColumn.id);

          draggedColumn.position = newPosition;
          const { boardId, id, position } = draggedColumn;

          updatePositionListMutation.mutate({
            listId: id,
            position: position,
            boardId: boardId,
          });
          setActiveList(false)
          console.log(orderedColumns)
        }
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

  // //Sử lý va chạm khi kéo thả
  const collisionDetectionStrategy = useCallback(
    (args) => {
      // Xử lý kéo thả column
      if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
        return closestCorners({ ...args });
      }

      // Xử lý kéo thả card
      if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
        // Xác định các phần tử nằm dưới con trỏ
        const pointerIntersections = pointerWithin(args);
        const intersections =
          pointerIntersections.length > 0
            ? pointerIntersections
            : rectIntersection(args);

        // Lấy ID của phần tử đầu tiên va chạm
        let overId = getFirstCollision(intersections, "id");

        // Nếu không tìm thấy overId, trả về lastOverId (nếu có)
        if (!overId) {
          return lastOverId.current ? [{ id: lastOverId.current }] : [];
        }
        // Kiểm tra nếu overId là một column
        const checkColumn = orderedColumns.find((column) => column.id === overId);
        if (checkColumn) {
          // Nếu column trống, trả về column đó
          if (checkColumn.cards.length === 0) {
            lastOverId.current = overId;
            return [{ id: overId }];
          }

          // Nếu column không trống, tìm phần tử gần nhất trong column
          const closestIntersection = closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter((container) => {
              return (
                container.id !== overId &&
                checkColumn?.cardOrderIds?.includes(container.id)
              );
            }),
          })[0];

          if (closestIntersection) {
            overId = closestIntersection.id;
          }

          // Kiểm tra xem card đang kéo có nằm ở phía trên card đầu tiên của column hay không
          const firstCardInColumn = checkColumn.cards[0];
          if (firstCardInColumn) {
            const firstCardRect = document
              .getElementById(firstCardInColumn.id)
              ?.getBoundingClientRect();
            const draggedCardRect = args.collisionRect;

            if (draggedCardRect && firstCardRect) {
              // Nếu card đang kéo nằm ở phía trên card đầu tiên
              if (draggedCardRect.top < firstCardRect.top) {
                overId = checkColumn.id; // Chèn vào đầu column
              }
            }
          }
        }

        // Cập nhật lastOverId và trả về kết quả
        lastOverId.current = overId;
        return [{ id: overId }];
      }

      // Trường hợp mặc định (nếu có)
      return [];
    },
    [activeDragItemType, orderedColumns]
  );

  return (
    <>
      <BoardBar />
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
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

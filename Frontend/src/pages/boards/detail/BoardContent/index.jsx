import { Box } from "@mui/material";
import { useParams } from "react-router-dom";

import { cloneDeep, isEmpty } from "lodash";
import axios from "axios";
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
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useEffect, useRef, useState } from "react";
// import Column from "./Column";

const ACTIVE_DRAG_ITEM_TYPE = {
    COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
    CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};

const BoardContent = () => {

    const { boardId } = useParams();
    const [lists, setLists] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(0);

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

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!active || !over || active.id === over.id) return;

        const oldIndex = lists.findIndex((list) => list.id === Number(active.id));
        const newIndex = lists.findIndex((list) => list.id === Number(over.id));
        if (oldIndex === -1 || newIndex === -1) return;

        const updatedLists = arrayMove(lists, oldIndex, newIndex);
        setLists(updatedLists);
        const timestamp = Date.now();
        // setDraggingListId(null);
        // setDraggingPosition(null);

        const updatedPositions = updatedLists.map((list, index) => ({
            id: list.id,
            position: index + 1,
            // name: list.name,
        }));

        axios.put(`http://127.0.0.1:8000/api/lists/reorder`, {
            board_id: boardId,
            positions: updatedPositions,
            timestamp
        }).catch(error => console.error("❌ Lỗi cập nhật vị trí:", error));

        setLastUpdate(timestamp);
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
                {/* <Column lists={lists} /> */}
            </Box>
        </DndContext>
    );
};

export default BoardContent;

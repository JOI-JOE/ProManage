import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Box } from "@mui/material";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import Col from "./Col";
import Col_new from "./Col_new";
import { useCreateList } from "../../../../../hooks/useList";
import { SPACING } from "../../../../../../utils/position.constant";
import { optimisticIdManager } from "../../../../../../utils/optimisticIdManager";

const Col_list = React.memo(({ columns = [], boardId }) => {
    const [openColumn, setOpenColumn] = useState(false);
    const [localColumns, setLocalColumns] = useState(columns || []);
    const { createList, isSaving } = useCreateList(boardId);
    const localColumnsRef = useRef(localColumns);

    useEffect(() => {
        localColumnsRef.current = localColumns;
    }, [localColumns]);

    useEffect(() => {
        setLocalColumns(columns || []);
    }, [columns]);

    // Memo danh sách ID cho SortableContext
    const sortableItems = useMemo(
        () => localColumns.map((c) => c.id).filter(Boolean),
        [localColumns]
    );

    const saveList = useCallback(
        async (name) => {
            if (!name || isSaving || !boardId) return;

            const optimisticId = `temp-${Date.now()}`;
            const currentColumns = localColumnsRef.current;
            const maxPosition = currentColumns.length
                ? currentColumns[currentColumns.length - 1].position + SPACING
                : SPACING;

            const newColumn = {
                id: optimisticId,
                board_id: boardId,
                name,
                position: maxPosition,
                isOptimistic: true,
            };

            // Cập nhật UI ngay lập tức
            setLocalColumns((prev) => [...prev, newColumn]);
            setOpenColumn(false);

            // Di chuyển handleCreateList ra ngoài useCallback để giảm re-render
            try {
                const response = await createList({
                    boardId,
                    name,
                    pos: maxPosition,
                });

                // const { success, data } = response.data;

                // if (success && data?.id) {
                //     setLocalColumns((prev) =>
                //         prev.map((col) =>
                //             col.id === optimisticId
                //                 ? { ...data, isOptimistic: false }
                //                 : col
                //         )
                //     );
                // } else {
                //     throw new Error("Invalid response from server");
                // }
            } catch (error) {
                console.error("Error creating list:", error);
                setLocalColumns((prev) =>
                    prev.filter((col) => col.id !== optimisticId)
                );
            }
        },
        [boardId, createList, isSaving, localColumnsRef] // Thêm localColumnsRef vào dependencies
    );

    return (
        <SortableContext items={sortableItems} strategy={horizontalListSortingStrategy}>
            <Box
                sx={{
                    bgcolor: "inherit",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    overflowX: "auto",
                    overflowY: "hidden",
                    "&::-webkit-scrollbar-track": { m: 2 },
                }}
            >
                {localColumns.map(column => (
                    <Col key={column.id} column={column} />
                ))}
                <Col_new open={openColumn} setOpen={setOpenColumn} onAdd={saveList} />
            </Box>
        </SortableContext>
    );
});

export default Col_list;
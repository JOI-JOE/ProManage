import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Box } from "@mui/material";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import Col from "./Col";
import Col_new from "./Col_new";
import { useCreateList } from "../../../../../hooks/useList";
import { SPACING } from "../../../../../../utils/position.constant";
import { optimisticIdManager } from "../../../../../../utils/optimisticIdManager";

const Col_list = React.memo(({ columns = [], boardId }) => {
    const [openColumn, setOpenColumn] = useState(false);
    const [localColumns, setLocalColumns] = useState(columns);
    const { createList, isSaving } = useCreateList(boardId);

    // Sync localColumns với columns chỉ khi cần
    useEffect(() => {
        if (localColumns !== columns) {
            setLocalColumns(columns);
        }
    }, [columns]);

    // Memoize danh sách ID cho SortableContext
    const sortableItems = useMemo(() =>
        localColumns.map(c => c.id).filter(Boolean),
        [localColumns]
    );

    // Tối ưu hàm saveList
    const saveList = useCallback(async (name) => {
        if (!name || isSaving) return;

        const optimisticId = optimisticIdManager.generateOptimisticId("list");
        const maxPosition = localColumns.length
            ? localColumns[localColumns.length - 1].position + SPACING
            : SPACING;

        const newColumn = {
            id: optimisticId,
            board_id: boardId,
            title: name,
            position: maxPosition
        };

        setLocalColumns(prev => [...prev, newColumn]);

        try {
            await createList({ boardId, name, pos: maxPosition });
        } catch (error) {
            console.error("❌ Lỗi khi tạo danh sách:", error);
            setLocalColumns(prev => prev.filter(col => col.id !== optimisticId));
        }
    }, [boardId, createList, isSaving, localColumns.length]);

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
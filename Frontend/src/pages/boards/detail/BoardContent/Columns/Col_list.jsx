import { useEffect, useState, useCallback } from "react";
import { Box } from "@mui/material";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import Col from "./Col";
import Col_new from "./Col_new";
import { useCreateList } from "../../../../../hooks/useList";
import { optimisticIdManager } from "../../../../../hooks/optimistic/optimisticIdManager";
import { SPACING } from "../../../../../../utils/position.constant";

const Col_list = ({ columns = [], boardId }) => {
    const [openColumn, setOpenColumn] = useState(false);
    const [localColumns, setLocalColumns] = useState(columns);
    const { createList, isSaving } = useCreateList(boardId);

    useEffect(() => {
        if (JSON.stringify(localColumns) !== JSON.stringify(columns)) {
            setLocalColumns(columns);
        }
    }, [columns]);

    const saveList = useCallback(async (name) => {
        if (!name || isSaving) return;

        const optimisticId = optimisticIdManager.generateOptimisticId("list"); // Định nghĩa bên ngoài
        let pos = 0;

        setLocalColumns((prev) => {
            const maxPosition = prev.length > 0 ? Math.max(...prev.map(col => col.position)) : 0;
            pos = maxPosition + SPACING; // Cập nhật giá trị pos

            return [
                ...prev,
                { id: optimisticId, board_id: boardId, title: name, position: pos },
            ];
        });

        try {
            await createList({ boardId, name, pos });
        } catch (error) {
            console.error("❌ Lỗi khi tạo danh sách:", error);
            setLocalColumns((prev) => prev.filter((col) => col.id !== optimisticId));
        }
    }, [isSaving, createList, boardId]);

    return (
        <SortableContext
            items={localColumns.map((c) => c.id).filter(Boolean)}
            strategy={horizontalListSortingStrategy}
        >
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
                {localColumns.map((column) => (
                    <Col key={column.id} column={column} />
                ))}

                <Col_new open={openColumn} setOpen={setOpenColumn} onAdd={saveList} />
            </Box>
        </SortableContext>
    );
};

export default Col_list;

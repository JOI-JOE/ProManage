import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useDroppable } from "@dnd-kit/core";
import { Box } from "@mui/material";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useLists } from "../../../../../hooks/useList";
import useAddColumn from "../../../../../hooks/useAddColumn";
import Col from "./Col";
import Col_new from "./Col_new";

const Col_list = ({ lists, activeColumn, onColumnDrop }) => {
    const { boardId } = useParams();
    const { createList } = useLists(boardId);
    const { openColumn, setOpenColumn, columnName, setColumnName, addColumn } = useAddColumn(createList);

    const { setNodeRef, isOver } = useDroppable({
        id: `column-drop-area-${boardId}`,
        data: {
            type: 'column-drop-area', // Quan trọng: Đảm bảo type là "column-drop-area"
            boardId,
        },
    });

    return (
        <Box
            ref={setNodeRef}
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
            {/* SortableContext để quản lý việc kéo thả các column */}
            <SortableContext items={lists.map((list) => list.id)} strategy={horizontalListSortingStrategy}>
                {/* Hiển thị các column */}
                {lists?.map((column) => (
                    <Col key={column.id} list={column} isDragging={activeColumn?.id === column.id} />
                ))}
            </SortableContext>
            {/* Footer cột để tạo mới column */}
            <Col_new
                open={openColumn}
                setOpen={setOpenColumn}
                columnName={columnName}
                setColumnName={setColumnName}
                onAdd={addColumn}
            />
        </Box>
    );
};

export default Col_list;
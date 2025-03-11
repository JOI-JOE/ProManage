import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";
import Col from "./Col";
import Col_new from "./Col_new";
import { useCreateList } from "../../../../../hooks/useList";

const Col_list = ({ columns, boardId }) => {
    const [openColumn, setOpenColumn] = useState(false);
    const [columnName, setColumnName] = useState("");
    const createListMutation = useCreateList();
    const [localColumns, setLocalColumns] = useState(columns || []);

    useEffect(() => {
        setLocalColumns(columns || []);
    }, [columns]);

    const toggleOpenColumn = () => setOpenColumn(!openColumn);

    const handleAddColumn = async (columnName) => {
        if (!columnName.trim()) return;

        // 🆕 Tạo ID tạm thời cho cột mới
        const tempId = `temp-${uuidv4()}`;
        const newColumn = {
            id: tempId, // Dùng id thay vì `dcs`
            board_id: boardId,
            title: columnName,
            position: localColumns.length
                ? Math.max(...localColumns.map((col) => col.position)) + 1000
                : 1000,
        };

        setLocalColumns((prev) => [...prev, newColumn]);
        setColumnName("");
        setOpenColumn(false);

        try {
            await createListMutation.mutateAsync({ newColumn });
        } catch (error) {
            console.error("Lỗi khi tạo column:", error);
            setLocalColumns((prev) => prev.filter((col) => col.id !== tempId));
        }
    };

    return (
        <SortableContext items={localColumns.map(c => c.id) || []} strategy={horizontalListSortingStrategy}>
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
                {/* Render các cột */}
                {localColumns.map(column => (
                    <Col key={column.id} column={column} />
                ))}

                {/* Box Add Column */}
                <Col_new open={openColumn} setOpen={setOpenColumn} onAdd={handleAddColumn} />
            </Box>
        </SortableContext>
    );
};

export default Col_list;
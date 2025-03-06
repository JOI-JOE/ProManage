import { useState, useEffect, useCallback } from "react";
import { Box } from "@mui/material";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { toast } from "react-toastify";
import { useCreateList } from "../../../../../hooks/useList";
import Col from "./Col";
import Col_new from "./Col_new";
import { useParams } from "react-router-dom";

const Col_list = ({ columns: initialColumns }) => {
    const { boardId } = useParams();
    const [columns, setColumns] = useState([]);
    const createListMutation = useCreateList();

    useEffect(() => {
        setColumns(initialColumns); // Cập nhật columns khi API trả về dữ liệu mới
    }, [initialColumns]); // Chỉ chạy khi initialColumns thay đổi

    const [openColumn, setOpenColumn] = useState(false);
    const [columnName, setColumnName] = useState("");

    const toggleOpenColumn = () => setOpenColumn(!openColumn);

    const handleAddColumn = useCallback(async (columnName) => {
        if (!columnName.trim()) {
            toast.error("Nhập tên cột");
            return;
        }
        try {
            // Tạo dữ liệu gửi lên backend
            const newColumn = {
                id: Date.now(),
                board_id: boardId,
                title: columnName,
                position: Array.isArray(columns) && columns.length
                    ? Math.max(...columns.map(column => column.position)) + 1000
                    : 1000,
            };

            setColumns((prevColumns) => [...prevColumns, newColumn]);
            setColumnName("");
            toggleOpenColumn();
            await createListMutation.mutateAsync({ newColumn });
            // toast.success("Tạo danh sách thành công!");

        } catch (error) {
            console.error("Lỗi khi tạo danh sách:", error);
            toast.error("Có lỗi xảy ra khi tạo danh sách!");
        }
    }, [boardId, columns, createListMutation]);

    return (
        <SortableContext items={columns?.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
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
                {columns?.map((column) => (
                    <Col key={column.id} column={column} />
                ))}

                {/* Box Add Column */}
                <Col_new open={openColumn} setOpen={setOpenColumn} onAdd={handleAddColumn} />
            </Box>
        </SortableContext>
    );
};

export default Col_list;

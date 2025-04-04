import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
    Box,
    Alert,
    Button,
    Snackbar
} from "@mui/material";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import Col from "./Col";
import Col_new from "./Col_new";
import { useCreateList, useUpdateListClosed } from "../../../../../hooks/useList";
import { SPACING } from "../../../../../../utils/position.constant";

const Col_list = React.memo(({ columns = [], boardId }) => {
    const [openColumn, setOpenColumn] = useState(false);
    const [localColumns, setLocalColumns] = useState(columns || []);
    const { createList, isSaving } = useCreateList(boardId);
    const localColumnsRef = useRef(localColumns);

    // Liên quan đên lưu chữ 
    const [showAlert, setShowAlert] = useState(false);
    const archivedColumnRef = useRef(null); // Reference to the archived column
    const { mutate: closeList } = useUpdateListClosed();
    ///----------------------------------------------------------------------

    // Cập nhật localColumns khi columns thay đổi
    useEffect(() => {
        setLocalColumns(columns || []);
    }, [columns]);

    // Hàm lưu trữ cột
    const handleArchive = (columnId) => {
        setLocalColumns((prevColumns) => {
            const updatedColumns = prevColumns.filter((column) => column.id !== columnId);

            if (updatedColumns.length !== prevColumns.length) {
                const removedColumn = prevColumns.find((column) => column.id === columnId);
                archivedColumnRef.current = removedColumn;
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 6000); // Tắt alert sau 5 giây
            }
            return updatedColumns;
        });
    };

    const handleUndoArchive = () => {
        const archived = archivedColumnRef.current;
        if (!archived) return;

        // Sử dụng position gốc của cột (được lưu trong archivedColumnRef.current)
        const restoredColumn = { ...archived }; // Giữ nguyên position cũ

        // Cập nhật giao diện ngay lập tức
        setLocalColumns((prevColumns) => {
            const updatedColumns = [...prevColumns, restoredColumn];
            return updatedColumns.sort((a, b) => a.position - b.position); // Sắp xếp lại theo position
        });

        // Reset alert và tham chiếu
        setShowAlert(false);
        archivedColumnRef.current = null;

        // Gọi API để đồng bộ với server (không đợi API để cập nhật UI)
        closeList({
            listId: archived.id,
            closed: 0,
        }).catch((error) => {
            console.error("Lỗi khi khôi phục:", error);
            setLocalColumns((prevColumns) =>
                prevColumns.filter((column) => column.id !== archived.id)
            );
            setShowAlert(true); // Hiển thị lại alert nếu có lỗi
        });
    };


    // Memo hóa danh sách ID cho SortableContext
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
                closed: 0,
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
        <>
            <Snackbar
                open={showAlert}
                autoHideDuration={null}  // Không tự động ẩn
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                sx={{
                    bottom: { xs: 70, sm: 24 },
                    left: { xs: 8, sm: 16 }
                }}
            >
                <Alert
                    severity="success"
                    onClose={() => setShowAlert(false)}
                    sx={{
                        width: "100%",
                        maxWidth: "360px",
                        backgroundColor: "#ffffff",
                        color: "rgba(0, 0, 0, 0.87)",
                        boxShadow: "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)",
                        borderRadius: "4px",
                        padding: "6px 16px",
                        fontSize: "0.875rem",
                        fontWeight: 400,
                        lineHeight: 1.43,
                        "& .MuiAlert-icon": {
                            color: "#4caf50",
                            marginRight: "12px",
                            padding: "7px 0",
                            fontSize: "22px"
                        },
                        "& .MuiAlert-message": {
                            padding: "8px 0",
                            display: "flex",
                            alignItems: "center"
                        },
                        "& .MuiAlert-action": {
                            paddingLeft: "16px",
                            marginRight: "-8px",
                            alignItems: "center"
                        }
                    }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={handleUndoArchive}
                            sx={{
                                textTransform: "none",
                                color: "black",
                                font: "bold",
                                background: "rgba(25, 118, 210, 0.04)",
                                fontSize: "0.8125rem",
                                fontWeight: 500,
                                lineHeight: 1.75,
                                padding: "3px 9px",
                                borderRadius: "4px",
                                "&:hover": {
                                    backgroundColor: "#0000003d"
                                }
                            }}
                        >
                            Undo
                        </Button>
                    }
                >
                    Đã lưu danh sách
                </Alert>
            </Snackbar>

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
                        <Col key={column.id} column={column} onArchive={handleArchive} />
                    ))}
                    <Col_new open={openColumn} setOpen={setOpenColumn} onAdd={saveList} />
                </Box>
            </SortableContext>
        </>

    );
});

export default Col_list;
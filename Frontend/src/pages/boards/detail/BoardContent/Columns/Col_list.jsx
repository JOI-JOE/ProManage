import { useState, useEffect } from "react";
import { Box, Button, TextField } from "@mui/material";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import CloseIcon from "@mui/icons-material/Close";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { toast } from "react-toastify";
import Col from "./Col";
import { useCreateList } from "../../../../../hooks/useList";

const Col_list = ({ columns: initialColumns, boardId }) => {
    const [columns, setColumns] = useState([]);
    const createListMutation = useCreateList();

    useEffect(() => {
        setColumns(initialColumns); // Cập nhật columns khi API trả về dữ liệu mới
    }, [initialColumns]); // Chỉ chạy khi initialColumns thay đổi

    const [openColumn, setOpenColumn] = useState(false);
    const [columnName, setColumnName] = useState("");

    const toggleOpenColumn = () => setOpenColumn(!openColumn);

    const addColumn = async () => {
        if (!columnName.trim()) {
            toast.error("Nhập tên cột");
            return;
        }
        try {
            // Tạo dữ liệu gửi lên backend
            const newColumn = {
                id: Date.now(),
                board_id: Number(boardId),
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
    };


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
                {openColumn ? (
                    <Box
                        sx={{
                            minWidth: "250px",
                            maxWidth: "250px",
                            mx: 2,
                            p: 1,
                            borderRadius: "6px",
                            height: "fit-content",
                            bgcolor: "#ffffff3d",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                        }}
                    >
                        <TextField
                            label="Enter..."
                            type="text"
                            size="small"
                            variant="outlined"
                            autoFocus
                            value={columnName}
                            onChange={(e) => setColumnName(e.target.value)}
                            sx={{
                                "& label": { color: "white" },
                                "& input": { color: "white", fontSize: "14px" },
                                "& label.Mui-focused": { color: "white" },
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": { borderColor: "white" },
                                    "&:hover fieldset": { borderColor: "white" },
                                    "&.Mui-focused fieldset": { borderColor: "white" },
                                },
                            }}
                        />
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Button
                                onClick={addColumn}
                                variant="contained"
                                color="success"
                                size="small"
                                sx={{
                                    boxShadow: "none",
                                    border: "none",
                                    bgcolor: "teal",
                                }}
                            >
                                Add Column
                            </Button>
                            <CloseIcon
                                fontSize="small"
                                sx={{ color: "white", cursor: "pointer" }}
                                onClick={toggleOpenColumn}
                            />
                        </Box>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            minWidth: "200px",
                            maxWidth: "200px",
                            mx: 2,
                            borderRadius: "6px",
                            height: "fit-content",
                            bgcolor: "#ffffff3d",
                        }}
                    >
                        <Button
                            startIcon={<NoteAddIcon />}
                            sx={{
                                color: "#ffffff",
                                width: "100%",
                                justifyContent: "flex-start",
                                pl: 2.5,
                                py: 1,
                            }}
                            onClick={toggleOpenColumn}
                        >
                            Add new column
                        </Button>
                    </Box>
                )}
            </Box>
        </SortableContext>
    );
};

export default Col_list;

import { Box, Button, TextField } from "@mui/material";
import Column from "./Column/Column";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import CloseIcon from "@mui/icons-material/Close";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useLists } from "../../../../../hooks/useList";

const ListColumns = ({ lists }) => {
  // const [openColumn, setOpenColumn] = useState(false); // State để kiểm soát hiển thị input
  const toggleOpenColumn = () => setOpenColumn(!openColumn);

  const { boardId } = useParams(); // Lấy boardId từ URL
  const { createList } = useLists(boardId); // Sử dụng custom hook để gọi API tạo danh sách
  const [openColumn, setOpenColumn] = useState(false); // State để kiểm soát hiển thị input
  const [columnName, setColumnName] = useState("");
  // console.log(boardId);
  // const [columnName, setColumnName] = useState("");

  const addColumn = async () => {
    if (!columnName.trim()) {
      toast.error("Nhập tên cột");
      return;
    }

    try {
      // Gửi tên cột mới đến API để tạo
      await createList(columnName);
      setColumnName(""); // Reset input sau khi tạo thành công
      toggleOpenColumn(); // Đóng lại input
    } catch (error) {
      toast.error("Lỗi khi thêm cột");
      console.error("Lỗi khi thêm cột:", error);
    }
  };

  return (
    <SortableContext
      items={lists.map((list) => String(list.id))}
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

          "&::-webkit-scrollbar-track": {
            m: 2,
          },
        }}
      >
        {lists.map((list) => (
          <Column key={list.id} list={list} />
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
                sx={{
                  color: "white",
                  cursor: "pointer",
                }}
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

export default ListColumns;

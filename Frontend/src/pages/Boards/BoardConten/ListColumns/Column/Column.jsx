import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import AddCardIcon from "@mui/icons-material/AddCard";
import CloseIcon from "@mui/icons-material/Close";
import ListCards from "./ListCards/ListCards";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "react-toastify";
import CopyIcon from "@mui/icons-material/FileCopy";
import MoveIcon from "@mui/icons-material/MoveToInbox";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmDeleteDialog from "./Menu/DeleteColumn"; // Xác nhận xóa
import CopyColumn from "./Menu/CoppyColumn";

const Column = ({ column, onUpdateColumnTitle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column._id, data: { ...column } });

  const columnStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    height: "100%",
    opacity: isDragging ? 0.5 : undefined,
  };

  // State chỉnh sửa tiêu đề
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column?.title || "Nhập tiêu đề");

  // State menu dropdown
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // State hiển thị form sao chép cột
  const [openCopyDialog, setOpenCopyDialog] = useState(false);

  // State hiển thị form xác nhận xóa
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Khi click vào tiêu đề -> chỉnh sửa
  const handleTitleClick = () => setIsEditing(true);
  const handleTitleChange = (e) => setTitle(e.target.value);

  // Lưu tiêu đề khi nhấn Enter hoặc click ra ngoài
  const handleTitleBlur = () => {
    setIsEditing(false);
    if (onUpdateColumnTitle) {
      onUpdateColumnTitle(column._id, title);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    }
  };

  // Thêm card mới
  const [openCard, setOpenCard] = useState(false);
  const [cardName, setCardName] = useState("");
  const addCard = () => {
    if (!cardName.trim()) {
      toast.error("Nhập tên thẻ!");
      return;
    }
    console.log("Thêm thẻ:", cardName);
    setCardName("");
    setOpenCard(false);
  };

  // Mở form sao chép khi nhấn vào "Copy"
  const handleCopyClick = () => {
    setOpenCopyDialog(true); // Mở form sao chép
    setAnchorEl(null); // Đóng menu sau khi nhấn vào "Copy"
  };

  // Xử lý sao chép cột
  const handleCopyConfirm = (newTitle) => {
    console.log("Cột đã sao chép với tên mới:", newTitle);
    setOpenCopyDialog(false); // Đóng form sao chép sau khi sao chép
  };

  // Hủy sao chép cột
  const handleCopyCancel = () => {
    setOpenCopyDialog(false); // Đóng form khi hủy
  };

  // Mở form xác nhận xóa khi nhấn vào "Remove this column"
  const handleDeleteClick = () => {
    setOpenDeleteDialog(true); // Mở form xác nhận xóa
  };

  // Xác nhận xóa cột
  const handleDeleteConfirm = () => {
    console.log("Cột đã bị xóa");
    setOpenDeleteDialog(false); // Đóng form sau khi xóa
  };

  // Hủy xác nhận xóa cột
  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false); // Đóng form khi hủy
  };

  return (
    <div ref={setNodeRef} style={columnStyle} {...attributes}>
      <Box
        {...listeners}
        sx={{
          minWidth: "245px",
          maxWidth: "245px",
          backgroundColor: "#dcdde1",
          ml: 2,
          borderRadius: "6px",
          height: "fit-content",
        }}
      >
        {/* Tiêu đề cột + Menu con */}
        <Box
          sx={{
            height: "40px",
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {isEditing ? (
            <TextField
              value={title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              variant="outlined"
              size="small"
              sx={{
                height: "20px",
                "& .MuiOutlinedInput-root": {
                  padding: "px",
                  fontSize: "0.8rem",
                  "& fieldset": {
                    borderColor: "teal !important", // Viền 0.5px màu teal
                    borderWidth: "0.5px !important",
                  },
                  "&:hover fieldset": {
                    borderColor: "teal",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "teal",
                  },
                },
                "& .MuiInputBase-input": {
                  padding: "4px 8px",
                },
              }}
            />
          ) : (
            <Typography
              sx={{
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "0.8rem",
                minHeight: "20px",
                display: "flex",
                alignItems: "center",
                backgroundColor: title ? "transparent" : "#DCDDE1",
              }}
              onClick={handleTitleClick}
            >
              {title || "Title"}
            </Typography>
          )}

          {/* Nút mở menu con */}
          <Tooltip title="Tùy chọn">
            <KeyboardArrowDownIcon
              sx={{ color: "secondary.main", cursor: "pointer" }}
              onClick={handleMenuClick}
            />
          </Tooltip>

          {/* Menu dropdown */}
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            sx={{ "& .MuiPaper-root": { minWidth: "180px" } }}
          >
            <MenuItem onClick={handleCopyClick} sx={{ fontSize: "0.8rem" }}>
              <CopyIcon sx={{ marginRight: 1 }} />
              Copy
            </MenuItem>
            {/* <MenuItem onClick={handleMenuClose} sx={{ fontSize: "0.8rem" }}>
              <MoveIcon sx={{ marginRight: 1 }} />
              Move
            </MenuItem> */}
            <MenuItem onClick={handleMenuClose} sx={{ fontSize: "0.8rem" }}>
              <VisibilityIcon sx={{ marginRight: 1 }} />
              Theo dõi
            </MenuItem>
            <MenuItem onClick={handleMenuClose} sx={{ fontSize: "0.8rem" }}>
              <ArchiveIcon sx={{ marginRight: 1 }} />
              Archive this column
            </MenuItem>
            <MenuItem onClick={handleDeleteClick} sx={{ fontSize: "0.8rem" }}>
              <DeleteIcon sx={{ marginRight: 1 }} />
              Remove this column
            </MenuItem>
          </Menu>
        </Box>

        {/* Danh sách thẻ */}
        <ListCards cards={column.cards} />

        {/* Footer: Thêm thẻ mới */}
        <Box
          sx={{
            height: "40px",
            p: 2,
          }}
        >
          {!openCard ? (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Button
                startIcon={<AddCardIcon />}
                sx={{ color: "primary.dark" }}
                onClick={() => setOpenCard(true)}
              >
                Add new card
              </Button>
              <Tooltip title="Kéo để di chuyển">
                <DragHandleIcon sx={{ cursor: "pointer" }} />
              </Tooltip>
            </Box>
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <TextField
                label="Nhập tên thẻ..."
                type="text"
                size="small"
                variant="outlined"
                autoFocus
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                sx={{
                  "& label": { color: "teal" },
                  "& input": { color: "black", fontSize: "14px" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "teal !important",
                      borderWidth: "0.5px !important",
                    },
                    "&:hover fieldset": { borderColor: "teal" },
                    "&.Mui-focused fieldset": { borderColor: "teal" },
                  },
                }}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  onClick={addCard}
                  variant="contained"
                  color="success"
                  size="small"
                  sx={{
                    boxShadow: "none",
                    border: "none",
                    bgcolor: "teal",
                  }}
                >
                  Add
                </Button>
                <CloseIcon
                  fontSize="small"
                  sx={{
                    color: "teal",
                    cursor: "pointer",
                  }}
                  onClick={() => setOpenCard(false)}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Hiển thị form sao chép */}
      <CopyColumn
        open={openCopyDialog}
        onClose={() => setOpenCopyDialog(false)}
        onCopy={handleCopyConfirm}
      />

      {/* Hiển thị form xác nhận xóa */}
      <ConfirmDeleteDialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default Column;

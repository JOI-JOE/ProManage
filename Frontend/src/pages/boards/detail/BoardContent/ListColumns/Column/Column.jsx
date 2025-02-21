import { useState } from "react";
import { Box, Button, TextField, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ArchiveIcon from "@mui/icons-material/Archive";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoveUpIcon from "@mui/icons-material/MoveUp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddCardIcon from "@mui/icons-material/AddCard";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import ListCards from "./ListCards/ListCards";
import { mapOrder } from "../../../../../../../utils/sort";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "react-toastify";
import CopyColumn from "./Menu/CoppyColumn";
import ConfirmDeleteDialog from "./Menu/DeleteColumn";
import ArchiveColumnDialog from "./Menu/Archive";

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: "rgb(55, 65, 81)",
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        color: "#000",
        marginRight: theme.spacing(1.5),
      },
      "&:active": {},
    },
    ...theme.applyStyles("dark", {
      color: theme.palette.grey[300],
    }),
  },
}));

const Column = ({ column }) => {
  // State hiển thị form sao chép cột
  const [openCopyDialog, setOpenCopyDialog] = useState(false);
  // State hiển thị form xác nhận xóa
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  // State hiển thị form lưu trữ
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);

  //============================================================ COPY======================================================

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

  //============================================================ REMOVE======================================================

  // Mở form xác nhận xóa khi nhấn vào "Remove this column"
  const handleDeleteClick = () => {
    setOpenDeleteDialog(true); // Mở form xác nhận xóa
    setAnchorEl(null); // Đóng menu sau khi nhấn vào "Remove this column"
  };

  // Xác nhận xóa cột
  const handleDeleteConfirm = () => {
    console.log("Cột đã bị xóa");
    setOpenDeleteDialog(false); // Đóng form sau khi xóa
  };

  //============================================================ ARCHIVE======================================================

  // Xử lý mở form lưu trữ khi click "Archive this column"
  const handleArchiveClick = () => {
    setOpenArchiveDialog(true);
    setAnchorEl(null);
  };

  // Xử lý xác nhận lưu trữ
  const handleArchiveConfirm = () => {
    console.log("Cột đã được lưu trữ");
    setOpenArchiveDialog(false);
  };

  //======================================== Thêm card mới========================================
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

  // Chức năng sửa tiêu đề
  const [title, setTitle] = useState(column?.title);
  const [isEditing, setIsEditing] = useState(false);
  const [prevTitle, setPrevTitle] = useState(column?.title); // Lưu giá trị trước đó

  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const handleTitleUpdate = (e) => {
    if (e.type === "blur" || (e.type === "keydown" && e.key === "Enter")) {
      if (!title.trim()) {
        setTitle(prevTitle); // Trả về giá trị trước đó nếu rỗng
      } else {
        setPrevTitle(title); // Cập nhật giá trị trước đó nếu có thay đổi
      }
      setIsEditing(false);
    }
  };

  // Kéo thả
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

  //dropdown trong MUI
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  //Sắp xếp card
  const orderedCards = mapOrder(column?.cards, column?.cardOrderIds, "_id");

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
        {/* Colum Header */}
        <Box
          sx={{
            height: (theme) => theme.trello.columnFooterHeight,
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Sửa tiêu đề */}
          {isEditing ? (
            <TextField
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setPrevTitle(title)} // Cập nhật giá trị trước đó khi bắt đầu chỉnh sửa
              onBlur={handleTitleUpdate}
              onKeyDown={handleTitleUpdate}
              autoFocus
              variant="outlined"
              size="small"
              sx={{
                height: "20px",
                width: "200px",
                "& .MuiInputBase-input": {
                  fontSize: "0.765rem",
                  padding: "4px",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "teal", // Màu viền
                  },
                  "&:hover fieldset": {
                    borderColor: "teal", // Màu viền khi hover
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "teal", // Màu viền khi focus
                  },
                },
              }}
            />
          ) : (
            <Typography
              sx={{
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "0.8rem",
                color: "#333",
              }}
              onClick={handleTitleClick}
            >
              {title}
            </Typography>
          )}

          <Box>
            <Tooltip title="More option">
              <KeyboardArrowDownIcon
                sx={{ color: "secondary.main", cursor: "pointer" }}
                id="basic-column-dropdown"
                aria-controls={open ? "basic-menu-column-dropdown" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
              />
            </Tooltip>

            <StyledMenu
              id="demo-customized-menu-workspace"
              MenuListProps={{
                "aria-labelledby": "basic-column-dropdown",
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              {...(!open && { inert: "true" })}
            >
              <MenuItem
                onClick={handleCopyClick}
                disableRipple
                sx={{ fontSize: "0.85rem", color: "secondary.main" }}
              >
                <ContentCopyIcon />
                Coppy
              </MenuItem>
              <MenuItem
                onClick={handleClose}
                disableRipple
                sx={{ fontSize: "0.85rem", color: "secondary.main" }}
              >
                <MoveUpIcon />
                Move
              </MenuItem>
              <MenuItem
                onClick={handleClose}
                disableRipple
                sx={{ fontSize: "0.85rem", color: "secondary.main" }}
              >
                <VisibilityIcon />
                Theo dõi
              </MenuItem>

              <Divider sx={{ my: 0.5 }} />

              <MenuItem
                onClick={handleArchiveClick}
                disableRipple
                sx={{ fontSize: "0.85rem", color: "secondary.main" }}
              >
                <ArchiveIcon />
                Archive this column
              </MenuItem>

              <MenuItem
                onClick={handleDeleteClick}
                disableRipple
                sx={{ fontSize: "0.85rem", color: "secondary.main" }}
              >
                <DeleteForeverIcon />
                Remove this column
              </MenuItem>
            </StyledMenu>
          </Box>
        </Box>

        {/* Column List Cart */}
        <ListCards cards={orderedCards} />

        {/* Colum Footer */}
        <Box
          sx={{
            height: (theme) => theme.trello.columnHeaderHeight,
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
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

      {/* Hiển thị form lưu trữ */}
      <ArchiveColumnDialog
        open={openArchiveDialog}
        onClose={() => setOpenArchiveDialog(false)}
        onConfirm={handleArchiveConfirm}
      />

      {/* Hiển thị form sao chép */}
      <CopyColumn
        open={openCopyDialog}
        onClose={() => setOpenCopyDialog(false)}
        onCopy={handleCopyConfirm}
      />

      {/* Hiển thị form xác nhận xóa */}
      <ConfirmDeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default Column;

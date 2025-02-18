// import { useState } from "react";
// import { Box, Button, Tooltip, Typography, Menu, MenuItem, Divider } from "@mui/material";
// import { styled } from "@mui/material/styles";
// import ArchiveIcon from "@mui/icons-material/Archive";
// import ContentCopyIcon from "@mui/icons-material/ContentCopy";
// import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
// import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
// import MoveUpIcon from "@mui/icons-material/MoveUp";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import AddCardIcon from "@mui/icons-material/AddCard";
// import DragHandleIcon from "@mui/icons-material/DragHandle";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// const StyledMenu = styled(Menu)(({ theme }) => ({
//   "& .MuiPaper-root": {
//     borderRadius: 8,
//     marginTop: theme.spacing(1),
//     minWidth: 200,
//     backgroundColor: "#fff",
//     boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.06)",
//     zIndex: 2000,
//     "& .MuiMenu-list": {
//       padding: "6px 0",
//     },
//     "& .MuiMenuItem-root": {
//       display: "flex",
//       alignItems: "center",
//       gap: theme.spacing(1.5),
//       padding: theme.spacing(1.5, 2),
//       fontSize: "0.9rem",
//       "& .MuiSvgIcon-root": {
//         fontSize: 20,
//         color: theme.palette.grey[700],
//       },
//       "&:hover": {
//         backgroundColor: "#f9f9f9",
//       },
//     },
//   },
// }));

// const Column = ({ list }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
//     id: String(list.id),
//     filter: (event) => {
//       return event.target.closest("[data-no-dnd]") !== null;
//     },
//   });

//   const columnStyle = {
//     transform: CSS.Translate.toString(transform),
//     transition,
//     height: "100%",
//   };

//   const [anchorEl, setAnchorEl] = useState(null);
//   const open = Boolean(anchorEl);

//   const handleClick = (event) => {
//     event.stopPropagation();
//     setAnchorEl(event.currentTarget);
//   };

//   const handleClose = (event) => {
//     event && event.stopPropagation();
//     setAnchorEl(null);
//   };

//   const handleMenuItemClick = (event) => {
//     event.stopPropagation();
//     handleClose();
//   };

//   const handleArchiveColumn = async (event) => {
//     event.stopPropagation();
//     try {
//       // Gửi yêu cầu PATCH sử dụng Axios mà không cần header
//       const response = await axios.patch(`http://127.0.0.1:8000/api/lists/${list.id}/closed`);

//       // Kiểm tra nếu yêu cầu thành công
//       if (response.status === 200) {
//         // alert("Cột đã được lưu trữ!");

//         // Cập nhật lại trạng thái của cột sau khi lưu trữ
//         list.closed = response.data.data.closed;
//         handleClose(); // Đóng menu sau khi lưu trữ
//       } else {
//         throw new Error("Lỗi khi lưu trữ cột");
//       }
//     } catch (error) {
//       console.error("Lỗi:", error);
//       alert("Không thể lưu trữ cột.");
//     }
//   }

//   return (
//     <div ref={setNodeRef} style={columnStyle} {...attributes} {...listeners}>
//       <Box
//         sx={{
//           minWidth: "245px",
//           maxWidth: "245px",
//           backgroundColor: "#dcdde1",
//           ml: 2,
//           borderRadius: "6px",
//           height: "fit-content",
//         }}
//       >
//         <Box
//           sx={{
//             p: 2,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//           }}
//         >
//           <Typography sx={{ fontWeight: "bold", cursor: "pointer", fontSize: "0.8rem" }}>
//             {list.name}
//           </Typography>
//           <Box data-no-dnd="true">
//             <Tooltip title="More options" disableInteractive>
//               <KeyboardArrowDownIcon
//                 sx={{ color: "secondary.main", cursor: "pointer" }}
//                 data-no-dnd="true"
//                 onMouseDown={handleClick}
//               />
//             </Tooltip>
//             <StyledMenu
//               anchorEl={anchorEl}
//               open={open}
//               onMouseDown={handleClose}
//               data-no-dnd="true"
//             >
//               <MenuItem onClick={handleMenuItemClick} disableRipple>
//                 <AddCardIcon />
//                 Thêm thẻ mới
//               </MenuItem>
//               <MenuItem onClick={handleMenuItemClick} disableRipple>
//                 <ContentCopyIcon />
//                 Sao chép
//               </MenuItem>
//               <MenuItem onClick={handleMenuItemClick} disableRipple>
//                 <MoveUpIcon />
//                 Di chuyển
//               </MenuItem>
//               <MenuItem onClick={handleMenuItemClick} disableRipple>
//                 <VisibilityIcon />
//                 Xem
//               </MenuItem>
//               <Divider sx={{ my: 0.5 }} />
//               <MenuItem onClick={handleArchiveColumn} disableRipple>
//                 <ArchiveIcon />
//                 Lưu trữ cột này
//               </MenuItem>
//             </StyledMenu>
//           </Box>
//         </Box>
//         <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//           <Button startIcon={<AddCardIcon />} sx={{ color: "primary.dark" }}>
//             Thêm thẻ mới
//           </Button>
//           <Tooltip title="Drag to move">
//             <DragHandleIcon sx={{ cursor: "pointer" }} />
//           </Tooltip>
//         </Box>
//       </Box>
//     </div>
//   );
// };

// export default Column;

import { useState } from "react";
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
            sx={{ "& .MuiPaper-root": { minWidth: "150px" } }}
          >
            <MenuItem onClick={handleMenuClose}>Thêm thẻ</MenuItem>
            <MenuItem onClick={handleMenuClose}>Sao chép</MenuItem>
            <MenuItem onClick={handleMenuClose}>Theo dõi</MenuItem>
            <MenuItem onClick={handleMenuClose}>Xóa</MenuItem>
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
    </div>
  );
};

export default Column;

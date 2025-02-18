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
import { Box, Button, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ArchiveIcon from "@mui/icons-material/Archive";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoveUpIcon from "@mui/icons-material/MoveUp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddCardIcon from "@mui/icons-material/AddCard";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import ListCards from "./ListCards/ListCards";
import { mapOrder } from "../../../../../../utils/sort";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

const Column = ({ list }) => {
  // Kéo thả


  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: String(list.id),
    filter: (event) => {
      return event.target.closest("[data-no-dnd]") !== null;
    },
  });
  const columnStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    height: "100%",
    // opacity: isDragging ? 0.5 : undefined,
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
  // const orderedCards = mapOrder(column?.cards, column?.cardOrderIds, "_id");

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
          maxHeight: (theme) =>
            `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`,
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
          <Typography
            sx={{ fontWeight: "bold", cursor: "pointer", fontSize: "0.8rem" }}
          >
            {list.name}
          </Typography>

          <Box>
            <Tooltip title="More option">
              <KeyboardArrowDownIcon
                sx={{ color: "secondary.main", cursor: "pointer" }}
                id="basic-column-dropdown"
                aria-controls={open ? "basic-menu-column-dropdown" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                // variant="contained"
                disableElevation
                onMouseDown={handleClick}
              />
            </Tooltip>

            <StyledMenu
              id="demo-customized-menu-workspace"
              MenuListProps={{
                "aria-labelledby": "basic-column-dropdown",
              }}
              anchorEl={anchorEl}
              open={open}
              onMouseDown={handleClose}
            >
              <MenuItem
                onClick={handleClose}
                disableRipple
                sx={{ fontSize: "0.85rem", color: "secondary.main" }}
              >
                <AddCardIcon />
                Add new cart
              </MenuItem>

              <MenuItem
                onClick={handleClose}
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
                onClick={handleClose}
                disableRipple
                sx={{ fontSize: "0.85rem", color: "secondary.main" }}
              >
                <ArchiveIcon />
                Archive this column
              </MenuItem>

              <MenuItem
                onClick={handleClose}
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
        {/* <ListCards cards={orderedCards} /> */}

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
          <Button startIcon={<AddCardIcon />} sx={{ color: "primary.dark" }}>
            Add new cart
          </Button>
          <Tooltip title="Drag to move">
            <DragHandleIcon sx={{ cursor: "pointer" }} />
          </Tooltip>
        </Box>
      </Box>
    </div>
  );
};

export default Column;

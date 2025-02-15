import { useState } from "react";
import { Box, Button, Tooltip, Typography, Menu, MenuItem, Divider } from "@mui/material";
import { styled } from "@mui/material/styles";
import ArchiveIcon from "@mui/icons-material/Archive";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoveUpIcon from "@mui/icons-material/MoveUp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddCardIcon from "@mui/icons-material/AddCard";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 8,
    marginTop: theme.spacing(1),
    minWidth: 200,
    backgroundColor: "#fff",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.06)",
    zIndex: 2000,
    "& .MuiMenu-list": {
      padding: "6px 0",
    },
    "& .MuiMenuItem-root": {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1.5),
      padding: theme.spacing(1.5, 2),
      fontSize: "0.9rem",
      "& .MuiSvgIcon-root": {
        fontSize: 20,
        color: theme.palette.grey[700],
      },
      "&:hover": {
        backgroundColor: "#f9f9f9",
      },
    },
  },
}));

const Column = ({ list }) => {
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
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    event && event.stopPropagation();
    setAnchorEl(null);
  };

  const handleMenuItemClick = (event) => {
    event.stopPropagation();
    handleClose();
  };

  return (
    <div ref={setNodeRef} style={columnStyle} {...attributes} {...listeners}>
      <Box
        sx={{
          minWidth: "245px",
          maxWidth: "245px",
          backgroundColor: "#dcdde1",
          ml: 2,
          borderRadius: "6px",
          height: "fit-content",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontWeight: "bold", cursor: "pointer", fontSize: "0.8rem" }}>
            {list.name}
          </Typography>
          <Box data-no-dnd="true">
            <Tooltip title="More options" disableInteractive>
              <KeyboardArrowDownIcon
                sx={{ color: "secondary.main", cursor: "pointer" }}
                data-no-dnd="true"
                onMouseDown={handleClick}
              />
            </Tooltip>
            <StyledMenu
              anchorEl={anchorEl}
              open={open}
              onMouseDown={handleClose}
              data-no-dnd="true"
            >
              <MenuItem onClick={handleMenuItemClick} disableRipple>
                <AddCardIcon />
                Thêm thẻ mới
              </MenuItem>
              <MenuItem onClick={handleMenuItemClick} disableRipple>
                <ContentCopyIcon />
                Sao chép
              </MenuItem>
              <MenuItem onClick={handleMenuItemClick} disableRipple>
                <MoveUpIcon />
                Di chuyển
              </MenuItem>
              <MenuItem onClick={handleMenuItemClick} disableRipple>
                <VisibilityIcon />
                Xem
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={handleMenuItemClick} disableRipple>
                <ArchiveIcon />
                Lưu trữ cột này
              </MenuItem>
            </StyledMenu>
          </Box>
        </Box>
        <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Button startIcon={<AddCardIcon />} sx={{ color: "primary.dark" }}>
            Thêm thẻ mới
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

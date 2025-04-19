import React, { useState } from "react";
import {
  Popover,
  Typography,
  IconButton,
  List,
  ListItemButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ChecklistItemMenu = ({ onConvert, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton size="small" onClick={handleOpen}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="20"
          viewBox="0 96 960 960"
          width="20"
        >
          <path d="M480 636q-24 0-42-18t-18-42q0-24 18-42t42-18q24 0 42 18t18 42q0 24-18 42t-42 18Zm0 240q-24 0-42-18t-18-42q0-24 18-42t42-18q24 0 42 18t18 42q0 24-18 42t-42 18Zm0-480q-24 0-42-18t-18-42q0-24 18-42t42-18q24 0 42 18t18 42q0 24-18 42t-42 18Z" />
        </svg>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            width: 220,
            borderRadius: 2,
            p: 1,
          },
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          px={1}
          pb={1}
        >
          <Typography fontWeight={600}>Thao tác mục</Typography>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <List disablePadding>
          <ListItemButton
            onClick={() => {
              onDelete?.();
              handleClose();
            }}
          >
            Xoá
          </ListItemButton>
        </List>
      </Popover>
    </>
  );
};

export default ChecklistItemMenu;

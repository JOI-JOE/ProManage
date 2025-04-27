import React, { useState } from "react";
import {
  Popover,
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const ListSelector = ({ cardId, boardId, listBoardId, boardLists, onListChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Lọc danh sách theo boardId
  const lists = boardLists.filter(list => list.board_id === boardId) || [];

  // Lọc danh sách theo từ khóa tìm kiếm
  const filteredLists = lists.filter(list =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // console.log(filteredLists);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchTerm(""); // Reset tìm kiếm khi đóng
  };

  const handleListSelect = (listId) => {
    onListChange(cardId, listId);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const currentList = lists.find(list => list.id === listBoardId);

  if (!lists.length) {
    return <span>Không có danh sách</span>;
  }

  return (
    <>
      {/* Nút để mở Popover (hiển thị tên danh sách hiện tại) */}
      <Box
        onClick={handleClick}
        sx={{
            padding: "2px 8px",
            backgroundColor: "transparent", // Xóa màu xám, để nền trắng
            borderRadius: "3px",
            color: "#172b4d",
            fontSize: "0.7rem",
            cursor: "pointer",
            "&:hover": {
              borderColor: "#172b4d", // Viền đổi màu khi hover
            },
        }}
      >
        {currentList ? currentList.name : "Chọn danh sách"}
      </Box>

      {/* Popover chứa danh sách */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            width: "250px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "8px",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography sx={{ fontSize: "0.9rem", fontWeight: "bold", color: "#172b4d" }}>
            Thay đổi danh sách
          </Typography>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon sx={{ fontSize: "1rem", color: "#172b4d" }} />
          </IconButton>
        </Box>

        {/* Search bar */}
        <TextField
          fullWidth
          placeholder="Tìm kiếm các danh sách"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            mb: 1,
            "& .MuiInputBase-root": {
              fontSize: "0.8rem",
              backgroundColor: "#f4f5f7",
              borderRadius: "3px",
              padding: "2px 8px",
            },
            "& .MuiInputBase-input": {
              padding: "4px 0",
              color: "#172b4d",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#dfe1e6",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#172b4d",
            },
          }}
        />

        {/* Danh sách các tùy chọn */}
        <List sx={{ maxHeight: "200px", overflowY: "auto" }}>
          {filteredLists.length > 0 ? (
            filteredLists
            .filter((list) => list.closed === 0) 
            .map((list) => (
              <ListItem
                key={list.id}
                onClick={() => handleListSelect(list.id)}
                sx={{
                  padding: "4px 8px",
                  borderRadius: "3px",
                  "&:hover": {
                    backgroundColor: "#ebecf0",
                    cursor: "pointer",
                  },
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <ListItemText
                  primary={list.name}
                  primaryTypographyProps={{
                    sx: {
                      fontSize: "0.8rem",
                      color: "#172b4d",
                    },
                  }}
                />
                {list.id === listBoardId && (
                  <CheckIcon sx={{ fontSize: "1rem", color: "#0079bf" }} />
                )}
              </ListItem>
            ))
          ) : (
            <Typography sx={{ fontSize: "0.8rem", color: "#5e6c84", padding: "4px 8px" }}>
              Không tìm thấy danh sách
            </Typography>
          )}
        </List>
      </Popover>
    </>
  );
};

export default ListSelector;
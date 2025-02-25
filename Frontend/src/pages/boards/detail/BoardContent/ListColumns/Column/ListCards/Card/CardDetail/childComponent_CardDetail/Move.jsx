import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Box,
} from "@mui/material";

const MoveCardModal = ({ open, onClose }) => {
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedList, setSelectedList] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");

  const boards = ["Hồng Ngát", "Phạm Văn A", "Nguyễn Thị B"];
  const lists = ["Cần làm 1", "Cần làm 2", "Đang làm", "Hoàn thành"];
  const positions = [1, 2, 3, 4];

  const inputStyle = { height: "30px", fontSize: "12px" };
  const boxStyle = { mb: 3 }; // Increase margin bottom to 3

  const handleMove = () => {
    // Handle moving logic here
    onClose(); // Close the modal
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontSize: "14px" }}>Di chuyển thẻ</DialogTitle>
      <DialogContent>
        <Box sx={boxStyle}>
          <FormControl fullWidth>
            <InputLabel sx={{ fontSize: "12px" }}>Bảng thông tin</InputLabel>
            <Select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              label="Bảng thông tin"
              sx={inputStyle}
            >
              {boards.map((board, index) => (
                <MenuItem key={index} value={board} sx={{ fontSize: "12px" }}>
                  {board}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={boxStyle}>
          <FormControl fullWidth>
            <InputLabel sx={{ fontSize: "12px" }}>Danh sách</InputLabel>
            <Select
              value={selectedList}
              onChange={(e) => setSelectedList(e.target.value)}
              label="Danh sách"
              sx={inputStyle}
            >
              {lists.map((list, index) => (
                <MenuItem key={index} value={list} sx={{ fontSize: "12px" }}>
                  {list}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={boxStyle}>
          <FormControl fullWidth>
            <InputLabel sx={{ fontSize: "12px" }}>Vị trí</InputLabel>
            <Select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              label="Vị trí"
              sx={inputStyle}
            >
              {positions.map((position, index) => (
                <MenuItem
                  key={index}
                  value={position}
                  sx={{ fontSize: "12px" }}
                >
                  {position}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ fontSize: "12px" }}>
          Hủy
        </Button>
        <Button onClick={handleMove} sx={{ fontSize: "12px" }}>
          Di chuyển
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoveCardModal;

import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    if (!open) {
      setSelectedBoard("");
      setSelectedList("");
      setSelectedPosition("");
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" inert={!open}>
      <DialogTitle
        sx={{ textAlign: "center", fontSize: "17px", fontWeight: "bold" }}
      >
        Di chuyển thẻ
      </DialogTitle>
      <DialogContent>
        <Box sx={boxStyle}>
          <FormControl fullWidth>
            <Select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              sx={inputStyle}
              displayEmpty
              renderValue={
                selectedBoard !== ""
                  ? undefined
                  : () => "Chọn bảng thông tin..."
              }
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
            <Select
              value={selectedList}
              onChange={(e) => setSelectedList(e.target.value)}
              sx={inputStyle}
              displayEmpty
              renderValue={
                selectedList !== "" ? undefined : () => "Chọn danh sách..."
              }
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
            <Select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              sx={inputStyle}
              displayEmpty
              renderValue={
                selectedPosition !== "" ? undefined : () => "Chọn vị trí..."
              }
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

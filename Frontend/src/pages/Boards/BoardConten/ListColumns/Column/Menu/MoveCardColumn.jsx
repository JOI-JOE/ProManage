import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";

const MoveCardDialog = ({ open, onClose, onMove }) => {
  const [selectedColumn, setSelectedColumn] = useState("");

  const handleChange = (event) => {
    setSelectedColumn(event.target.value);
  };

  const handleMove = () => {
    if (selectedColumn) {
      onMove(selectedColumn);
      onClose();
    } else {
      alert("Vui lòng chọn cột đích.");
    }
  };

  // Dữ liệu cứng cho các cột
  const columns = [
    { _id: "1", title: "Cột 1" },
    { _id: "2", title: "Cột 2" },
    { _id: "3", title: "Cột 3" },
    { _id: "4", title: "Cột 4" },
  ];

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Di chuyển thẻ</DialogTitle>
      <DialogContent>
        <FormControl fullWidth variant="outlined" margin="normal">
          <InputLabel sx={{ fontSize: "1rem" }}>Chọn cột đích</InputLabel>
          <Select
            value={selectedColumn}
            onChange={handleChange}
            label="Chọn cột đích"
            sx={{
              fontSize: "0.8rem", // Thay đổi kích thước chữ cho Select
            }}
          >
            {columns.map((col) => (
              <MenuItem
                key={col._id}
                value={col._id}
                sx={{ fontSize: "0.8rem" }}
              >
                {col.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Hủy
        </Button>
        <Button onClick={handleMove} color="secondary">
          Di chuyển
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoveCardDialog;

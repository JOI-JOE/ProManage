import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
} from "@mui/material";

const CopyColumn = ({ open, onClose, onCopy }) => {
  const [newTitle, setNewTitle] = useState("");

  const handleInputChange = (e) => {
    setNewTitle(e.target.value);
  };

  const handleCopy = () => {
    onCopy(newTitle);
    setNewTitle(""); // Reset input after copy
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Sao chép cột</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Nhập tên cột mới"
          type="text"
          fullWidth
          variant="outlined"
          value={newTitle}
          onChange={handleInputChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Hủy
        </Button>
        <Button onClick={handleCopy} color="secondary">
          Sao chép
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CopyColumn;

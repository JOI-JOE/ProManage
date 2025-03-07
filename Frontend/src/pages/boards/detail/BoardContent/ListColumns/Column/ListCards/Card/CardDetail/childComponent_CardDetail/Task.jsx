import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";

const TaskModal = ({ open, onClose, onSave }) => {
  const [taskName, setTaskName] = useState("");

  const handleSave = () => {
    if (taskName.trim()) {
      console.log("Adding task:", taskName); // Debug kiểm tra
      onSave(taskName); // Gửi taskName lên TaskList
      setTaskName(""); // Xóa input sau khi thêm
      onClose(); // Đóng modal
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Thêm việc cần làm</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="Tiêu đề công việc..."
          variant="outlined"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          size="small"
          sx={{
            marginTop: "8px",
            "& .MuiInputBase-root": { height: 35 },
            "& .MuiInputBase-input": { fontSize: "0.9rem" },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSave} color="primary">
          Thêm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskModal;

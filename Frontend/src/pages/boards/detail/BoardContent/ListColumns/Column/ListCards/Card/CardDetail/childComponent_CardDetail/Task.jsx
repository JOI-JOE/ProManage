import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";
import { useCreateCheckList } from "../../../../../../../../../../hooks/useCheckList";
import { useParams } from "react-router-dom";

const TaskModal = ({ open, onClose, onSave }) => {
  const [taskName, setTaskName] = useState("");
  const { cardId } = useParams();
  const { mutate: addCheckList } = useCreateCheckList();

  const handleSave = () => {
    if (!taskName.trim()) return; // Kiểm tra tên checklist có dữ liệu

    addCheckList(
      {card_id: cardId, name: taskName }, // Gửi request API
      {
        onSuccess: () => {
          setTaskName(""); // Reset trường nhập
          onClose(); // Đóng modal
        },
      }
    );
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
          size="small" // Làm ô nhỏ lại
          sx={{
            marginTop: "8px",
            padding: "0px", // Giảm padding
            fontSize: "0.7rem", // Giảm kích thước font chữ
            height: "25px", // Giảm chiều cao
            "& .MuiInputBase-root": { height: 25 }, // Giảm chiều cao của input
            "& .MuiInputBase-input": { fontSize: "0.7rem" }, // Giảm kích thước font chữ khi nhập
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
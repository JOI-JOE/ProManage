import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  IconButton,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";

const AddCardModal = ({ open, onClose }) => {
  const [title, setTitle] = useState("");
  const [listId, setListId] = useState("");
  const [startEnabled, setStartEnabled] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [dueEnabled, setDueEnabled] = useState(true);
  const [dueDate, setDueDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [dueTime, setDueTime] = useState(dayjs().format("HH:mm"));

  const availableLists = [
    { id: "list-1", name: "Việc cần làm" },
    { id: "list-2", name: "Đang thực hiện" },
    { id: "list-3", name: "Hoàn thành" },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: "600", fontSize: "18px", textAlign: "center" }}>
        Thêm thẻ
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 12, right: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 3, pt: 1 }}>
        {/* Tên */}
        <Box sx={{ mb: 2 }}>
          <Typography fontWeight={600} fontSize={14} mb={0.5}>
            Tên
          </Typography>
          <TextField
            fullWidth
            placeholder="Nhập tên cho thẻ này"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="small"
          />
        </Box>

        {/* Danh sách */}
        <Box sx={{ mb: 2 }}>
          <Typography fontWeight={600} fontSize={14} mb={0.5}>
            Danh sách
          </Typography>
          <TextField
            select
            fullWidth
            value={listId}
            onChange={(e) => setListId(e.target.value)}
            size="small"
          >
            {availableLists.map((list) => (
              <MenuItem key={list.id} value={list.id}>
                {list.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Ngày bắt đầu & Ngày hết hạn */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mb: 3 }}>
          {/* Ngày bắt đầu */}
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={600} fontSize={14} mb={0.5}>
              Ngày bắt đầu
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Checkbox
                size="small"
                checked={startEnabled}
                onChange={(e) => setStartEnabled(e.target.checked)}
              />
              <TextField
                type="date"
                size="small"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={!startEnabled}
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>

          {/* Ngày hết hạn */}
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={600} fontSize={14} mb={0.5}>
              Ngày hết hạn
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Checkbox
                size="small"
                checked={dueEnabled}
                onChange={(e) => setDueEnabled(e.target.checked)}
              />
              <TextField
                type="date"
                size="small"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={!dueEnabled}
              />
              <TextField
                type="time"
                size="small"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                disabled={!dueEnabled}
                sx={{ width: "80px" }}
              />
            </Box>
          </Box>
        </Box>

        {/* Nút thêm thẻ */}
        <Button
          fullWidth
          variant="contained"
          disabled={!title || !listId}
          sx={{
            textTransform: "none",
            fontWeight: 500,
            backgroundColor: (!title || !listId) ? "#ccc" : "#0079bf",
            color: (!title || !listId) ? "#666" : "#fff",
            "&:hover": {
              backgroundColor: (!title || !listId) ? "#ccc" : "#026aa7",
            },
            borderRadius: 2
          }}
        >
          Thêm thẻ
        </Button>
      </DialogContent>

    </Dialog>
  );
};

export default AddCardModal;

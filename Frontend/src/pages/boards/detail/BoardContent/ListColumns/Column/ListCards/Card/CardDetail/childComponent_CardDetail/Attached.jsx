import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const AttachmentModal = ({ open, onClose }) => {
  const [search, setSearch] = useState("");
  const [files, setFiles] = useState([
    { id: 1, name: "card 4", user: "Hồng Ngát", time: "3 giờ trước" },
    { id: 2, name: "gghhjj", user: "Hồng Ngát", time: "5 giờ trước" },
    { id: 3, name: "card 8", user: "Hồng Ngát", time: "2 ngày trước" },
    {
      id: 4,
      name: "Thất tịch",
      user: "Không gian làm việc của ...",
      time: "2 ngày trước",
    },
    { id: 5, name: "Test", user: "", time: "1 tuần trước" },
  ]);

  const filteredFiles = files.filter(
    (file) =>
      file.name.toLowerCase().includes(search.toLowerCase()) ||
      file.user.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files).map((file, index) => ({
      id: files.length + index + 1,
      name: file.name,
      user: "Current User",
      time: "Vừa xong",
    }));
    setFiles([...files, ...selectedFiles]);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        Đính kèm
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          "&::-webkit-scrollbar": {
            width: "4px", // Điều chỉnh chiều rộng thanh cuộn
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#888",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#555",
          },
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Tìm các liên kết gần đây hoặc dán một liên kết"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            mb: 2,
            "& .MuiInputBase-input": { fontSize: "0.8rem" },
            height: "30px", // Giảm chiều cao của input
            "& .MuiInputBase-root": { height: 30 },
          }}
        />
        <Typography variant="body2" sx={{ mb: 1 }}>
          Văn bản hiện thị (không bắt buộc)
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Văn bản cần hiển thị"
          sx={{
            mb: 2,
            "& .MuiInputBase-input": { fontSize: "0.8rem" },
            height: "30px", // Giảm chiều cao của input
            "& .MuiInputBase-root": { height: 30 },
          }}
        />
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          Đã xem gần đây
        </Typography>
        <List
          sx={{
            maxHeight: 250,
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: "4px" },
          }}
        >
          {filteredFiles.map((file) => (
            <ListItem key={file.id} disablePadding>
              <ListItemButton>
                <ListItemText
                  primary={file.name}
                  secondary={`${file.user} - ${file.time}`}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Button
          variant="contained"
          fullWidth
          component="label"
          sx={{ backgroundColor: "#1976d2" }}
        >
          Chọn tệp
          <input type="file" hidden multiple onChange={handleFileChange} />
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={onClose}>Chèn</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttachmentModal;

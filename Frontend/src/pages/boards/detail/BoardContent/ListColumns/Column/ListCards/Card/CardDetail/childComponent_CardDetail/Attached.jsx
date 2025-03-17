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
  ListItemText,
  Divider,
  IconButton,
  Typography,
  CircularProgress,
  ListItemButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const AttachmentModal = ({ open, onClose, onAddAttachment }) => {
  const [newLink, setNewLink] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [uploading, setUploading] = useState(false);

  const recentFiles = [
    { id: 1, name: "Báo cáo tuần", user: "Hồng Ngát", time: "3 giờ trước" },
    { id: 2, name: "Tài liệu dự án", user: "Hồng Ngát", time: "5 giờ trước" },
    { id: 3, name: "Hợp đồng A", user: "Hồng Ngát", time: "2 ngày trước" },
    {
      id: 4,
      name: "Thất tịch",
      user: "Không gian làm việc",
      time: "2 ngày trước",
    },
    { id: 5, name: "Test file", user: "", time: "1 tuần trước" },
  ];

  const isValidURL = (str) => {
    const pattern = new RegExp(
      "^(https?:\\/\\/)?([\\w-]+\\.)+[\\w-]+(\\/[\\w- ./?%&=]*)?$",
      "i"
    );
    return pattern.test(str);
  };

  const handleInsert = () => {
    if (isValidURL(newLink)) {
      const newAttachment = {
        id: Date.now(),
        name: displayText || newLink,
        url: newLink,
        type: "link",
        time: new Date().toISOString(),
      };
      onAddAttachment(newAttachment);
      setNewLink("");
      setDisplayText("");
      onClose();
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files).map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      time: new Date().toISOString(),
      type: "file",
    }));

    if (files.length > 0) {
      setUploading(true);
      setTimeout(() => {
        onAddAttachment(files);
        setUploading(false);
        onClose();
      }, 1500);
    }
  };

  const filteredRecentFiles = !isValidURL(newLink)
    ? recentFiles.filter((file) =>
        file.name.toLowerCase().includes(newLink.toLowerCase())
      )
    : [];

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
      <DialogContent sx={{ maxHeight: 400, overflowY: "auto" }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Tìm kiếm hoặc dán các liên kết
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Tìm kiếm file hoặc dán liên kết"
          value={newLink}
          onChange={(e) => setNewLink(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" sx={{ mb: 1 }}>
          Văn bản hiển thị (không bắt buộc)
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Nhập văn bản hiển thị"
          value={displayText}
          onChange={(e) => setDisplayText(e.target.value)}
          sx={{ mb: 2 }}
        />
        {!isValidURL(newLink) && filteredRecentFiles.length > 0 && (
          <>
            <Typography variant="body2" sx={{ fontWeight: "bold", mt: 2 }}>
              Đã xem gần đây
            </Typography>
            <List sx={{ maxHeight: 150, overflowY: "auto" }}>
              {filteredRecentFiles.map((file) => (
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
          </>
        )}
        <Button
          variant="contained"
          fullWidth
          component="label"
          disabled={uploading}
        >
          {uploading ? "Tệp đang tải lên..." : "Chọn tệp"}
          <input type="file" hidden multiple onChange={handleFileSelect} />
        </Button>

        {uploading && (
          <Typography
            variant="body2"
            sx={{ mt: 2, display: "flex", alignItems: "center" }}
          >
            <CircularProgress size={20} sx={{ mr: 1 }} /> Tệp đang tải lên...
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={uploading}>
          Hủy
        </Button>
        {!uploading && (
          <Button onClick={handleInsert} variant="contained">
            Chèn
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AttachmentModal;

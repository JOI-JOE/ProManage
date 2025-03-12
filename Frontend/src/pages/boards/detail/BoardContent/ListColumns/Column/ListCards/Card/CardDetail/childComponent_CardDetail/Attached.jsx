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
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const AttachmentModal = ({ open, onClose, onAddAttachment }) => {
  const [search, setSearch] = useState("");
  const [newLink, setNewLink] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [files, setFiles] = useState([
    { id: 1, name: "card 4", user: "Hồng Ngát", time: "3 giờ trước" },
    { id: 2, name: "gghhjj", user: "Hồng Ngát", time: "5 giờ trước" },
    { id: 3, name: "card 8", user: "Hồng Ngát", time: "2 ngày trước" },
    {
      id: 4,
      name: "Thất tịch",
      user: "Không gian làm việc",
      time: "2 ngày trước",
    },
    { id: 5, name: "Test", user: "", time: "1 tuần trước" },
  ]);

  const isValidURL = (str) => {
    const pattern = new RegExp(
      "^(https?:\\/\\/)?([\\w-]+\\.)+[\\w-]+(\\/[\\w- ./?%&=]*)?$",
      "i"
    );
    return pattern.test(str);
  };

  const handleInsert = () => {
    if (isValidURL(newLink)) {
      onAddAttachment?.({
        id: Date.now(),
        name: displayText || newLink,
        url: newLink,
        type: "link",
      });
      setNewLink("");
      setDisplayText("");
      onClose();
    }
  };

  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;
    if (selectedFiles.length > 0) {
      const fileArray = Array.from(selectedFiles).map((file) => ({
        id: Date.now(),
        name: file.name,
        type: file.type,
      }));
      setFiles((prevFiles) => [...prevFiles, ...fileArray]);
    }
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
      <DialogContent sx={{ maxHeight: 400, overflowY: "auto" }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Tìm kiếm hoặc dán các liên kết
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Tìm kiếm các liên kết gần đây hoặc dán một liên kết"
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
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          Đã xem gần đây
        </Typography>
        <List sx={{ maxHeight: 250, overflowY: "auto" }}>
          {files.map((file) => (
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
        <Button variant="contained" fullWidth component="label">
          Chọn tệp
          <input type="file" hidden multiple onChange={handleFileChange} />
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleInsert} variant="contained">
          Chèn
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttachmentModal;

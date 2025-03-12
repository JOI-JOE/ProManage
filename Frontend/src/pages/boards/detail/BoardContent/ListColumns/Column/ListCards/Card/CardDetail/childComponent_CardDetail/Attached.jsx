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
  const [search, setSearch] = useState(""); // Lưu giá trị nhập vào input tìm kiếm
  const [newLink, setNewLink] = useState(""); // Lưu liên kết nhập vào
  const [displayText, setDisplayText] = useState(""); // Lưu văn bản hiển thị cho liên kết
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

  // Kiểm tra xem input có phải là một URL hợp lệ không
  const isValidURL = (str) => {
    const pattern = new RegExp(
      "^(https?:\\/\\/)?([\\w-]+\\.)+[\\w-]+(\\/[\\w- ./?%&=]*)?$",
      "i"
    );
    return pattern.test(str);
  };

  const handleInsert = () => {
    if (newLink.trim() === "") return;

    if (isValidURL(newLink)) {
      onAddAttachment({
        id: Date.now(),
        name: displayText || newLink, // Nếu có văn bản hiển thị thì dùng, không thì hiển thị link
        url: newLink,
        type: "link",
      });
    } else {
      setSearch(newLink); // Nếu không phải link, thì dùng để tìm kiếm
    }

    setNewLink("");
    setDisplayText("");
    onClose();
  };

  const filteredFiles = files.filter(
    (file) =>
      file.name.toLowerCase().includes(search.toLowerCase()) ||
      file.user.toLowerCase().includes(search.toLowerCase())
  );

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
      <DialogContent sx={{ maxHeight: 350, overflowY: "auto" }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Tìm các liên kết gần đây hoặc dán một liên kết"
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
          placeholder="Văn bản cần hiển thị"
          value={displayText}
          onChange={(e) => setDisplayText(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          Đã xem gần đây
        </Typography>
        <List sx={{ maxHeight: 200, overflowY: "auto" }}>
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

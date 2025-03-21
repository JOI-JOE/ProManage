import React, { useCallback, useState } from "react";
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
  // PictureAsPdf,
  // // Image,
  // Link,
  // VideoLibrary,
  // InsertDriveFile,
  // Description,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useAttachments from "../../../../../../../../../../hooks/useAttachment";
import { useParams } from "react-router-dom";
// import MoreVertIcon from "@mui/icons-material/MoreVert";
//  import EditIcon from "@mui/icons-material/Edit";
//  import DeleteIcon from "@mui/icons-material/Delete";

const getFileType = (attachment) => {
  if (!attachment.path_url) return { type: "unknown", icon: <Description /> };
  const fileExtension = attachment.path_url.split(".").pop().toLowerCase();

  if (attachment.path_url.startsWith("http")) {
    if (attachment.path_url.includes("youtube.com") || attachment.path_url.includes("youtu.be")) {
      return { type: "youtube", icon: <VideoLibrary sx={{ color: "#ff0000" }} /> };
    }
    return { type: "link", icon: <Link sx={{ color: "#1976d2" }} /> };
  }
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)) {
    return { type: "image", icon: <Image sx={{ color: "#4caf50" }} /> };
  }
  if (["mp4", "mkv", "avi", "mov"].includes(fileExtension)) {
    return { type: "video", icon: <VideoLibrary sx={{ color: "#ff9800" }} /> };
  }
  if (["pdf"].includes(fileExtension)) {
    return { type: "pdf", icon: <PictureAsPdf sx={{ color: "red" }} /> };
  }
  if (["xls", "xlsx"].includes(fileExtension)) {
    return { type: "excel", icon: <InsertDriveFile sx={{ color: "#2E7D32" }} /> };
  }
  return { type: "file", icon: <Description /> };
};


const AttachmentModal = ({ open, onClose, onAddAttachment }) => {
  const [newLink, setNewLink] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [uploading, setUploading] = useState(false);
  const { cardId } = useParams();
  const {addAttachment} = useAttachments(cardId);
 

  // const recentFiles = [
  //   { id: 1, name: "Báo cáo tuần", user: "Hồng Ngát", time: "3 giờ trước" },
  //   { id: 2, name: "Tài liệu dự án", user: "Hồng Ngát", time: "5 giờ trước" },
  //   { id: 3, name: "Hợp đồng A", user: "Hồng Ngát", time: "2 ngày trước" },
  //   {
  //     id: 4,
  //     name: "Thất tịch",
  //     user: "Không gian làm việc",
  //     time: "2 ngày trước",
  //   },
  //   { id: 5, name: "Test file", user: "", time: "1 tuần trước" },
  // ];

  // const isValidURL = (str) => {
  //   const pattern = new RegExp(
  //     "^(https?:\\/\\/)?([\\w-]+\\.)+[\\w-]+(\\/[\\w- ./?%&=]*)?$",
  //     "i"
  //   );
  //   return pattern.test(str);
  // };

  // const handleInsert = () => {
  //   if (isValidURL(newLink)) {
  //     const newAttachment = {
  //       id: Date.now(),
  //       name: displayText || newLink,
  //       url: newLink,
  //       type: "link",
  //       time: new Date().toISOString(),
  //     };
  //     onAddAttachment(newAttachment);
  //     setNewLink("");
  //     setDisplayText("");
  //     onClose();
  //   }
  // };

  // const handleFileSelect = (event) => {
  //   const files = Array.from(event.target.files).map((file) => ({
  //     id: Date.now() + Math.random(),
  //     name: file.name,
  //     url: URL.createObjectURL(file),
  //     time: new Date().toISOString(),
  //     type: "file",
  //   }));

  //   if (files.length > 0) {
  //     setUploading(true);
  //     setTimeout(() => {
  //       onAddAttachment(files);
  //       setUploading(false);
  //       onClose();
  //     }, 1500);
  //   }
  // };

  // const filteredRecentFiles = !isValidURL(newLink)
  //   ? recentFiles.filter((file) =>
  //       file.name.toLowerCase().includes(newLink.toLowerCase())
  //     )
  //   : [];

  const handleAddAttachment = useCallback(
    async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const data = { cardId, file_name_defaut: file.name, file };
      try {
        await addAttachment(data);
        alert("File đã được upload thành công!");
      } catch (error) {
        alert("Có lỗi xảy ra khi upload file: " + error.message);
      } finally {
        event.target.value = "";
      }
    },
    [cardId, addAttachment]
  );

  const handleAddLinkAttachment = async () => {
    if (!newLink.trim()) return;
    const data = { cardId, file_name_defaut: displayText || "Liên kết không tên", path_url: newLink };
    try {
      await addAttachment(data);
    } catch (error) {
      console.error("Lỗi khi thêm liên kết:", error);
    }
    setNewLink("");
    setDisplayText("");
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
        <Button
          variant="contained"
          fullWidth
          component="label"
          disabled={uploading}
        >
          {uploading ? "Tệp đang tải lên..." : "Chọn tệp"}
          <input type="file" hidden multiple onChange={handleAddAttachment} />
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
          <Button onClick={handleAddLinkAttachment} variant="contained">
            Chèn
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AttachmentModal;

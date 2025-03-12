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
  ListItemButton,
  ListItemText,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  PictureAsPdf,
  Image,
  Link,
  VideoLibrary,
  InsertDriveFile,
  Description,
  Close,
  // MoreVertIcon,
  // EditIcon,
  // DeleteIcon,
} from "@mui/icons-material";
import useAttachments from "../../../../../../../../../../hooks/useAttachment";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams } from "react-router-dom";

// Hàm xác định loại file và trả về icon
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

const AttachmentModal = ({open, onClose }) => {
  const { cardId } = useParams();
  const { attachments, addAttachment, updateAttachment, removeAttachment } = useAttachments(cardId);
  const [previewImage, setPreviewImage] = useState(null);
  const [newLink, setNewLink] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [editingAttachment, setEditingAttachment] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  

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

  const handleOpenFile = (attachment) => {
    const { type } = getFileType(attachment);
    const url = attachment.path_url;

    if (url.startsWith("http") && (url.includes("youtube.com") || url.includes("youtu.be"))) {
      window.open(url, "_blank");
      return;
    }
    if (type === "image") {
      setPreviewImage(url);
    } else if (["pdf", "video", "link"].includes(type)) {
      window.open(url, "_blank");
    } else {
      alert("Tải xuống file này từ: " + url);
    }
  };

  const handleEdit = (attachment) => {
    setEditingAttachment(attachment);
    setNewFileName(attachment.file_name_defaut);
    setAnchorEl(null);
  };

  const handleSaveEdit = async () => {
    if (!newFileName.trim()) {
      alert("Tên tệp không được để trống!");
      return;
    }
    try {
      await updateAttachment({ cardId, attachmentId: editingAttachment.id, newFileName });
      setEditingAttachment(null);
    } catch (error) {
      alert("Có lỗi xảy ra khi cập nhật tên file!");
    }
  };

  const handleDelete = (attachmentId) => {
    if (window.confirm("Bạn có chắc muốn xóa đính kèm này?")) {
      removeAttachment(attachmentId);
      setAnchorEl(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        Đính kèm
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ "&::-webkit-scrollbar": { width: "4px" }, "&::-webkit-scrollbar-thumb": { backgroundColor: "#888", borderRadius: "4px" } }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Dán một liên kết"
          value={newLink}
          onChange={(e) => setNewLink(e.target.value)}
          sx={{ mb: 2, "& .MuiInputBase-root": { height: 30 } }}
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
          sx={{ mb: 2, "& .MuiInputBase-root": { height: 30 } }}
        />
        <Button variant="contained" fullWidth onClick={handleAddLinkAttachment} disabled={!newLink.trim()} sx={{ mb: 2 }}>
          Thêm liên kết
        </Button>

        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          Đã xem gần đây
        </Typography>
        <List sx={{ maxHeight: 250, overflowY: "auto" }}>
          {attachments?.data?.map((attachment) => {
            const { icon } = getFileType(attachment);
            return (
              <ListItem key={attachment.id} disablePadding>
                <ListItemButton onClick={() => handleOpenFile(attachment)}>
                  {icon}
                  <ListItemText primary={attachment.file_name_defaut} sx={{ ml: 1 }} />
                </ListItemButton>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <MoreVertIcon />
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                  <MenuItem onClick={() => handleEdit(attachment)}>
                    <EditIcon sx={{ mr: 1 }} /> Chỉnh sửa
                  </MenuItem>
                  <MenuItem onClick={() => handleDelete(attachment.id)}>
                    <DeleteIcon sx={{ mr: 1 }} /> Xóa
                  </MenuItem>
                </Menu>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ my: 2 }} />
        <Button variant="contained" fullWidth component="label">
          Chọn tệp
          <input type="file" hidden onChange={handleAddAttachment} />
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
      </DialogActions>

      {/* Hộp chỉnh sửa kiểu Trello */}
      {editingAttachment && (
        <Dialog open={!!editingAttachment} onClose={() => setEditingAttachment(null)} fullWidth maxWidth="xs">
          <DialogTitle>
            Chỉnh sửa đính kèm
            <IconButton onClick={() => setEditingAttachment(null)} sx={{ position: "absolute", right: 8, top: 8 }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              variant="outlined"
              size="small"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
              label="Tên tệp"
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSaveEdit} variant="contained">
              Lưu
            </Button>
            <Button onClick={() => setEditingAttachment(null)}>Hủy</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Preview ảnh */}
      {previewImage && (
        <Dialog open={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="md">
          <DialogTitle>
            Xem ảnh
            <IconButton onClick={() => setPreviewImage(null)} sx={{ position: "absolute", right: 8, top: 8 }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <img src={previewImage} alt="Preview" style={{ width: "100%" }} />
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default AttachmentModal;
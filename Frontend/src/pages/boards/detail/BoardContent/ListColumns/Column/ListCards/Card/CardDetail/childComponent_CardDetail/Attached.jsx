import React, { useCallback, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useAttachments from "../../../../../../../../../../hooks/useAttachment";
import { useParams } from "react-router-dom";

// Hàm lấy tiêu đề từ link
const fetchTitleFromURL = async (url) => {
  try {
    if (
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com")
    ) {
      const response = await fetch(`https://noembed.com/embed?url=${url}`);
      const data = await response.json();
      if (data.title) return data.title;
    }

    const response = await fetch(url);
    const htmlText = await response.text();
    const doc = new DOMParser().parseFromString(htmlText, "text/html");
    return doc.querySelector("title")?.innerText.trim() || "Không có tiêu đề";
  } catch {
    return "Không có tiêu đề";
  }
};

const AttachmentModal = ({ open, onClose, onAddAttachment }) => {
  const [newLink, setNewLink] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [uploading, setUploading] = useState(false);
  const { cardId } = useParams();
  const { addAttachment } = useAttachments(cardId);

  // Xử lý upload file
  const handleAddAttachment = useCallback(
    async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      setUploading(true);
      const data = { cardId, file_name_defaut: file.name, file };

      try {
        await addAttachment(data);
        onClose(); // ✅ Đóng modal khi upload xong
      } catch (error) {
        console.error("Lỗi khi upload file:", error);
      } finally {
        setUploading(false);
        event.target.value = "";
      }
    },
    [cardId, addAttachment, onClose]
  );

  // Xử lý chèn liên kết
  const handleAddLinkAttachment = async () => {
    if (!newLink.trim()) return;

    setUploading(true);
    try {
      let fileName = displayText || newLink;
      if (!displayText) {
        fileName = await fetchTitleFromURL(newLink);
      }

      const data = {
        cardId,
        file_name_defaut: fileName,
        path_url: newLink,
      };

      await addAttachment(data);
      // ✅ Reset form và đóng modal khi thêm link thành công
      setNewLink("");
      setDisplayText("");
      onClose();
    } catch (error) {
      console.error("Lỗi khi thêm liên kết:", error);
    } finally {
      setUploading(false);
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
          placeholder="Gắn liên kết tại đây"
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
          <input type="file" hidden onChange={handleAddAttachment} />
        </Button>

        {uploading && (
          <Typography
            variant="body2"
            sx={{ mt: 2, display: "flex", alignItems: "center" }}
          >
            <CircularProgress size={20} sx={{ mr: 1 }} /> Đang xử lý...
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={uploading}>
          Hủy
        </Button>
        <Button
          onClick={handleAddLinkAttachment}
          variant="contained"
          disabled={uploading}
        >
          Chèn
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttachmentModal;

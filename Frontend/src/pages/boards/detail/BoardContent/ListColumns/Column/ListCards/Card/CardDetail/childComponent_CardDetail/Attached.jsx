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
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemIcon,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import LinkIcon from "@mui/icons-material/Link";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DescriptionIcon from "@mui/icons-material/Description";
import useAttachments from "../../../../../../../../../../hooks/useAttachment";
import { useParams } from "react-router-dom";

// Hàm xác định loại file & icon
const getFileType = (url) => {
  if (!url) return { type: "unknown", icon: <DescriptionIcon /> };

  const fileExtension = url.split(".").pop().toLowerCase();

  if (url.startsWith("http")) {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return {
        type: "youtube",
        icon: <VideoLibraryIcon sx={{ color: "#ff0000" }} />,
      };
    }
    if (url.includes("vimeo.com")) {
      return {
        type: "vimeo",
        icon: <VideoLibraryIcon sx={{ color: "#1ab7ea" }} />,
      };
    }
    return { type: "link", icon: <LinkIcon sx={{ color: "#1976d2" }} /> };
  }

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)) {
    return { type: "image", icon: <ImageIcon sx={{ color: "#4caf50" }} /> };
  }
  if (["mp4", "mkv", "avi", "mov"].includes(fileExtension)) {
    return {
      type: "video",
      icon: <VideoLibraryIcon sx={{ color: "#ff9800" }} />,
    };
  }
  if (fileExtension === "pdf") {
    return { type: "pdf", icon: <PictureAsPdfIcon sx={{ color: "red" }} /> };
  }
  return { type: "file", icon: <InsertDriveFileIcon /> };
};

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

  const handleAddAttachment = useCallback(
    async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const data = { cardId, file_name_defaut: file.name, file };

      try {
        await addAttachment(data);
      } catch (error) {
        console.error("Lỗi khi upload file:", error);
      } finally {
        event.target.value = "";
      }
    },
    [cardId, addAttachment]
  );

  const handleAddLinkAttachment = async () => {
    if (!newLink.trim()) return;

    let fileName = displayText || newLink;
    fileName = await fetchTitleFromURL(newLink);

    const data = {
      cardId,
      file_name_defaut: fileName,
      path_url: newLink,
    };

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

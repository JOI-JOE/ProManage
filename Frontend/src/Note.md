I- Giải thích các thẻ

    1. Collapse: Dùng để hiển thị hoặc ẩn danh sách con (animation mở rộng / thu nhỏ).
    2. List: Chứa danh sách các mục con bên trong Collapse
    3. ListItemButton: Tạo một mục có thể click bên trong danh sách
    4. ListItemIcon: Chứa icon cho mục danh sách
    5. ListItemText: Hiển thị văn bản bên cạnh icon

II- Đẩy code lên nhánh Git

    1. git add .
    2. git commit -m"tên commit"
    3. git checkout <tên-nhánh>
    4. git push origin <tên-nhánh>

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

<<<<<<< HEAD
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
"^(https?:\\/\\/)?([\\w-]+\\.)+[\\w-]+(\\/[\\w- ./?%&=]\*)?$",
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

=======
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

> > > > > > > 9a15f9e17c3489954763cfe342773da1ee7b3df2
> > > > > > > return (

    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        Đính kèm
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <Close />
        </IconButton>
      </DialogTitle>

<<<<<<< HEAD
<DialogContent sx={{ maxHeight: 350, overflowY: "auto" }}>
=======
<DialogContent sx={{ "&::-webkit-scrollbar": { width: "4px" }, "&::-webkit-scrollbar-thumb": { backgroundColor: "#888", borderRadius: "4px" } }}>

> > > > > > > 9a15f9e17c3489954763cfe342773da1ee7b3df2

        <TextField
          fullWidth
          variant="outlined"
          size="small"

<<<<<<< HEAD
placeholder="Tìm các liên kết gần đây hoặc dán một liên kết"
value={newLink}
onChange={(e) => setNewLink(e.target.value)}
sx={{ mb: 2 }}
=======
placeholder="Dán một liên kết"
value={newLink}
onChange={(e) => setNewLink(e.target.value)}
sx={{ mb: 2, "& .MuiInputBase-root": { height: 30 } }}

> > > > > > > 9a15f9e17c3489954763cfe342773da1ee7b3df2

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

<<<<<<< HEAD
sx={{ mb: 2 }}
=======
sx={{ mb: 2, "& .MuiInputBase-root": { height: 30 } }}

> > > > > > > 9a15f9e17c3489954763cfe342773da1ee7b3df2

        />
        <Button variant="contained" fullWidth onClick={handleAddLinkAttachment} disabled={!newLink.trim()} sx={{ mb: 2 }}>
          Thêm liên kết
        </Button>

        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          Đã xem gần đây
        </Typography>

<<<<<<< HEAD
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
=======
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

> > > > > > > 9a15f9e17c3489954763cfe342773da1ee7b3df2

        </List>

        <Divider sx={{ my: 2 }} />

<<<<<<< HEAD
</DialogContent>
<DialogActions>
<Button onClick={onClose}>Hủy</Button>
<Button onClick={handleInsert} variant="contained">
Chèn
</Button>
=======
<Button variant="contained" fullWidth component="label">
Chọn tệp
<input type="file" hidden onChange={handleAddAttachment} />
</Button>
</DialogContent>
<DialogActions>
<Button onClick={onClose}>Hủy</Button>

> > > > > > > 9a15f9e17c3489954763cfe342773da1ee7b3df2

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

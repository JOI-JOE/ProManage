import React, { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import CommentIcon from "@mui/icons-material/Comment";
import SettingsIcon from "@mui/icons-material/Settings";
import "react-quill/dist/quill.snow.css"; // Import CSS của React Quill
import ReactQuill from "react-quill";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

const BoardDetailsDrawer = ({ board, open, onClose }) => {
  const [description, setDescription] = useState("");
  const [isEditing, setIsEditing] = useState(true);
  const [previousDescription, setPreviousDescription] = useState("");
//  console.log('BoardDetailsDrawer:',board.creator.full_name);
 
  

  const handleSave = () => {
    setIsEditing(false);
    setPreviousDescription(description);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setPreviousDescription(description);
  };

  const handleCancel = () => {
    if (description === "" || description !== previousDescription) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
      setDescription(previousDescription);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiPaper-root": {
          width: 320,
          padding: "16px",
        },
      }}
    >
      <IconButton
        edge="start"
        color="inherit"
        onClick={onClose}
        aria-label="close"
        sx={{ position: "absolute", right: 8, top: 8 }}
      >
        <CloseIcon />
      </IconButton>
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", marginBottom: "16px", marginTop: "32px" }}
      >
        Về bảng này
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Quản trị viên của bảng
      </Typography>

      <Typography variant="body1" sx={{ fontWeight: "bold", marginTop: "8px" }}>
      {board.creator.full_name}
      </Typography>

      <Typography variant="body2" color="text.secondary">
      {board.creator.email}
      </Typography>

      <Button variant="outlined" size="small" sx={{ marginTop: "8px" }}>
        Sửa thông tin hồ sơ
      </Button>

      <Divider sx={{ marginY: "16px" }} />

      <Typography
        variant="body2"
        sx={{ fontWeight: "bold", marginBottom: "8px" }}
      >
        Mô tả
      </Typography>

      {isEditing ? (
        <>
          <ReactQuill
            value={description}
            onChange={setDescription}
            placeholder="Nhập mô tả..."
            style={{
              height: "100px",
              marginBottom: "8px",
            }}
          />
        </>
      ) : (
        <Typography
          variant="body1"
          sx={{ marginBottom: "8px", cursor: "pointer" }}
          onClick={handleEdit}
          dangerouslySetInnerHTML={{
            __html: description.replace(/<p>/g, "").replace(/<\/p>/g, "<br>"),
          }}
        />
      )}

      <Divider sx={{ marginY: "16px" }} />

      {isEditing && (
        <>
          <Button
            variant="contained"
            size="small"
            sx={{ marginTop: "8px", backgroundColor: "teal" }}
            onClick={handleSave}
          >
            Lưu
          </Button>
          <Button
            variant="text"
            size="small"
            sx={{ marginLeft: "8px" }}
            onClick={handleCancel}
          >
            Hủy
          </Button>
        </>
      )}

      <Divider sx={{ marginY: "16px" }} />

      <Typography
        variant="body2"
        sx={{ display: "flex", alignItems: "center" }}
      >
        <CommentIcon fontSize="small" sx={{ marginRight: "8px" }} />
        Bình luận trên các thẻ
      </Typography>

      <Button
        variant="outlined"
        size="small"
        sx={{ marginTop: "16px", display: "flex", alignItems: "center" }}
      >
        <SettingsIcon fontSize="small" sx={{ marginRight: "8px" }} />
        Thay đổi quyền...
      </Button>
    </Drawer>
  );
};

export default BoardDetailsDrawer;

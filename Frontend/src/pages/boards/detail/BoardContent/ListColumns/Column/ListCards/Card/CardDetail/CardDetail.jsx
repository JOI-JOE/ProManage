import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Grid,
  Divider,
  Box,
  Avatar,
} from "@mui/material";
import TimerIcon from "@mui/icons-material/Timer";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./CardDetail.css"; // Import custom CSS for scrollbar

const CardModal = () => {
  const { name } = useParams(); // Lấy tên card từ URL
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(true);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const loggedInUser = {
    name: "Current User", // Replace with actual logged-in user name
    avatar: "https://via.placeholder.com/40", // Replace with actual avatar URL
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      // Logic to save the description
      console.log("Description saved:", description);
      setIsEditingDescription(false);
    }
  };

  const handleDescriptionClick = () => {
    setIsEditingDescription(true);
  };

  const getPlainText = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const handleSaveComment = () => {
    if (comment.trim()) {
      setComments([...comments, { user: loggedInUser, text: comment }]);
      setComment("");
    }
  };

  return (
    <Dialog
      open={true}
      onClose={() => navigate(-1)}
      fullWidth
      maxWidth="md"
      sx={{ "& .MuiDialog-paper": { minHeight: "80vh" } }} // Đặt chiều cao
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          {name || "Task4"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          in list{" "}
          <span style={{ color: "#0079bf", fontWeight: "bold" }}>Doing</span>
        </Typography>
      </DialogTitle>
      <DialogContent className="custom-scrollbar">
        <Grid container spacing={2}>
          {/* Cột trái (Nội dung chính) */}
          <Grid item xs={8}>
            {/* Mô tả */}
            <Typography variant="subtitle1" fontWeight="bold">
              Description
            </Typography>
            {isEditingDescription ? (
              <ReactQuill
                value={description}
                onChange={setDescription}
                placeholder="Add a more detailed description..."
                style={{ marginTop: "8px" }}
                onKeyDown={handleKeyPress}
              />
            ) : (
              <Typography
                variant="body1"
                sx={{ mt: 1 }}
                onClick={handleDescriptionClick}
              >
                {getPlainText(description)}
              </Typography>
            )}

            {/* Thêm comment */}
            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
              Add Comment
            </Typography>
            <TextField
              fullWidth
              placeholder="Write a comment..."
              variant="outlined"
              size="small"
              multiline
              rows={1}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{ fontSize: "0.7rem" }}
              InputProps={{
                style: { fontSize: "0.7rem" },
              }}
            />
            <Button
              variant="contained"
              size="small"
              sx={{ mt: 1, backgroundColor: "teal", fontSize: "0.7rem" }}
              onClick={handleSaveComment}
            >
              Save
            </Button>

            {/* Hiển thị các bình luận */}
            {comments.map((cmt, index) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", mt: 1 }}
              >
                <Avatar
                  src={cmt.user.avatar}
                  alt={cmt.user.name}
                  sx={{ mr: 1, width: 30, height: 30, fontSize: "0.7rem" }}
                />
                <Typography variant="body2">
                  <strong>{cmt.user.name}:</strong> {cmt.text}
                </Typography>
              </Box>
            ))}

            {/* Activity */}
            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
              Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Yvonne Gardner Ivy</strong> added this card to{" "}
              <strong>Doing</strong>
            </Typography>
          </Grid>

          {/* Cột phải (Sidebar) */}
          <Grid item xs={4}>
            <Box sx={{ borderLeft: "1px solid #ddd", pl: 2 }}>
              {/* Add Section */}
              <Typography variant="subtitle1" fontWeight="bold">
                Add
              </Typography>
              <List>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemText primary="Members" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemText primary="Labels" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemText primary="Checklist" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemText primary="Due Date" />
                  </ListItemButton>
                </ListItem>
              </List>

              <Divider sx={{ my: 1 }} />

              {/* Actions Section */}
              <Typography variant="subtitle1" fontWeight="bold">
                Actions
              </Typography>
              <List>
                <ListItem disablePadding>
                  <ListItemButton>
                    <IconButton>
                      <TimerIcon color="primary" />
                    </IconButton>
                    <ListItemText primary="Start timer" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemText primary="Move" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemText primary="Copy" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemText primary="Watch" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemText primary="Archive" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      {/* Actions */}
      <DialogActions>
        <Button onClick={() => navigate(-1)}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CardModal;

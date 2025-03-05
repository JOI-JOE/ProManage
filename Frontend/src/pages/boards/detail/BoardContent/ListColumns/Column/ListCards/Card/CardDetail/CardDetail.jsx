import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Grid,
  Divider,
  Box,
  Avatar,
  TextField,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import MemberList from "./childComponent_CardDetail/member";
import TaskModal from "./childComponent_CardDetail/Task";
import LabelList from "./childComponent_CardDetail/Label";
import AttachmentModal from "./childComponent_CardDetail/Attached";
import MoveCardModal from "./childComponent_CardDetail/Move";
import CopyCardModal from "./childComponent_CardDetail/Copy";
import ShareModal from "./childComponent_CardDetail/Share";

const CardModal = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(true);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [isMemberListOpen, setIsMemberListOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [isLabelListOpen, setIsLabelListOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [isMoveCardModalOpen, setIsMoveCardModalOpen] = useState(false); // State để mở/đóng modal di chuyển
  const [isCopyCardModalOpen, setIsCopyCardModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingCommentIndex, setEditingCommentIndex] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [cardName, setCardName] = useState(name || "Task4");
  const [previousCardName, setPreviousCardName] = useState(cardName);

  const members = [{ name: "Pham Thi Hong Ngat (FPL HN)" }];
  const loggedInUser = {
    name: "Current User",
    avatar: "https://via.placeholder.com/40",
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
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

  const handleAddTask = (taskName) => {
    setTasks([...tasks, { id: tasks.length + 1, name: taskName }]);
  };

  const handleSelectLabel = (newSelectedLabels) => {
    setSelectedLabels(newSelectedLabels);
  };

  const handleEditComment = (index) => {
    setEditingCommentIndex(index);
    setEditingCommentText(comments[index].text);
  };

  const handleSaveEditedComment = () => {
    const updatedComments = comments.map((cmt, index) =>
      index === editingCommentIndex ? { ...cmt, text: editingCommentText } : cmt
    );
    setComments(updatedComments);
    setEditingCommentIndex(null);
    setEditingCommentText("");
  };

  const handleDeleteComment = (index) => {
    setCommentToDelete(index);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteComment = () => {
    setComments(comments.filter((_, i) => i !== commentToDelete));
    setIsDeleteConfirmOpen(false);
    setCommentToDelete(null);
  };

  const handleNameClick = () => {
    setPreviousCardName(cardName);
    setIsEditingName(true);
  };

  const handleNameChange = (event) => {
    setCardName(event.target.value);
  };

  const handleNameBlur = () => {
    if (!cardName.trim()) {
      setCardName(previousCardName);
    }
    setIsEditingName(false);
  };

  const handleNameKeyPress = (event) => {
    if (event.key === "Enter") {
      if (!cardName.trim()) {
        setCardName(previousCardName);
      }
      setIsEditingName(false);
    }
  };

  return (
    <Dialog open={true} onClose={() => navigate(-1)} fullWidth maxWidth="md">
      <DialogTitle>
        {isEditingName ? (
          <TextField
            value={cardName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyPress={handleNameKeyPress}
            autoFocus
            fullWidth
            InputProps={{
              style: { height: "30px" },
            }}
          />
        ) : (
          <Typography variant="h6" fontWeight="bold" onClick={handleNameClick}>
            {cardName}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          Trong danh sách{" "}
          <span style={{ color: "#0079bf", fontWeight: "bold" }}>
            Tên của Board
          </span>
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {/* Cột trái (Nội dung chính) */}
          <Grid item xs={8}>
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
                sx={{ display: "flex", flexDirection: "column", mt: 1 }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    src={cmt.user.avatar}
                    alt={cmt.user.name}
                    sx={{ mr: 1, width: 30, height: 30, fontSize: "0.7rem" }}
                  />
                  <Box>
                    {editingCommentIndex === index ? (
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        multiline
                        rows={1}
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        sx={{ fontSize: "0.7rem" }}
                        InputProps={{
                          style: { fontSize: "0.7rem" },
                        }}
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        style={{
                          wordWrap: "break-word",
                          whiteSpace: "pre-wrap",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                        }}
                      >
                        <strong>{cmt.user.name}:</strong> {cmt.text}
                      </Typography>
                    )}
                    <Box sx={{ display: "flex", mt: "-4px" }}>
                      {editingCommentIndex === index ? (
                        <Button
                          size="small"
                          onClick={handleSaveEditedComment}
                          sx={{
                            fontSize: "0.456rem",
                            textTransform: "none",
                          }}
                        >
                          Save
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="small"
                            onClick={() => handleEditComment(index)}
                            sx={{
                              mr: "-8px",
                              fontSize: "0.456rem",
                              textTransform: "none",
                            }}
                          >
                            Chỉnh sửa
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleDeleteComment(index)}
                            sx={{
                              ml: "-16px",
                              fontSize: "0.456rem",
                              textTransform: "none",
                            }}
                          >
                            Xóa
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Grid>

          {/* Cột phải (Sidebar) */}
          <Grid item xs={4}>
            <Box sx={{ borderLeft: "1px solid #ddd", pl: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Add
              </Typography>
              <List>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemText primary="Tham gia" />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton onClick={() => setIsMemberListOpen(true)}>
                    <ListItemText primary="Thành viên" />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton onClick={() => setIsLabelListOpen(true)}>
                    <ListItemText primary="Nhãn" />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemText
                      primary="Việc cần làm"
                      onClick={() => setIsTaskModalOpen(true)}
                    />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemText primary="Ngày" />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => setIsAttachmentModalOpen(true)}
                  >
                    <ListItemText primary="Đính kèm" />
                  </ListItemButton>
                </ListItem>
              </List>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                Thao tác
              </Typography>
              <List>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => setIsMoveCardModalOpen(true)}>
                    <ListItemText primary="Di chuyển" />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton onClick={() => setIsCopyCardModalOpen(true)}>
                    <ListItemText primary="Sao chép" />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemText primary="Tạo mẫu" />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemText primary="Lưu trữ" />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton onClick={() => setIsShareModalOpen(true)}>
                    <ListItemText primary="Chia sẻ" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => navigate(-1)}>Close</Button>
      </DialogActions>

      {/* Component Member List */}
      <MemberList
        open={isMemberListOpen}
        onClose={() => setIsMemberListOpen(false)}
        members={members}
      />

      {/* Component Task Modal */}
      <TaskModal
        open={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleAddTask}
      />

      {/* Component Label List */}
      <LabelList
        open={isLabelListOpen}
        onClose={() => setIsLabelListOpen(false)}
        selectedLabels={selectedLabels}
        onSelectLabel={handleSelectLabel}
      />

      {/* Component Attachment Modal */}
      <AttachmentModal
        open={isAttachmentModalOpen}
        onClose={() => setIsAttachmentModalOpen(false)}
      />

      {/* Component Move Card Modal */}
      <MoveCardModal
        open={isMoveCardModalOpen}
        onClose={() => setIsMoveCardModalOpen(false)}
      />

      {/* Component CopyCardModal */}
      <CopyCardModal
        open={isCopyCardModalOpen}
        onClose={() => setIsCopyCardModalOpen(false)}
      />

      <ShareModal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareLink="https://trello.com/c/aZDXteH6"
      />

      <Dialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
      >
        <DialogContent>
          <Typography>Bạn có muốn xoa bình luận không?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteComment} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default CardModal;

import React, { useState, useEffect } from "react";
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
import AttachmentModal from "./childComponent_CardDetail/Attached.jsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import authClient from "../../../../../../../../../api/authClient";
import MoveCardModal from "./childComponent_CardDetail/Move";
import CopyCardModal from "./childComponent_CardDetail/Copy";
import ShareModal from "./childComponent_CardDetail/Share";
import { useCardById, useUpdateCardTitle } from "../../../../../../../../../hooks/useCard";
import { useCreateComment, useCommentsByCard, useDeleteComment, useUpdateComment } from "../../../../../../../../../hooks/useComment";
import { useStateContext } from "../../../../../../../../../contexts/ContextProvider.jsx";

const CardModal = () => {
  const { cardId, title } = useParams();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(true);
  const [originalDescription, setOriginalDescription] = useState("");
  const [comment, setComment] = useState("");
  // const [setComments] = useState([]);
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
  const [cardName, setCardName] = useState(title);
  const [previousCardName, setPreviousCardName] = useState(title);
  const queryClient = useQueryClient();

  const members = [{ name: "Pham Thi Hong Ngat (FPL HN)" }];
  const { data: comments = [] } = useCommentsByCard(cardId);
  const { user } = useStateContext(); // Dùng context để lấy user
  const { data: cardDetail, isLoading, error, updateDescriptionCard } = useCardById(cardId);
  const { mutate: updateCardTitle } = useUpdateCardTitle();
  const { mutate: removeComment } = useDeleteComment();
  const { mutate: editComment } = useUpdateComment();

  const { mutate: addComment, isLoadingComment } = useCreateComment();

  const { data: list, isLoading: listLoading, error: listError } = useQuery({
    queryKey: ["list", cardDetail?.list_board_id],
    queryFn: () => authClient.get(`/lists/${cardDetail?.list_board_id}/detail`).then((res) => res.data),
    enabled: !!cardDetail?.list_board_id, // Chỉ fetch khi có list_board_id
  });


  const isEmptyHTML = (html) => {
    if (!html || html.trim() === "") return true;
    // Kiểm tra nếu HTML chỉ chứa <p><br></p> hoặc các thẻ rỗng
    const stripped = html.replace(/<[^>]*>/g, "").trim(); // Loại bỏ tất cả thẻ HTML
    return stripped === "" || stripped === "<br>";
  };


  useEffect(() => {
    if (cardDetail?.description) {
      const isEmpty = isEmptyHTML(cardDetail.description);
      setDescription(cardDetail.description);
      setOriginalDescription(cardDetail.description);
      setIsEditingDescription(isEmpty); // Nếu description rỗng, tự động vào chế độ chỉnh sửa
    } else {
      setDescription(""); // Đặt description rỗng nếu không có
      setOriginalDescription(""); // Đặt giá trị ban đầu rỗng
      setIsEditingDescription(true); // Tự động vào chế độ chỉnh sửa nếu không có mô tả
    }
  }, [cardDetail?.description]);


  if (isLoading) return <Box>Loading...</Box>;
  if (error) return <Box>Error: {error.message}</Box>;

  if (listLoading) return <Box>Loading...</Box>;
  if (listError) return <Box>Error: {error.message}</Box>;


  const handleDescriptionClick = () => {
    setIsEditingDescription(true);
    setOriginalDescription(description);
  };


  const handleSaveDescription = () => {
    const descriptionToSend = isEmptyHTML(description) ? null : description;
    updateDescriptionCard(descriptionToSend); // Gửi nội dung hiện tại lên server
    setIsEditingDescription(false);
  };

  const handleCancelDescription = () => {
    setDescription(originalDescription); // Khôi phục giá trị ban đầu
    setIsEditingDescription(false); // Thoát chế độ chỉnh sửa
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      setIsEditingDescription(false);
    }
  };

  // const handleDescriptionClick = () => {
  //   setIsEditingDescription(true);
  // };

  const getPlainText = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const handleSaveComment = () => {
    if (!comment.trim()) {
      console.error("⚠️ Nội dung bình luận không được để trống!");
      return;
    }

    const newComment = {
      card_id: cardId, // ID của thẻ (UUID)
      user_id: user.id, // ID của user (UUID)
      content: comment.trim(), // Nội dung comment
    };

    addComment(newComment, {
      onSuccess: () => {
        setComment(""); // Reset input sau khi thêm thành công
        // refetch();
      },
    });
  };

  if (isLoadingUser) return <p>Loading...</p>;
  if (errorUser) return <p>Lỗi khi lấy dữ liệu user!</p>;

  const handleAddTask = (taskName) => {
    setTasks([...tasks, { id: tasks.length + 1, name: taskName }]);
  };

  const handleSelectLabel = (newSelectedLabels) => {
    setSelectedLabels(newSelectedLabels);
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentIndex(commentId);
    setEditingCommentText(currentText);
  };

  const handleSaveEditedComment = () => {
    if (!editingCommentText.trim()) {
      console.error("⚠️ Nội dung bình luận không được để trống!");
      return;
    }

    editComment(
      { commentId: editingCommentIndex, content: editingCommentText },
      {
        onSuccess: () => {
          setEditingCommentIndex(null);
          setEditingCommentText("");
        },
        onError: (error) => {
          console.error("❌ Lỗi khi chỉnh sửa bình luận:", error);
          alert("Chỉnh sửa bình luận thất bại! Vui lòng thử lại.");
        },
      }
    );
  };

  const handleDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteComment = () => {
    if (!commentToDelete) return;

    removeComment(commentToDelete, {
      onSuccess: () => {
        setIsDeleteConfirmOpen(false);
        setCommentToDelete(null);

        queryClient.invalidateQueries(["comments", cardId]);

      },
      onError: (error) => {
        console.error("❌ Lỗi khi xóa bình luận:", error);
        alert("Xóa bình luận thất bại! Vui lòng thử lại.");
      }
    });
  };
  const handleNameClick = () => {
    setPreviousCardName(cardName);
    setIsEditingName(true);
  };

  const handleNameChange = (event) => {
    setCardName(event.target.value);
  };

  const handleSave = () => {
    if (!cardName.trim()) {
      setCardName(previousCardName);
    } else if (cardName !== previousCardName) {
      updateCardTitle({ cardId: cardDetail.id, title: cardName }); // Gửi API
    }
    setIsEditingName(false);
  };

  const handleNameBlur = () => handleSave();


  const handleNameKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSave();
    }
  };

  return (
    <Dialog

      open={true}
      // onClose={closeDetail}
      fullWidth
      maxWidth="md"
      BackdropProps={{ sx: { backgroundColor: "transparent" } }}
      sx={{
        "& .MuiPaper-root": {
          boxShadow: "none", // Tắt shadow
          outline: "none", // Loại bỏ viền focus
        }
      }}

    >
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
            {cardDetail?.title}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          trong danh sách{" "}
          <span style={{ color: "#0079bf", fontWeight: "bold" }}>
            {list?.name || "Doing"}
          </span>
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {/* Cột trái (Nội dung chính) */}
          <Grid item xs={8}>
            <Typography variant="subtitle1" fontWeight="bold">
              Mô tả
            </Typography>
            {isEditingDescription ? (
              <>
                <ReactQuill
                  value={description}
                  onChange={setDescription}
                  placeholder="Add a more detailed description..."
                  style={{ marginTop: "8px" }}
                  // onKeyDown={(e) => handleKeyPress(e, document.querySelector(".ql-editor")?.__quill)}
                  theme="snow"
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, false] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link"],
                      ["clean"],
                    ],
                  }}
                  formats={["header", "bold", "italic", "underline", "strike", "list", "bullet", "link"]}
                  sx={{
                    "& .ql-container": { border: "1px solid #ddd", borderRadius: 4 },
                    "& .ql-toolbar": { border: "1px solid #ddd" }
                  }}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: "#0079BF",
                      color: "#FFF",
                      "&:hover": { backgroundColor: "#0067A3" }
                    }}
                    onClick={handleSaveDescription}
                  >
                    Lưu
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      color: "#172B4D",
                      borderColor: "#ddd",
                      "&:hover": { backgroundColor: "#E4E7EB", borderColor: "#bbb" }
                    }}
                    onClick={handleCancelDescription}
                  >
                    Hủy
                  </Button>
                </Box>
              </>
            ) : (
              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  color: "#172B4D",
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap", // Giữ định dạng dòng
                  cursor: "pointer",
                  // "&:hover": { backgroundColor: "#F5F6F8", borderRadius: 4 }
                  "& ol": { // Đảm bảo định dạng danh sách có số
                    listStyleType: "decimal",

                    paddingLeft: "20px", // Khoảng cách hợp lý cho danh sách
                  },
                  "& ul": { // Đảm bảo định dạng danh sách có số

                    listStyleType: "disc",
                    paddingLeft: "20px", // Khoảng cách hợp lý cho danh sách
                  },
                  "& li": {
                    // marginBottom: "8px", // Khoảng cách giữa các mục danh sách
                  }
                }}
                onClick={handleDescriptionClick}
                dangerouslySetInnerHTML={{ __html: description || cardDetail?.description || "No description" }}
              />
            )}

            {tasks.length > 0 && (
              <Grid item xs={8}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Công việc ({tasks.length})
                </Typography>

                <List>
                  {tasks.map((task) => (
                    <ListItem key={task.id} disablePadding>
                      <Checkbox
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id)}
                      />
                      <ListItemText
                        primary={task.name}
                        sx={{
                          textDecoration: task.completed ? "line-through" : "none",
                        }}
                      />
                    </ListItem>
                  ))}
                </List>

                {/* Nút "Thêm Công Việc" vẫn hiển thị */}
                <Button
                  variant="contained"
                  size="small"
                  sx={{ mt: 1, backgroundColor: "teal", fontSize: "0.7rem" }}
                  onClick={() => setIsTaskModalOpen(true)}
                >
                  Thêm Công Việc
                </Button>
              </Grid>
            )}





            {/* Thêm comment */}
            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold", mb: 2 }}>
              Hoạt động
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
                    src={cmt?.user?.avatar || ""}
                    sx={{
                      bgcolor: !cmt?.user?.avatar ? "pink" : "transparent",
                      color: !cmt?.user?.avatar ? "white" : "inherit",
                      width: 40,
                      height: 40,
                    }}
                  >
                    {!cmt?.user?.avatar && (cmt?.user?.full_name?.charAt(0)?.toUpperCase() || "?")}
                  </Avatar>
                  <Box>
                    {editingCommentIndex === cmt.id ? (
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
                        <strong>{cmt.user?.full_name || "Người dùng"}:</strong> {cmt.content}
                      </Typography>
                    )}
                    <Box sx={{ display: "flex", mt: "-4px" }}>
                      {editingCommentIndex === cmt.id ? (
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
                            onClick={() => handleEditComment(cmt.id, cmt.content)}
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
                            onClick={() => handleDeleteComment(cmt.id)}
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
          <Typography>Bạn có chắc muốn xoá bình luận này không?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteConfirmOpen(false)}>Hủy</Button>
          <Button onClick={confirmDeleteComment} color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default CardModal;

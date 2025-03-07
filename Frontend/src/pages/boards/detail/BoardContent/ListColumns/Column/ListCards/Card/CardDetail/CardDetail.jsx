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
  IconButton,
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
import DateModal from "./childComponent_CardDetail/Date";
import ShareModal from "./childComponent_CardDetail/Share";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Import icon
import ListItemIcon from "@mui/material/ListItemIcon";
import LinearProgress from "@mui/material/LinearProgress";
import Checkbox from "@mui/material/Checkbox";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useCardById, useUpdateCardTitle } from "../../../../../../../../../hooks/useCard";
import { useCreateComment, useCommentsByCard, useDeleteComment, useUpdateComment } from "../../../../../../../../../hooks/useComment";
import { useUser } from "../../../../../../../../../hooks/useUser";



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

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [setSelectedDate] = useState(null);

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState(""); // State cho danh sách mục riêng biệt

  const members = [{ name: "Pham Thi Hong Ngat (FPL HN)" }];
  // const loggedInUser = {
  //   name: "Current User",
  //   avatar: "https://via.placeholder.com/40",
  // };
  const { data: comments = [] } = useCommentsByCard(cardId);
  const { data: user, isLoadingUser, errorUser } = useUser();
  const { data: cardDetail, isLoading, error, updateDescriptionCard } = useCardById(cardId);
  const { mutate: updateCardTitle } = useUpdateCardTitle();
  const { mutate: removeComment } = useDeleteComment();
  const { mutate: editComment } = useUpdateComment();

  // console.log(cardId);

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

  /// THÊM CÔNG VIỆC

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(savedTasks);
    const savedItems = JSON.parse(localStorage.getItem("items")) || [];
    setItems(savedItems);
  }, []);


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

  // Thêm mục mới
  const addItem = (taskId, itemName) => {
    if (itemName.trim() === "") return;
    const updatedItems = [...items, { id: Date.now(), name: itemName, taskId }];
    setItems(updatedItems);
    localStorage.setItem("items", JSON.stringify(updatedItems));
  };

  // Toggle trạng thái hoàn thành
  const toggleItemCompletion = (id) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updatedItems);
    localStorage.setItem("items", JSON.stringify(updatedItems)); // Lưu vào localStorage
  };

  //Xóa công việc
  const handleDeleteTask = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    // Xóa tất cả items liên quan đến task
    const updatedItems = items.filter((item) => item.taskId !== taskId);
    setItems(updatedItems);
    localStorage.setItem("items", JSON.stringify(updatedItems));
  };

  //Thêm công việc
  const handleAddTask = (taskName) => {
    const newTask = { id: Date.now(), name: taskName };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    // Cập nhật lại danh sách items, chỉ giữ những items có taskId hợp lệ
    const validTaskIds = updatedTasks.map((task) => task.id);
    const filteredItems = items.filter((item) =>
      validTaskIds.includes(item.taskId)
    );
    setItems(filteredItems);
    localStorage.setItem("items", JSON.stringify(filteredItems));
  };

  //Sửa tên công việc
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTaskName, setEditedTaskName] = useState("");

  const handleEditTask = (id, name) => {
    setEditingTaskId(id);
    setEditedTaskName(name);
  };
  //Lưu tên công việc
  const handleSaveTask = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, name: editedTaskName } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    setEditingTaskId(null);
  };


  const handleSave = () => {
    if (!cardName.trim()) {
      setCardName(previousCardName);
    } else if (cardName !== previousCardName) {
      updateCardTitle({ cardId: cardDetail.id, title: cardName }); // Gửi API

  const handleKeyPressTask = (event, id) => {
    if (event.key === "Enter") {
      handleSaveTask(id);

    }
  };


  const handleNameBlur = () => handleSave();


  const handleNameKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSave();

  //Sửa tên mục
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedItemName, setEditedItemName] = useState("");
  const handleEditItem = (id, name) => {
    setEditingItemId(id);
    setEditedItemName(name);
  };

  //Lưu tên mục
  const handleSaveItem = (id) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, name: editedItemName } : item
    );
    setItems(updatedItems);
    localStorage.setItem("items", JSON.stringify(updatedItems));
    setEditingItemId(null);
  };

  const handleKeyPressItem = (event, id) => {
    if (event.key === "Enter") {
      handleSaveItem(id);

    }
  };

  //Xóa mục
  const [selectedItemId, setSelectedItemId] = useState(null);
  const handleDeleteItem = (id) => {
    const updatedItems = items.filter((item) => item.id !== id); // Xóa chỉ item có id được chọn
    setItems(updatedItems);
    localStorage.setItem("items", JSON.stringify(updatedItems));
    setMenuAnchor(null); // Đóng menu
    setSelectedItemId(null); // Đặt lại item được chọn
  };

  const [menuAnchor, setMenuAnchor] = useState(null);
  const handleMenuOpen = (event, id) => {
    setMenuAnchor(event.currentTarget);
    setSelectedItemId(id);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const completedItems = items.filter((item) => item.completed).length;
  const totalItems = items.length;

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;

  console.log("totalItems:", totalItems);
  console.log("totalTasks:", totalTasks);
  console.log("completedItems:", completedItems);
  console.log("completedTasks:", completedTasks);

  const itemProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const [showAddItemButton, setShowAddItemButton] = useState(true);

  const [taskInputs, setTaskInputs] = useState({}); // Lưu trạng thái nhập của từng task
  const [addingItemForTask, setAddingItemForTask] = useState(null); // Task nào đang hiển thị ô nhập

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

           

            {/* HIỂN THỊ DANH SÁCH VIỆC CẦN LÀM */}
            {tasks.length > 0 && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                }}
              >
                <List>
                  {tasks.map((task) => {
                    // Lọc ra các mục thuộc về task này
                    const taskItems = items.filter(
                      (item) => item.taskId === task.id
                    );
                    const completedItems = taskItems.filter(
                      (item) => item.completed
                    ).length;
                    const totalItems = taskItems.length;
                    const taskProgress =
                      totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

                    return (
                      <Box
                        key={task.id}
                        sx={{
                          mb: 3,
                          p: 2,
                        }}
                      >
                        {/* Hiển thị tên công việc */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          {/* <Typography variant="h6" fontWeight="bold">
                            {task.name}
                          </Typography> */}
                          {editingTaskId === task.id ? (
                            <TextField
                              fullWidth
                              variant="outlined"
                              size="small"
                              value={editedTaskName}
                              onChange={(e) =>
                                setEditedTaskName(e.target.value)
                              }
                              onBlur={() => handleSaveTask(task.id)}
                              onKeyDown={(e) => handleKeyPressTask(e, task.id)}
                              autoFocus
                            />
                          ) : (
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              onClick={() => handleEditTask(task.id, task.name)}
                              sx={{ cursor: "pointer" }}
                            >
                              {task.name}
                            </Typography>
                          )}

                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            Xóa
                          </Button>
                        </Box>

                        {/* Thanh tiến trình riêng cho mỗi task */}
                        <Box sx={{ mt: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Typography variant="body2" fontWeight="bold">
                              {Math.round(taskProgress)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={taskProgress}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>

                        {/* Danh sách mục của công việc này */}
                        <List sx={{ mt: 2 }}>
                          {taskItems.map((item) => (
                            <ListItem key={item.id}>
                              <ListItemIcon>
                                <Checkbox
                                  checked={item.completed || false}
                                  onChange={() => toggleItemCompletion(item.id)}
                                />
                              </ListItemIcon>

                              {editingItemId === item.id ? (
                                <TextField
                                  fullWidth
                                  variant="outlined"
                                  size="small"
                                  value={editedItemName}
                                  onChange={(e) =>
                                    setEditedItemName(e.target.value)
                                  }
                                  onBlur={() => handleSaveItem(item.id)}
                                  onKeyDown={(e) =>
                                    handleKeyPressItem(e, item.id)
                                  }
                                  autoFocus
                                />
                              ) : (
                                <ListItemText
                                  primary={item.name}
                                  onClick={() =>
                                    handleEditItem(item.id, item.name)
                                  }
                                  sx={{ cursor: "pointer" }}
                                />
                              )}

                              <IconButton
                                onClick={(e) => handleMenuOpen(e, item.id)}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </ListItem>
                          ))}
                        </List>

                        {/* Menu cho từng mục */}
                        <Menu
                          anchorEl={menuAnchor}
                          open={Boolean(menuAnchor)}
                          onClose={handleMenuClose}
                        >
                          <MenuItem
                            onClick={() => toggleItemCompletion(selectedItemId)}
                          >
                            Chuyển đổi trạng thái
                          </MenuItem>
                          <MenuItem
                            onClick={() => handleDeleteItem(selectedItemId)}
                          >
                            Xóa
                          </MenuItem>
                        </Menu>

                        {/* Thêm mục cho công việc này */}

                        {addingItemForTask === task.id ? (
                          <>
                            <TextField
                              fullWidth
                              placeholder="Thêm một mục..."
                              variant="outlined"
                              size="small"
                              sx={{ mt: 2 }}
                              value={taskInputs[task.id] || ""}
                              onChange={(e) =>
                                setTaskInputs({
                                  ...taskInputs,
                                  [task.id]: e.target.value,
                                })
                              }
                            />
                            <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => {
                                  if ((taskInputs[task.id] || "").trim() === "")
                                    return;
                                  addItem(task.id, taskInputs[task.id]); // Thêm vào task này
                                  setTaskInputs({
                                    ...taskInputs,
                                    [task.id]: "",
                                  }); // Reset input
                                  setAddingItemForTask(null); // Ẩn ô nhập
                                }}
                              >
                                Thêm
                              </Button>
                              <Button
                                variant="text"
                                size="small"
                                onClick={() => setAddingItemForTask(null)}
                              >
                                Hủy
                              </Button>
                            </Box>
                          </>
                        ) : (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{ mt: 2 }}
                            onClick={() => setAddingItemForTask(task.id)}
                          >
                            Thêm một mục
                          </Button>
                        )}
                      </Box>
                    );
                  })}
                </List>
              </Box>
            )}

            {/* THÊM COMMENT */}
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
                    <ListItemText
                      primary="Ngày"
                      onClick={() => setIsDateModalOpen(true)}
                    />
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

      <DateModal
        open={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onSave={(date) => setSelectedDate(date)}
      />

    </Dialog>
  );
};

export default CardModal;

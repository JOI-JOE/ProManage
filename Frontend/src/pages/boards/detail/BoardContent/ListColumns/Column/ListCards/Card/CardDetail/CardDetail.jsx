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
import AttachmentModal from "./childComponent_CardDetail/Attached";
import MoveCardModal from "./childComponent_CardDetail/Move";
import CopyCardModal from "./childComponent_CardDetail/Copy";
import ShareModal from "./childComponent_CardDetail/Share";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Import icon
import ListItemIcon from "@mui/material/ListItemIcon";
import LinearProgress from "@mui/material/LinearProgress";
import Checkbox from "@mui/material/Checkbox";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import DateModal from "./childComponent_CardDetail/Date";

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
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [setSelectedDate] = useState(null);

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState(""); // State cho danh sách mục riêng biệt

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

  const handleKeyPressTask = (event, id) => {
    if (event.key === "Enter") {
      handleSaveTask(id);
    }
  };

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
    <Dialog open={true} onClose={() => navigate(-1)} fullWidth maxWidth="md">
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          {name || "Task4"}
        </Typography>
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
                <Avatar
                  src={cmt.user.avatar}
                  alt={cmt.user.name}
                  sx={{ mr: 1, width: 30, height: 30, fontSize: "0.7rem" }}
                />
                <Typography
                  variant="body2"
                  style={{
                    wordWrap: "break-word", // Giữ từ dài không bị tràn
                    whiteSpace: "pre-wrap", // Giữ lại dòng mới
                    overflowWrap: "break-word", // Đảm bảo từ dài sẽ ngắt xuống dòng
                    wordBreak: "break-word", // Ngắt từ dài ra nhiều dòng nếu cần thiết
                  }}
                >
                  <strong>{cmt.user.name}:</strong> {cmt.text}
                </Typography>
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

      <DateModal
        open={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onSave={(date) => setSelectedDate(date)}
      />
    </Dialog>
  );
};

export default CardModal;

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  TextField,
  IconButton,
  ListItemButton,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Import icon
import ListItemIcon from "@mui/material/ListItemIcon";
import LinearProgress from "@mui/material/LinearProgress";
import Checkbox from "@mui/material/Checkbox";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TaskModal from "./Task";

const TaskList = () => {
  const navigate = useNavigate();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState(""); // State cho danh sách mục riêng biệt

  ///////////////////////////Thêm công việc

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(savedTasks);

    const savedItems = JSON.parse(localStorage.getItem("items")) || [];
    setItems(savedItems);
  }, []);

  const [taskTitle, setTaskTitle] = useState(""); // Thêm state để lưu tiêu đề công việc
  // Thêm mục mới
  const addItem = (taskId) => {
    if (newItem.trim() === "") return;
    const updatedItems = [
      ...items,
      { id: Date.now(), name: newItem, taskId: taskId }, // Liên kết với taskId
    ];
    setItems(updatedItems);
    localStorage.setItem("items", JSON.stringify(updatedItems));
    setNewItem("");
  };

  // Toggle trạng thái hoàn thành
  const toggleItemCompletion = (id) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updatedItems);
    localStorage.setItem("items", JSON.stringify(updatedItems)); // Lưu vào localStorage
  };

  //Xóa
  const handleDeleteTask = (taskId) => {
    // Xóa task
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));

    // Xóa tất cả items liên quan đến task
    const updatedItems = items.filter((item) => item.taskId !== taskId);
    setItems(updatedItems);
    localStorage.setItem("items", JSON.stringify(updatedItems));
  };

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

  //sửa
  const handleEditItem = (id, name) => {
    setEditingItemId(id);
    setEditedItemName(name);
  };

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

  //Xóa item

  // const [anchorEl, setAnchorEl] = useState(null);
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
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedItemName, setEditedItemName] = useState("");

  return (
    <Box open={true} onClose={() => navigate(-1)} fullWidth maxWidth="md">
      <Box>
        {/* Hiển thị danh sách Việc cần làm */}
        {tasks.length > 0 && (
          <Box
            sx={{
              mt: 2,
              p: 2,
            }}
          >
            <List>
              {tasks.map((task) => (
                <ListItem
                  key={task.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />{" "}
                      {/* Dấu tích màu xanh */}
                    </ListItemIcon>
                    <ListItemText
                      primary={task.name}
                      primaryTypographyProps={{ fontWeight: "bold" }}
                    />
                  </ListItem>

                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{ fontSize: "0.7rem" }}
                    onClick={() => handleDeleteTask(task.id)} // Gọi hàm xóa đúng cách
                  >
                    Xóa
                  </Button>
                </ListItem>
              ))}
            </List>

            {/* Hiển thị thanh tiến trình */}
            <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">
                {Math.round(itemProgress)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={itemProgress}
                sx={{ flex: 1, height: 8, borderRadius: 4 }}
              />
            </Box>

            <List>
              {items.map((item) => (
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
                      onChange={(e) => setEditedItemName(e.target.value)}
                      onBlur={() => handleSaveItem(item.id)}
                      onKeyDown={(e) => handleKeyPressItem(e, item.id)}
                      autoFocus
                    />
                  ) : (
                    <ListItemText
                      primary={item.name}
                      onClick={() => handleEditItem(item.id, item.name)}
                      sx={{ cursor: "pointer" }}
                    />
                  )}

                  {/* Nút Menu */}
                  <IconButton onClick={(e) => handleMenuOpen(e, item.id)}>
                    <MoreVertIcon />
                  </IconButton>
                </ListItem>
              ))}

              {/* Menu hiển thị khi bấm vào dấu ba chấm */}
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => toggleItemCompletion(selectedItemId)}>
                  Chuyển đổi trạng thái
                </MenuItem>
                <MenuItem onClick={() => handleDeleteItem(selectedItemId)}>
                  Xóa
                </MenuItem>
              </Menu>
            </List>
            {showAddItemButton ? (
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => setShowAddItemButton(false)}
              >
                Thêm một mục
              </Button>
            ) : (
              <>
                <TextField
                  fullWidth
                  placeholder="Thêm một mục..."
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2 }}
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                />

                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => {
                      if (newItem.trim() === "") {
                        // Nếu ô nhập trống, không ẩn đi, chỉ giữ lại để nhập tiếp
                        return;
                      }
                      addItem();
                      setShowAddItemButton(true); // Hiển thị lại nút sau khi thêm
                      setNewItem(""); // Xóa nội dung ô nhập sau khi thêm
                    }}
                  >
                    Thêm
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => {
                      setNewItem("");
                      setShowAddItemButton(true); // Ẩn input và nút khi bấm Hủy
                    }}
                  >
                    Hủy
                  </Button>
                </Box>
              </>
            )}
          </Box>
        )}
      </Box>
      <TaskModal
        open={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleAddTask}
      />
    </Box>
  );
};

export default TaskList;

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
  Chip,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import MemberList from "./childComponent_CardDetail/member.jsx";
import TaskModal from "./childComponent_CardDetail/Task.jsx";
import LabelList from "./childComponent_CardDetail/Label.jsx";
import AttachmentModal from "./childComponent_CardDetail/Attached.jsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import authClient from "../../../../../../../../../api/authClient";
import MoveCardModal from "./childComponent_CardDetail/Move";
import CopyCardModal from "./childComponent_CardDetail/Copy";
import ShareModal from "./childComponent_CardDetail/Share";

import ListItemIcon from "@mui/material/ListItemIcon";
import LinearProgress from "@mui/material/LinearProgress";
import Checkbox from "@mui/material/Checkbox";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import {
  useCardActions,
  useCardById,
  useUpdateCardTitle,
} from "../../../../../../../../../hooks/useCard";
import {
  useCreateComment,
  useCommentsByCard,
  useDeleteComment,
  useUpdateComment,
} from "../../../../../../../../../hooks/useComment";
import { useUser } from "../../../../../../../../../hooks/useUser";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { toast, ToastContainer } from "react-toastify";
import { useChecklistsByCard, useDeleteCheckList, useUpdateCheckList } from "../../../../../../../../../hooks/useCheckList";
import { useCreateCheckListItem, useDeleteCheckListItem, useToggleCheckListItemStatus, useUpdateCheckListItemName } from "../../../../../../../../../hooks/useCheckListItem";
import { useCardLabels } from "../../../../../../../../../hooks/useLabel.js";




const CardModal = () => {
  const { cardId, title } = useParams();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(true);
  const [originalDescription, setOriginalDescription] = useState("");
  const [comment, setComment] = useState("");
  // const [setComments] = useState([]);
  const { data: cardLabels } = useCardLabels(cardId);
  const [labels, setLabels] = useState([]);

  

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
  const [isFollowing, setIsFollowing] = useState(true);



  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");

 

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing);
  };

  const members = [{ name: "Pham Thi Hong Ngat (FPL HN)" }];
  const { data: comments = [] } = useCommentsByCard(cardId);
  const { data: user, isLoadingUser, errorUser } = useUser();
  const {
    data: cardDetail,
    isLoading,
    error,
    updateDescriptionCard,
  } = useCardById(cardId);
  const { mutate: updateCardTitle } = useUpdateCardTitle();
  const { mutate: removeComment } = useDeleteComment();
  const { mutate: editComment } = useUpdateComment();


  const { data: checklists = [], isLoadingChecklist } = useChecklistsByCard(cardId);
  const { mutate: updateCheckList } = useUpdateCheckList();
  const { mutate: removeCheckList } = useDeleteCheckList();

  const { mutate: addCheckListItem } = useCreateCheckListItem();
  const { mutate: toggleItemStatus } = useToggleCheckListItemStatus();
  const { mutate: updateCheckListItemName } = useUpdateCheckListItemName();
  const { mutate: deleteItem } = useDeleteCheckListItem();

  // console.log(cardId);

  const { mutate: addComment, isLoadingComment } = useCreateComment();
  const { archiveCard } = useCardActions();
  useEffect(() => {
    if (cardLabels?.length) {
      setLabels(cardLabels);
      console.log(cardLabels);
    }
  }, [cardLabels]);
  


  // const {
  //   data: list,
  //   isLoading: listLoading,
  //   error: listError,
  // } = useQuery({
  //   queryKey: ["list", cardDetail?.list_board_id],
  //   queryFn: () =>
  //     authClient
  //       .get(`/lists/${cardDetail?.list_board_id}/detail`)
  //       .then((res) => res.data),
  //   enabled: !!cardDetail?.list_board_id, // Chỉ fetch khi có list_board_id
  // });

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

  // if (isLoading) return <Box>Loading...</Box>;
  // if (error) return <Box>Error: {error.message}</Box>;

  // if (listLoading) return <Box>Loading...</Box>;
  // if (listError) return <Box>Error: {error.message}</Box>;
  // if (listLoading) return <Box>Loading...</Box>;
  // if (listError) return <Box>Error: {error.message}</Box>;

  const handleArchiveCard = (cardId) => {
    archiveCard(cardId);
  };


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

  /// THÊM CÔNG VIỆC


  const handleSelectLabel = (newSelectedLabels) => {
    setSelectedLabels(newSelectedLabels);
  };

  // Thêm mục mới
  const handleAddItem = (checklistId, itemName) => {
    if (itemName.trim() === "") return;

    addCheckListItem(
      { checklist_id: checklistId, name: itemName }, // Gửi request API
      {
        onSuccess: () => {
          console.log(`✅ Đã thêm mục: ${itemName}`);
          setNewItem(""); // Reset input sau khi thêm thành công
        },
        onError: (error) => {
          console.error("❌ Lỗi khi thêm mục checklist:", error);
        },
      }
    );
  };

  const toggleItemCompletion = (id) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, is_completed: !item.is_completed } : item
      )
    );

    toggleItemStatus(id, {
      onSuccess: () => {
        console.log("✅ Cập nhật trạng thái thành công");
      },
      onError: () => {
        console.error("❌ Lỗi khi cập nhật trạng thái checklist item");
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === id ? { ...item, is_completed: !item.is_completed } : item
          )
        );
      },
    });
  };

  const handleDeleteTask = (checklistId) => {
    removeCheckList(checklistId, {
      onSuccess: () => {
        console.log("✅ Checklist đã bị xóa thành công!");
        queryClient.invalidateQueries(["checklists", cardId]);
      },
      onError: (error) => {
        console.error("❌ Lỗi khi xóa checklist:", error);
      },
    });
  };


  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTaskName, setEditedTaskName] = useState("");

  // const handleAddTask = (taskName) => {
  //   setTasks([...tasks, { id: tasks.length + 1, name: taskName }]);
  // };


  const handleEditTask = (id, name) => {
    setEditingTaskId(id);
    setEditedTaskName(name);
  };

  const handleSaveTask = (id) => {
    if (!editedTaskName.trim()) return;

    updateCheckList(
      { id, name: editedTaskName },
      {
        onSuccess: () => {
          setEditingTaskId(null); // Thoát chế độ chỉnh sửa sau khi cập nhật

        },
        onError: (error) => {
          console.error("❌ Lỗi khi cập nhật checklist:", error);
        }
      }
    );
  };

  const handleKeyPressTask = (event, id) => {
    if (event.key === "Enter") {
      handleSaveTask(id);
    }
  };

  const [editingItemId, setEditingItemId] = useState(null);
  const [editedItemName, setEditedItemName] = useState("");
  const handleEditItem = (id, name) => {
    setEditingItemId(id);
    setEditedItemName(name);
  };

  const handleSaveItem = (id) => {
    if (!editedItemName.trim()) return;

    updateCheckListItemName(
      { itemId: id, name: editedItemName },
      {
        onSuccess: () => {
          setEditingItemId(null); // Thoát chế độ chỉnh sửa sau khi cập nhật
        },
        onError: (error) => {
          console.error("❌ Lỗi khi cập nhật tên checklist item:", error);
        }
      }
    );
  };

  const handleKeyPressItem = (event, id) => {
    if (event.key === "Enter") {
      handleSaveItem(id);
    }
  };

  const [selectedItemId, setSelectedItemId] = useState(null);

  const handleDeleteItem = (id) => {
    deleteItem(id, {
      onSuccess: () => {
        console.log(`✅ Xóa thành công ChecklistItem ID: ${id}`);
        handleMenuClose();

      },
      onError: (error) => {
        console.error("❌ Lỗi khi xóa:", error);
      },
    });
  };


  const [menuAnchor, setMenuAnchor] = useState(null);
  const handleMenuOpen = (event, id) => {
    setMenuAnchor(event.currentTarget);
    setSelectedItemId(id);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // const completedItems = items.filter((item) => item.completed).length;
  // const totalItems = items.length;

  // const completedTasks = tasks.filter((task) => task.completed).length;
  // const totalTasks = tasks.length;

  // const itemProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;


  // const [showAddItemButton, setShowAddItemButton] = useState(true);

  const [taskInputs, setTaskInputs] = useState({}); // Lưu trạng thái nhập của từng task
  const [addingItemForTask, setAddingItemForTask] = useState(null); // Task nào đang hiển thị ô nhập



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
      },
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
        },
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
            {cardDetail?.listName || "Doing"}
          </span>
        </Typography>
        {/* New section to match the provided image */}
        <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
          <Avatar sx={{ bgcolor: "teal", width: 26, height: 26, fontSize: 10 }}>
            PH
          </Avatar>
          <AddIcon
            sx={{
              fontSize: 14,
              color: "gray",
              cursor: "pointer",
              mr: 1,
              "&:hover": { color: "black" },
            }}
            onClick={() => setIsMemberListOpen(true)} // Thêm sự kiện onClick
          />
          {labels.map((label) => (
           <Button
           key={label.id}
           variant="contained"
           sx={{
             bgcolor: label.color?.hex_code || "#ccc",
             mr: 1,
             height: 25,
             p: "0px 8px", // Thêm padding ngang để không bị cắt chữ
             minWidth: "auto", // Cho phép nút mở rộng theo chữ
             width: "fit-content", // Tự động điều chỉnh theo nội dung
             maxWidth: "100%", // Giới hạn tối đa để tránh tràn
           }}
           onClick={() => setIsLabelListOpen(true)}
         >
           {label.title}
         </Button>
         
          ))}



          <AddIcon
            sx={{
              fontSize: 14,
              color: "gray",
              cursor: "pointer",
              mr: 1,
              "&:hover": { color: "black" },
            }}
            onClick={() => setIsLabelListOpen(true)} // Thêm sự kiện onClick
          />
          <Button
            variant="outlined"
            sx={{
              fontSize: "0.6rem",
              height: 25,
              p: 1,
              bgcolor: "teal",
              color: "white",
            }}
            onClick={handleFollowClick}
          >
            <VisibilityIcon sx={{ fontSize: "12px", mr: 0.5 }} />
            {isFollowing ? "Đang theo dõi" : "Theo dõi"}
          </Button>
        </Box>
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
                  formats={[
                    "header",
                    "bold",
                    "italic",
                    "underline",
                    "strike",
                    "list",
                    "bullet",
                    "link",
                  ]}
                  sx={{
                    "& .ql-container": {
                      border: "1px solid #ddd",
                      borderRadius: 4,
                    },
                    "& .ql-toolbar": { border: "1px solid #ddd" },
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                    mt: 1,
                  }}
                >
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: "teal",
                      color: "#FFF",
                      fontSize: "0.7rem",
                      height: "25px",
                      minWidth: "50px",
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
                      fontSize: "0.7rem",
                      height: "25px",
                      minWidth: "50px",
                      "&:hover": {
                        backgroundColor: "#E4E7EB",
                        borderColor: "#bbb",
                      },
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
                  "& ol": {
                    // Đảm bảo định dạng danh sách có số
                    listStyleType: "decimal",

                    paddingLeft: "20px", // Khoảng cách hợp lý cho danh sách
                  },
                  "& ul": {
                    // Đảm bảo định dạng danh sách có số

                    listStyleType: "disc",
                    paddingLeft: "20px", // Khoảng cách hợp lý cho danh sách
                  },
                  "& li": {
                    // marginBottom: "8px", // Khoảng cách giữa các mục danh sách
                  },
                }}
                onClick={handleDescriptionClick}
                dangerouslySetInnerHTML={{
                  __html:
                    description || cardDetail?.description || "No description",
                }}
              />
            )}

            {/* HIỂN THỊ DANH SÁCH VIỆC CẦN LÀM */}
            {checklists?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <List>
                  {checklists.map((checklist) => {
                    const taskItems = Array.isArray(checklist.items) ? checklist.items : [];
                    const completedItems = taskItems.filter((item) => item.is_completed).length;
                    const totalItems = taskItems.length;
                    const taskProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;


                    return (
                      <Box key={checklist.id} sx={{ mb: 3, p: 2 }}>
                        {/* Hiển thị tên checklist */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          {editingTaskId === checklist.id ? (
                            <TextField
                              fullWidth
                              variant="outlined"
                              size="small"
                              value={editedTaskName}
                              onChange={(e) => setEditedTaskName(e.target.value)}
                              onBlur={() => handleSaveTask(checklist.id)}
                              onKeyDown={(e) => handleKeyPressTask(e, checklist.id)}
                              autoFocus
                            />
                          ) : (
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              onClick={() => handleEditTask(checklist.id, checklist.name)}
                              sx={{ cursor: "pointer" }}
                            >
                              {checklist.name}
                            </Typography>
                          )}

                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteTask(checklist.id)}
                          >
                            Xóa
                          </Button>
                        </Box>

                        {/* Thanh tiến trình riêng */}
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {Math.round(taskProgress)}%
                            </Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={taskProgress}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: "#ddd", // Màu nền mặc định
                              "& .MuiLinearProgress-bar": {
                                backgroundColor: taskProgress === 100 ? "#4CAF50" : "#0079BF", // Xanh lá khi đạt 100%
                              },
                            }} />
                        </Box>

                        {/* Danh sách mục trong checklist */}
                        <List sx={{ mt: 2 }}>
                          {taskItems.map((item) => (
                            <ListItem key={item.id}>
                              <ListItemIcon>
                                <Checkbox
                                  checked={item.is_completed || false}
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
                                  sx={{
                                    cursor: "pointer",
                                    textDecoration: item.is_completed ? "line-through" : "none", // Gạch chữ nếu hoàn thành
                                    color: item.is_completed ? "black" : "inherit", // Làm mờ chữ khi hoàn thành
                                  }}
                                />
                              )}

                              <IconButton onClick={(e) => handleMenuOpen(e, item.id)}>
                                <MoreVertIcon />
                              </IconButton>
                            </ListItem>
                          ))}
                        </List>

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
                        {/* Thêm mục vào checklist */}
                        {addingItemForTask === checklist.id ? (
                          <>
                            <TextField
                              fullWidth
                              placeholder="Thêm một mục..."
                              variant="outlined"
                              size="small"
                              sx={{ mt: 2 }}
                              value={taskInputs[checklist.id] || ""}
                              onChange={(e) =>
                                setTaskInputs({ ...taskInputs, [checklist.id]: e.target.value })
                              }
                            />
                            <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => {
                                  if ((taskInputs[checklist.id] || "").trim() === "") return;
                                  handleAddItem(checklist.id, taskInputs[checklist.id]);
                                  setTaskInputs({ ...taskInputs, [checklist.id]: "" });
                                  setAddingItemForTask(null);
                                }}
                              >
                                Thêm
                              </Button>
                              <Button variant="text" size="small" onClick={() => setAddingItemForTask(null)}>
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
                            onClick={() => setAddingItemForTask(checklist.id)}
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


            {/* Thêm comment */}
            <Typography
              variant="subtitle1"
              sx={{ mt: 2, fontWeight: "bold", mb: 2 }}
            >
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
              sx={{
                mt: 1,
                backgroundColor: "teal",
                fontSize: "0.7rem",
                height: "25px",
                minWidth: "50px",
              }}
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
                    {!cmt?.user?.avatar &&
                      (cmt?.user?.full_name?.charAt(0)?.toUpperCase() || "?")}
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
                        <strong>{cmt.user?.full_name || "Người dùng"}:</strong>{" "}
                        {cmt.content}
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
                            onClick={() =>
                              handleEditComment(cmt.id, cmt.content)
                            }
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
                  <ListItemButton onClick={() => handleArchiveCard(cardId)}>
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
      // onSave={handleAddTask}
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
      <ToastContainer />
    </Dialog>

  );
};

export default CardModal;

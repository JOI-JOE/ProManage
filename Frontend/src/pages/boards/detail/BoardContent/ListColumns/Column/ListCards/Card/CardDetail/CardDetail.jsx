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
  Popover,
  Modal,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import MemberList from "./childComponent_CardDetail/member.jsx";
import TaskModal from "./childComponent_CardDetail/Task.jsx";
import LabelList from "./childComponent_CardDetail/Label.jsx";
import AttachmentModal from "./childComponent_CardDetail/Attached.jsx";
import MoveCardModal from "./childComponent_CardDetail/Move";
import CopyCardModal from "./childComponent_CardDetail/Copy";
import ShareModal from "./childComponent_CardDetail/Share";
import DateModal from "./childComponent_CardDetail/Date";
import ListItemIcon from "@mui/material/ListItemIcon";
import LinearProgress from "@mui/material/LinearProgress";
import Checkbox from "@mui/material/Checkbox";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import NotesIcon from "@mui/icons-material/Notes";
import BarChartIcon from "@mui/icons-material/BarChart";
import GroupIcon from "@mui/icons-material/Group";
import LabelIcon from "@mui/icons-material/Label";
import ChecklistIcon from "@mui/icons-material/Checklist";
import EventIcon from "@mui/icons-material/Event";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MoveUpIcon from "@mui/icons-material/MoveUp";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import SpeakerGroupIcon from "@mui/icons-material/SpeakerGroup";
import ArchiveIcon from "@mui/icons-material/Archive";
import ShareIcon from "@mui/icons-material/Share";
import CollectionsIcon from "@mui/icons-material/Collections";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { v4 as uuidv4 } from 'uuid';
import {
  useCardActions,
  useCardById,
  useCardSchedule,
  useGetMemberInCard,
  useUpdateCardTitle,
} from "../../../../../../../../../hooks/useCard";
import {
  useCreateComment,
  useCommentsByCard,
  useDeleteComment,
  useUpdateComment,
} from "../../../../../../../../../hooks/useComment";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { toast, ToastContainer } from "react-toastify";
import {
  useChecklistsByCard,
  useDeleteCheckList,
  useUpdateCheckList,
} from "../../../../../../../../../hooks/useCheckList";
import {
  useCreateCheckListItem,
  useDeleteCheckListItem,
  useToggleCheckListItemMember,
  useToggleCheckListItemStatus,
  useUpdateCheckListItemName,
} from "../../../../../../../../../hooks/useCheckListItem";
import CoverPhoto from "./childComponent_CardDetail/CoverPhoto";
import { useCardLabels } from "../../../../../../../../../hooks/useLabel.js";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import dayjs from "dayjs";
import AttachmentIcon from "@mui/icons-material/Attachment";
import { AccessTime, ArrowBack } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useActivityByCardId } from "../../../../../../../../../hooks/useActivity.js";
import { formatTime } from "../../../../../../../../../../utils/dateUtils.js";
import { useMe } from "../../../../../../../../../contexts/MeContext.jsx";
import ChecklistItemRow from "./childComponent_CardDetail/ChecklistItemRow.jsx";

import useAttachments from "../../../../../../../../../hooks/useAttachment.js";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const CardModal = ({ }) => {
  const { cardId, title } = useParams();
  const { data: schedule } = useCardSchedule(cardId);//date

  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [originalDescription, setOriginalDescription] = useState("");
  const [comment, setComment] = useState("");
  const [isEditingComment, setIsEditingComment] = useState(false);
  // const [setComments] = useState([]);
  const { data: cardLabels = [] } = useCardLabels(cardId);
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
  const [isFollowing, setIsFollowing] = useState(true);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  const [checklistItems, setChecklistItems] = useState([]);
  const [newItem, setNewItem] = useState("");

  const [memberListConfig, setMemberListConfig] = useState({
    open: false,
    type: null,
    targetId: null,
  });
  // const [activity, setActivity] = useState("");

  const [items, setItems] = useState([]);
  // const [newItem, setNewItem] = useState("");
  const formatDate = (dateString) => {
    if (!dateString) return "Không có";
    const date = new Date(dateString);
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  }

  const [coverImage, setCoverImage] = useState(
    localStorage.getItem(`coverImage-${cardId}`) || null
  );
  const [coverColor, setCoverColor] = useState(
    localStorage.getItem(`coverColor-${cardId}`) || null
  );



  // const handleCoverImageChange = (newImage) => {
  //   setCoverImage(newImage);
  //   setCoverColor(null); // Reset color when an image is selected
  //   localStorage.setItem(`coverImage-${cardId}`, newImage);
  //   localStorage.removeItem(`coverColor-${cardId}`);
  // };

  // const handleCoverColorChange = (newColor) => {
  //   setCoverColor(newColor);
  //   setCoverImage(null); // Reset image when a color is selected
  //   localStorage.setItem(`coverColor-${cardId}`, newColor);
  //   localStorage.removeItem(`coverImage-${cardId}`);
  // };

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing);
  };

  const { data: comments = [] } = useCommentsByCard(cardId);
  const {
    data: cardDetail,
    isLoading,
    error,
    updateDescriptionCard,
  } = useCardById(cardId);
  const { mutate: updateCardTitle } = useUpdateCardTitle();
  const { mutate: removeComment } = useDeleteComment();
  const { mutate: editComment } = useUpdateComment();

  const { data: checklists = [], isLoadingChecklist } =
    useChecklistsByCard(cardId);
  const { mutate: updateCheckList } = useUpdateCheckList();
  const { mutate: removeCheckList } = useDeleteCheckList();

  const { mutate: addCheckListItem } = useCreateCheckListItem();
  const { mutate: toggleItemStatus } = useToggleCheckListItemStatus();
  const { mutate: updateCheckListItemName } = useUpdateCheckListItemName();
  const { mutate: deleteItem } = useDeleteCheckListItem();
  const { mutate: toggleCheckListItemMember } = useToggleCheckListItemMember();

  const {
    data: activities = [],
    isLoadingActivity,
    errorActivity,
  } = useActivityByCardId(cardId);

  // console.log(activities);

  const { user } = useMe();
  const userId = user?.id;

  const combinedData = [
    ...comments.map((comment) => ({ ...comment, type: "comment" })),
    ...activities.map((activity) => ({ ...activity, type: "activity" })),
  ];

  const sortedData = combinedData.sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });
  // console.log(user);
  if (isLoadingActivity) return <Typography>Đang tải hoạt động...</Typography>;
  if (errorActivity)
    return <Typography color="red">Lỗi khi tải dữ liệu!</Typography>;

  // console.log(activities);

  const { mutate: addComment, isLoadingComment } = useCreateComment();
  const { archiveCard } = useCardActions();
  const { data: members, toggleMember } = useGetMemberInCard(cardId);
  useEffect(() => {
    if (JSON.stringify(labels) !== JSON.stringify(cardLabels)) {
      setLabels(cardLabels);
    }
  }, [cardLabels, labels]);

  // console.log(cardLabels);

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
      setIsEditingDescription(false); // Không tự động vào chế độ chỉnh sửa nếu không có mô tả
    }
  }, [cardDetail?.description]);

  // if (listLoading) return <Box>Loading...</Box>;
  // if (listError) return <Box>Error: {error.message}</Box>;

  const handleArchiveCard = (cardId) => {
    archiveCard(cardId);
    navigate(-1);
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

  // Xử lý tham gia/rời khỏi card
  const handleJoinCard = () => {
    toggleMember(userId);
  };

  const isMember = members?.data?.some((m) => m.id === userId);

  const getPlainText = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const handleSaveComment = () => {
    if (isEmptyHTML(comment)) {
      console.error("⚠️ Nội dung bình luận không được để trống!");
      return;
    }

    const newComment = {
      card_id: cardId,
      user_id: user.id,
      content: comment.trim(), // Có thể giữ hoặc xử lý thêm để loại bỏ thẻ rỗng
    };

    addComment(newComment, {
      onSuccess: () => {
        setComment("");
        setIsEditingComment(false);
      },
    });
  };

  // if (isLoadingUser) return <p>Loading...</p>;
  // if (errorUser) return <p>Lỗi khi lấy dữ liệu user!</p>;

  /// THÊM CÔNG VIỆC

  const handleSelectLabel = (newSelectedLabels) => {
    setSelectedLabels(newSelectedLabels);
  };

  // Thêm mục mới
  const handleAddItem = (checklistId, itemName) => {
    if (itemName.trim() === "") return;

    addCheckListItem(
      { checklist_id: checklistId, name: itemName, cardId: cardId }, // Gửi request API
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
    // Tìm trạng thái hiện tại để rollback sau nếu lỗi

    // Optimistic update: cập nhật UI trước
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, is_completed: !item.is_completed } : item
      )
    );

    // Gọi API
    toggleItemStatus({ itemId: id, cardId: cardId }, {
      onSuccess: () => {
        console.log("✅ Cập nhật trạng thái thành công");
        // Không invalidate nếu đã update local state
      },
      onError: () => {
        console.error("❌ Lỗi khi cập nhật trạng thái checklist item");
        // Rollback về trạng thái ban đầu
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === id ? { ...item, is_completed: originalStatus } : item
          )
        );
      },
    });
  };


  // const handleDeleteTask = (checklistId) => {
  //   removeCheckList(checklistId, {
  //     onSuccess: () => {
  //       console.log("✅ Checklist đã bị xóa thành công!");
  //       // queryClient.invalidateQueries({queryKey: ["checklists", cardId]});
  //       // // queryClient.invalidateQueries({ queryKey: ["checklists", card_id] }); // Cập nhật lại danh sách checklist
  //       // queryClient.invalidateQueries({ queryKey: ["activities"] });
  //     },
  //     onError: (error) => {
  //       console.error("❌ Lỗi khi xóa checklist:", error);
  //     },
  //   });
  // };

  // {card_id: cardId, name: taskName },
  const handleDeleteTask = (checklistId) => {
    removeCheckList(
      { checklistId: checklistId, cardId: cardId }, // ✅ Truyền đầy đủ object với checklistId và cardId
      {
        onSuccess: () => {
          console.log("✅ Checklist đã bị xóa thành công!");
        },
        onError: (error) => {
          console.error("❌ Lỗi khi xóa checklist:", error);
        },
      }
    );
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
      { id: id, name: editedTaskName, cardId: cardId },
      {
        onSuccess: () => {
          setEditingTaskId(null); // Thoát chế độ chỉnh sửa sau khi cập nhật
        },
        onError: (error) => {
          console.error("❌ Lỗi khi cập nhật checklist:", error);
        },
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
      { itemId: id, name: editedItemName, cardId:cardId },
      {
        onSuccess: () => {
          setEditingItemId(null); // Thoát chế độ chỉnh sửa sau khi cập nhật
        },
        onError: (error) => {
          console.error("❌ Lỗi khi cập nhật tên checklist item:", error);
        },
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
    deleteItem( { id: id, cardId:cardId }, {
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

        // queryClient.invalidateQueries(["comments", cardId]);
        // queryClient.invalidateQueries({ queryKey: ["comments"] });
        // queryClient.invalidateQueries({ queryKey: ["lists"] });
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

  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleOpen = (imageUrl) => {
    setSelectedImage(imageUrl);
    setOpen(true);
  };

  // Hàm đóng modal
  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
  };

  //NGÀY
  const [dateInfo, setDateInfo] = useState(null);
  const [openDateModal, setOpenDateModal] = useState(false);

  const handleSaveDate = (data) => {
    setDateInfo(data); // Lưu dữ liệu từ DateModal.jsx
    setOpenDateModal(false); // Đóng modal sau khi lưu
  };

  const isNearDeadline = () => {
    if (!dateInfo?.endDate) return false;
    const now = dayjs();
    const end = dayjs(dateInfo.endDate);
    return end.diff(now, "hour") < 2 && end.isAfter(now);
  };

  const isOverdue = () => {
    if (!dateInfo?.endDate) return false;
    const now = dayjs();
    return dayjs(dateInfo.endDate).isBefore(now);
  };

  const handleCommentClick = () => {
    setIsEditingComment(true);
  };

  const [isDetailHidden, setIsDetailHidden] = useState(false);

  const handleToggleDetail = () => {
    setIsDetailHidden(!isDetailHidden);
  };

  const [isCoverPhotoOpen, setIsCoverPhotoOpen] = useState(false);

  // const [attachments, setAttachments] = useState([]); // Lưu file/link đính kèm
  const [anchorEl1, setAnchorEl1] = useState(null); // Menu liên kết
  const [anchorEl2, setAnchorEl2] = useState(null); // Menu tệp

  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  const [editedItem, setEditedItem] = useState(null);
  const [editedUrl, setEditedUrl] = useState("");
  const [editedDisplayText, setEditedDisplayText] = useState("");

  //////////////////////////////////////ATTACHMENT///////////////////////////////////////
  const { attachments, removeAttachment, updateAttachment, setCoverImages } =
    useAttachments(cardId);
  const coverImageAttachment = attachments?.data?.find((file) => file.is_cover);
  const coverImageBackGround = coverImageAttachment
    ? coverImageAttachment.path_url
    : null;

  const handleCoverImageChange = (attachmentId) => {
    if (attachmentId) {
      setCoverImages(attachmentId); // Gọi mutation để đặt ảnh bìa
      handleMenuClose2(); // Đóng menu con
    }
  };

  const handleAddAttachment = (newAttachments) => {
    if (!newAttachments) return; // Bỏ qua nếu dữ liệu không hợp lệ

    setAttachments((prev) => {
      let formattedAttachments = Array.isArray(newAttachments)
        ? newAttachments
        : [newAttachments];

      // Đảm bảo mỗi file/link đều có type đúng
      formattedAttachments = formattedAttachments.map((item) => ({
        ...item,
        type: item.type || (item.url ? "link" : "file"), // Nếu có url nhưng không có type, mặc định là "link"
      }));

      return [...prev, ...formattedAttachments];
    });
  };

  const handleMenuOpen1 = (event, item) => {
    setAnchorEl1(event.currentTarget);
    setEditedItem(item);
  };

  const handleMenuClose1 = () => {
    setAnchorEl1(null);
  };

  const handleEdit = () => {
    setEditedUrl(editedItem.url);
    setEditedDisplayText(editedItem.name);
    setPopoverAnchorEl(anchorEl1);
    handleMenuClose1();
  };

  const handleDelete = (attachmentId) => {
    removeAttachment(attachmentId);
    handleMenuClose1();
    // console.log('kokokok');
  };

  const handleSave1 = () => {
    setAttachments((prevAttachments) =>
      prevAttachments.map((item) =>
        item.id === editedItem.id
          ? { ...item, url: editedUrl, name: editedDisplayText }
          : item
      )
    );
    setPopoverAnchorEl(null);
  };

  const [files, setFiles] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);

  // Mở ảnh trong tab mới với tiêu đề là tên ảnh
  const openInNewTab = (file) => {
    const newWindow = window.open(file.url, "_blank");
    if (newWindow) {
      newWindow.onload = () => {
        newWindow.document.title = file.name;
      };
    }
  };

  // Tải ảnh xuống
  const downloadFile = (file) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name || "downloaded_image";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [editAnchorEl, setEditAnchorEl] = useState(null);
  const [newFileName, setNewFileName] = useState("");

  const handleMenuOpen2 = (event, file) => {
    setAnchorEl2(event.currentTarget);
    setSelectedFile(file);
  };

  const handleMenuClose2 = () => {
    setAnchorEl2(null);
  };

  // Hàm mở Popover (có thể gọi ở nút "Sửa")
  const handleOpenPopover = () => {
    setNewFileName(
      attachments.data.find((file) => file.id === selectedFile)
        ?.file_name_defaut || ""
    );

    setEditAnchorEl(true); // Gán vị trí anchor từ menu con
    handleMenuClose2(); // Đóng menu con
  };

  // Hàm đóng Popover
  const handleClosePopover = () => {
    setEditAnchorEl(null);
  };

  // Hàm đổi tên file (logic đổi tên sẽ được bạn tùy chỉnh)
  const handleRename = () => {
    console.log("Selected File ID:", selectedFile);

    if (selectedFile && newFileName.trim() !== "") {
      // Gọi mutation updateAttachment với cardId, selectedFile (id), và newFileName
      updateAttachment({ cardId, attachmentId: selectedFile, newFileName });
      handleClosePopover(); // Đóng popover sau khi gọi mutation
    }
  };

  const handleDeleteFile = () => {
    removeAttachment(selectedFile);
    handleMenuClose2(); // Đóng menu sau khi xóa
  };

  // const handleDownloadFile = (file) => {
  //   if (!file || !file.url) return;

  //   // Tạo một thẻ <a> ẩn để tải file
  //   const link = document.createElement("a");
  //   link.href = file.url;
  //   link.setAttribute("download", file.name || "download"); // Đặt tên file khi tải về
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

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
          overflow: "hidden", // Hide overflow to move scrollbar outside
        },
      }}
    >
      <Box
        sx={{
          height: "100%",
          overflowY: "auto", // Add scrollbar to outer container
          "&::-webkit-scrollbar": {
            width: "5px", // Adjust the width of the scrollbar
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#888", // Color of the scrollbar thumb
            borderRadius: "4px", // Rounded corners for the scrollbar thumb
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#555", // Color of the scrollbar thumb on hover
          },
        }}
      >
        <DialogTitle>
          {/* New image section */}
          {(coverImageBackGround || coverColor) && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center", // Căn giữa ảnh theo chiều ngang
                alignItems: "center", // Căn giữa theo chiều dọc
                width: "100%",
                height: "150px",
                mb: 2,
                overflow: "hidden", // Đảm bảo ảnh không tràn ra ngoài
                backgroundColor: coverColor || "transparent",
              }}
            >
              {coverImageBackGround && (
                <LazyLoadImage
                  src={coverImageBackGround} // Use the dynamic cover image
                  alt="Card Cover"
                  effect="blur" // Thêm hiệu ứng mờ khi tải ảnh
                  style={{
                    width: "100%", // Đảm bảo full chiều rộng
                    height: "100%", // Đảm bảo full chiều cao
                    objectFit: "cover", // Ảnh full khung mà không méo
                  }}
                />
              )}
            </Box>
          )}

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
            <Typography
              variant="h6"
              fontWeight="bold"
              onClick={handleNameClick}
            >
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
            {/* Hiển thị thành viên và nhãn chỉ khi có dữ liệu */}
            {(members?.data?.length > 0 || labels?.length > 0) && (
              <>
                {/* Hiển thị danh sách thành viên */}
                {members?.data?.map((member) => (
                  <Avatar
                    key={member.id}
                    sx={{
                      bgcolor: "teal",
                      width: 26,
                      height: 26,
                      fontSize: 10,
                    }}
                  >
                    {member.full_name
                      ? member.full_name.charAt(0).toUpperCase()
                      : "?"}
                  </Avatar>
                ))}

                {/* Nút thêm thành viên */}
                {members?.data?.length > 0 && (
                  <AddIcon
                    sx={{
                      fontSize: 14,
                      color: "gray",
                      cursor: "pointer",
                      mr: 1,
                      "&:hover": { color: "black" },
                    }}
                    onClick={() =>
                      setMemberListConfig({
                        open: true,
                        type: "card",
                        targetId: cardId,
                      })
                    }
                  />
                )}

                {/* Hiển thị danh sách nhãn */}
                {labels?.map((label) => (
                  <Button
                    key={label.id}
                    variant="contained"
                    sx={{
                      bgcolor: label.color?.hex_code || "#ccc",
                      mr: 1,
                      height: 25,
                      p: "0px 8px",
                      minWidth: "auto",
                      width: "fit-content",
                      maxWidth: "100%",
                    }}
                    onClick={() => setIsLabelListOpen(true)}
                  >
                    {label.title}
                  </Button>
                ))}

                {/* Nút thêm nhãn */}
                {labels?.length > 0 && (
                  <AddIcon
                    sx={{
                      fontSize: 14,
                      color: "gray",
                      cursor: "pointer",
                      mr: 1,
                      "&:hover": { color: "black" },
                    }}
                    onClick={() => setIsLabelListOpen(true)}
                  />
                )}
              </>
            )}

            {/* Nút Theo dõi luôn hiển thị */}
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
          <IconButton
            aria-label="close"
            onClick={() => navigate(-1)}
            sx={{
              position: "absolute",
              right: -3,
              top: 8,
              color: "black",
            }}
          >
            <CloseIcon
              sx={{
                fontSize: "14px",
              }}
            />
          </IconButton>
        </DialogTitle>

        {/* NGÀY */}
        {schedule && (
          <>
            <Typography sx={{ fontWeight: "bold", mb: 0, ml: 3 }}>
              Ngày
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,

                ml: 3,
                p: 1,
              }}
              // onClick={openDateModal}
              onClick={() => setIsDateModalOpen(true)}
            >
              <Typography>{formatDate(schedule.start_date)} -</Typography>

              <Typography>{formatDate(schedule.end_date)}</Typography>
              <Typography>{schedule.end_time}</Typography>
              {/* Kiểm tra trạng thái deadline */}
              {isOverdue() && (
                <Chip
                  label="Quá hạn"
                  color="error"
                  sx={{ fontSize: 12, height: 22 }}
                />
              )}
              {isNearDeadline() && (
                <Chip
                  label="Sắp hết hạn"
                  color="warning"
                  sx={{ fontSize: 12, height: 22 }}
                />
              )}
              <ArrowDropDownIcon />
            </Box>
          </>
        )}
        <DialogContent>
          <Grid container spacing={2}>
            {/* Cột trái (Nội dung chính) */}
            <Grid item xs={8}>
              <Typography variant="subtitle1" fontWeight="bold">
                <NotesIcon sx={{ fontSize: "0.8rem", mr: 1 }} />
                Mô tả
              </Typography>
              {!isEditingDescription && (
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
                      description ||
                      cardDetail?.description ||
                      "<span style='color: #a4b0be; font-size: 0.6rem;'>Thêm mô tả ...</span>",
                  }}
                />
              )}
              {isEditingDescription && (
                <>
                  <ReactQuill
                    value={description}
                    onChange={setDescription}
                    placeholder="Add a more detailed description..."
                    style={{ marginTop: "8px" }}
                    theme="snow"
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, false] }],
                        ["bold", "italic", "underline", "strike"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link"],
                        ["image"],
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
                      "image",
                    ]}
                    sx={{
                      "& .ql-container": {
                        border: "1px solid #ddd",
                        borderRadius: 4,
                      },
                      "& .ql-toolbar": { border: "1px solid #ddd" },
                    }}
                  />
                  {description.trim() && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start", // Change to flex-start
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
                  )}
                </>
              )}

              {/* ĐÍNH KÈM */}
              <Box sx={{ mt: "30px", pl: "5" }}>
                {attachments?.data?.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: "10px",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <AttachmentIcon sx={{ marginRight: "8px" }} /> Các tập tin
                      đính kèm
                    </Typography>

                    <Button onClick={() => setIsAttachmentModalOpen(true)}>
                      Thêm
                    </Button>
                  </Box>
                )}
                {/* ///////////////////// CHECK LENGTH////////////////////////////// */}
                {/* Liên kết */}
                {attachments?.data?.some(
                  (item) => !/\.(png|jpg|jpeg|gif|pdf)$/i.test(item.path_url)
                ) && (
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: "12px", // Giảm font size để tiết kiệm không gian
                          ml: "20px",
                          mt: "5px",
                          mb: "3px", // Giảm khoảng cách với các mục bên dưới
                        }}
                      >
                        Liên kết
                      </Typography>
                      <List>
                        {attachments.data
                          .filter(
                            (file) =>
                              !/\.(png|jpg|jpeg|gif|pdf)$/i.test(file.path_url)
                          ) // Lọc các "liên kết"
                          .map((file) => {
                            const domain = new URL(
                              file.path_url
                            ).hostname.replace(/^www\./, "");

                            return (
                              <ListItem
                                key={file.id}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  paddingRight: "40px",
                                  mb: "4px",
                                  ml: "10px",
                                  cursor: "pointer",
                                  height: "30px",
                                  width: "100%",

                                  border: "1px solid #F2F2F4",
                                  backgroundColor: "#F2F2F4",
                                  borderRadius: "4px",
                                }}
                              >
                                {/* Hiển thị favicon và link cùng một hàng */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    flexGrow: 1,
                                  }}
                                >
                                  <img
                                    src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
                                    alt="favicon"
                                    style={{
                                      width: "16px",
                                      height: "16px",
                                    }}
                                  />
                                  <a
                                    href={file.path_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={file.path_url}
                                    style={{
                                      color: "#5795EC",
                                      fontSize: "15px",
                                      textDecoration: "none",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      maxWidth: "300px",
                                      display: "inline-block",
                                    }}
                                  >
                                    {file.file_name_defaut || domain}
                                  </a>
                                </Box>

                                <IconButton
                                  onClick={(e) => handleMenuOpen1(e, file)}
                                  sx={{ ml: "auto" }}
                                >
                                  <MoreVertIcon />
                                  <Menu
                                    anchorEl={anchorEl1}
                                    open={Boolean(anchorEl1)}
                                    onClose={handleMenuClose1}
                                    anchorOrigin={{
                                      vertical: "bottom",
                                      horizontal: "left",
                                    }}
                                    transformOrigin={{
                                      vertical: "top",
                                      horizontal: "left",
                                    }}
                                  >
                                    <MenuItem
                                      onClick={() => {
                                        handleEdit();
                                        handleMenuClose1();
                                      }}
                                    >
                                      Sửa
                                    </MenuItem>
                                    <MenuItem>Nhận xét</MenuItem>
                                    <MenuItem
                                      onClick={() => {
                                        handleDelete(file.id);
                                        // handleMenuClose1();
                                      }}
                                    >
                                      Xóa
                                    </MenuItem>
                                  </Menu>
                                </IconButton>
                              </ListItem>
                            );
                          })}
                      </List>
                    </Box>
                  )}

                {/* Popover chỉnh sửa */}
                <Popover
                  open={Boolean(popoverAnchorEl)}
                  anchorEl={popoverAnchorEl}
                  onClose={() => setPopoverAnchorEl(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                >
                  <Box sx={{ padding: 2, width: 300 }}>
                    <IconButton onClick={() => setPopoverAnchorEl(null)}>
                      <ArrowBack />
                    </IconButton>
                    <Typography variant="h6" sx={{ textAlign: "center" }}>
                      Sửa tệp đính kèm
                    </Typography>
                    <Typography variant="subtitle2">
                      Tìm kiếm hoặc dán liên kết
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <TextField
                        fullWidth
                        value={editedUrl}
                        onChange={(e) => setEditedUrl(e.target.value)}
                        margin="normal"
                        placeholder="Nhập URL"
                      />
                      {editedUrl && (
                        <IconButton onClick={() => setEditedUrl("")}>
                          {" "}
                          <CloseIcon />{" "}
                        </IconButton>
                      )}
                    </Box>
                    <Typography variant="subtitle2" sx={{ marginTop: "10px" }}>
                      Văn bản hiển thị (không bắt buộc)
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <TextField
                        fullWidth
                        value={editedDisplayText}
                        onChange={(e) => setEditedDisplayText(e.target.value)}
                        margin="normal"
                        placeholder="Nhập văn bản hiển thị"
                      />
                      {editedDisplayText && (
                        <IconButton onClick={() => setEditedDisplayText("")}>
                          {" "}
                          <CloseIcon />{" "}
                        </IconButton>
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: 2,
                      }}
                    >
                      <Button onClick={() => setPopoverAnchorEl(null)}>
                        Hủy
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => {
                          handleSave1();
                          setPopoverAnchorEl(null); // Đóng popover sau khi lưu
                        }}
                      >
                        Lưu
                      </Button>
                    </Box>
                  </Box>
                </Popover>

                {/* Tệp */}

                {attachments?.data?.some((file) =>
                  /\.(png|jpg|jpeg|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|sql)$/i.test(
                    file.path_url
                  )
                ) && (
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: "12px",
                          ml: "20px",
                          mt: "5px",
                          mb: "-15px",
                        }}
                      >
                        Tệp
                      </Typography>
                      <List>
                        {attachments.data
                          .filter((file) =>
                            /\.(png|jpg|jpeg|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|sql)$/i.test(
                              file.path_url
                            )
                          )
                          .map((file) => {
                            const fileExt =
                              file.path_url
                                .match(/\.([a-zA-Z0-9]+)$/i)?.[1]
                                .toLowerCase() || "default";
                            const isImage = [
                              "png",
                              "jpg",
                              "jpeg",
                              "gif",
                            ].includes(fileExt);
                            const fileIcons = {
                              png: "https://img.icons8.com/color/24/000000/image.png",
                              jpg: "https://img.icons8.com/color/24/000000/image.png",
                              jpeg: "https://img.icons8.com/color/24/000000/image.png",
                              gif: "https://img.icons8.com/color/24/000000/image.png",
                              pdf: "https://img.icons8.com/color/24/000000/pdf.png",
                              doc: "https://img.icons8.com/color/24/000000/microsoft-word-2019.png",
                              docx: "https://img.icons8.com/color/24/000000/microsoft-word-2019.png",
                              xls: "https://img.icons8.com/color/24/000000/microsoft-excel-2019.png",
                              xlsx: "https://img.icons8.com/color/24/000000/microsoft-excel-2019.png",
                              ppt: "https://img.icons8.com/color/24/000000/microsoft-powerpoint-2019.png",
                              pptx: "https://img.icons8.com/color/24/000000/microsoft-powerpoint-2019.png",
                              sql: "https://img.icons8.com/color/24/000000/sql.png",
                              default:
                                "https://img.icons8.com/color/24/000000/file.png",
                            };

                            const iconSrc =
                              fileIcons[fileExt] || fileIcons.default;

                            return (
                              <ListItem
                                key={file.id}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  paddingRight: "40px",
                                  mb: "-8px",
                                  ml: "10px",
                                  cursor: "pointer",
                                }}
                              >
                                {/* Hình ảnh hoặc icon */}
                                <Box
                                  component="img"
                                  src={isImage ? file.path_url : iconSrc}
                                  alt={
                                    isImage
                                      ? file.file_name_defaut
                                      : `${fileExt}-icon`
                                  }
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: "8px",
                                    objectFit: isImage ? "cover" : "contain",
                                  }}
                                  onClick={() => handleOpen(file.path_url)}
                                />

                                {/* Nội dung tên và thời gian */}
                                <Box sx={{ flexGrow: 1, ml: "10px" }}>
                                  <Typography
                                    sx={{ fontWeight: "bold", fontSize: "13px" }}
                                    onClick={() => handleOpen(file.path_url)}
                                  >
                                    {file.file_name_defaut || "Không có tên"}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{ fontSize: "13px" }}
                                  >
                                    Đã thêm{" "}
                                    {file.created_at
                                      ? new Date(file.created_at).toLocaleString(
                                        "vi-VN",
                                        {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "numeric",
                                        }
                                      )
                                      : "Không xác định"}
                                    {file.is_cover && (
                                      <Box component="span" sx={{ ml: 1 }}>
                                        <img
                                          src="https://img.icons8.com/material-outlined/24/000000/image.png"
                                          alt="cover-icon"
                                          style={{
                                            width: "16px",
                                            verticalAlign: "middle",
                                          }}
                                        />{" "}
                                        Ảnh bìa
                                      </Box>
                                    )}
                                  </Typography>
                                </Box>

                                {/* Menu tác vụ */}
                                <IconButton
                                  onClick={(e) => handleMenuOpen2(e, file.id)}
                                  sx={{ ml: "auto" }}
                                >
                                  <MoreVertIcon />
                                </IconButton>
                              </ListItem>
                            );
                          })}
                      </List>
                    </Box>
                  )}

                {/* Menu con */}
                <Menu
                  anchorEl={anchorEl2}
                  open={Boolean(anchorEl2)}
                  onClose={handleMenuClose2}
                >
                  <MenuItem onClick={handleOpenPopover}>Sửa</MenuItem>
                  <MenuItem onClick={() => handleDownloadFile(selectedFile)}>
                    Tải xuống
                  </MenuItem>
                  <MenuItem>Nhận xét</MenuItem>
                  <MenuItem
                    onClick={() => handleCoverImageChange(selectedFile)}
                  >
                    {attachments?.data?.find((file) => file.id === selectedFile)
                      ?.is_cover
                      ? "Gỡ ảnh bìa"
                      : "Tạo ảnh bìa"}
                  </MenuItem>
                  <MenuItem onClick={handleDeleteFile} sx={{ color: "red" }}>
                    Xóa
                  </MenuItem>
                </Menu>

                {/* Edit Popover */}
                <Popover
                  open={editAnchorEl}
                  anchorEl={editAnchorEl}
                  onClose={handleClosePopover}
                  anchorOrigin={{ vertical: "top", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                >
                  <Box sx={{ padding: "16px", minWidth: "200px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <IconButton onClick={handleClosePopover}>
                        <ArrowBackIcon />
                      </IconButton>
                      <Typography variant="h6" sx={{ fontSize: "14px", ml: 1 }}>
                        Sửa tệp đính kèm
                      </Typography>
                    </Box>

                    <TextField
                      fullWidth
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      placeholder="Nhập tên mới"
                    />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 1,
                      }}
                    >
                      <Button onClick={handleClosePopover}>Hủy</Button>
                      <Button
                        onClick={handleRename}
                        variant="contained"
                        sx={{ ml: 1 }}
                      >
                        Cập nhật
                      </Button>
                    </Box>
                  </Box>
                </Popover>
                <Dialog
                  open={open}
                  onClose={handleClose}
                  fullWidth
                  maxWidth="sm"
                  sx={{
                    "& .MuiDialog-paper": {
                      backgroundColor: "transparent", // Loại bỏ nền trắng của hộp thoại
                      boxShadow: "none", // Xóa viền hộp thoại
                      padding: 0,
                      overflow: "visible",
                    },
                    "& .MuiBackdrop-root": {
                      backgroundColor: "rgba(0, 0, 0, 0.5)", // Nền tối mờ nhẹ (có thể chỉnh mức độ mờ)
                    },
                  }}
                >
                  <IconButton
                    onClick={handleClose}
                    sx={{
                      position: "absolute",
                      top: -120,
                      right: -450,
                      color: "white",
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.4)",
                      },
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Dialog>
              </Box>

              {/* HIỂN THỊ DANH SÁCH VIỆC CẦN LÀM */}
              {checklists?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <List>
                    {checklists.map((checklist) => {
                      const taskItems = Array.isArray(checklist.items)
                        ? checklist.items
                        : [];
                      const completedItems = taskItems.filter(
                        (item) => item.is_completed
                      ).length;
                      const totalItems = taskItems.length;
                      const taskProgress =
                        totalItems > 0
                          ? (completedItems / totalItems) * 100
                          : 0;

                      return (
                        <Box
                          key={checklist.id}
                          sx={{ mb: 3, p: 2, marginLeft: "-12px" }}
                        >
                          {/* Hiển thị tên checklist */}

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                flexGrow: 1,
                              }}
                            >
                              <CheckBoxIcon
                                sx={{
                                  width: "30px",
                                  height: "30px",
                                  color: "gray",
                                  flexShrink: 0, // Giữ icon luôn cố định, không bị đẩy đi
                                }}
                              />
                              {editingTaskId === checklist.id ? (
                                <TextField
                                  fullWidth
                                  variant="outlined"
                                  size="small"
                                  value={editedTaskName}
                                  onChange={(e) =>
                                    setEditedTaskName(e.target.value)
                                  }
                                  onBlur={() => handleSaveTask(checklist.id)}
                                  onKeyDown={(e) =>
                                    handleKeyPressTask(e, checklist.id)
                                  }
                                  autoFocus
                                  sx={{
                                    flexGrow: 1, // Giúp input co giãn nhưng không đẩy icon đi
                                  }}
                                />
                              ) : (
                                <Typography
                                  variant="h6"
                                  fontWeight="bold"
                                  onClick={() =>
                                    handleEditTask(checklist.id, checklist.name)
                                  }
                                  sx={{ cursor: "pointer", flexGrow: 1 }}
                                >
                                  {checklist.name}
                                </Typography>
                              )}
                            </Box>

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
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: "#ddd", // Màu nền mặc định
                                "& .MuiLinearProgress-bar": {
                                  backgroundColor:
                                    taskProgress === 100
                                      ? "#4CAF50"
                                      : "#0079BF", // Xanh lá khi đạt 100%
                                },
                              }}
                            />
                          </Box>

                          {/* Danh sách mục trong checklist */}
                          <List sx={{ mt: 0 }}>
                            {taskItems.map((item) => (
                              <ChecklistItemRow
                                key={item.id}
                                item={item}
                                toggleItemCompletion={toggleItemCompletion}
                                handleEditItem={handleEditItem}
                                handleSaveItem={handleSaveItem}
                                handleKeyPressItem={handleKeyPressItem}
                                editingItemId={editingItemId}
                                editedItemName={editedItemName}
                                setEditedItemName={setEditedItemName}
                                handleMenuOpen={handleMenuOpen}
                                setMemberListConfig={setMemberListConfig}
                              />
                            ))}
                          </List>

                          <Menu
                            anchorEl={menuAnchor}
                            open={Boolean(menuAnchor)}
                            onClose={handleMenuClose}
                          >
                            <MenuItem
                              onClick={() =>
                                toggleItemCompletion(selectedItemId)
                              }
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
                                value={taskInputs[checklist.id] || ""}
                                onChange={(e) =>
                                  setTaskInputs({
                                    ...taskInputs,
                                    [checklist.id]: e.target.value,
                                  })
                                }
                              />
                              <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  onClick={() => {
                                    if (
                                      (
                                        taskInputs[checklist.id] || ""
                                      ).trim() === ""
                                    )
                                      return;
                                    handleAddItem(
                                      checklist.id,
                                      taskInputs[checklist.id]
                                    );
                                    setTaskInputs({
                                      ...taskInputs,
                                      [checklist.id]: "",
                                    });
                                    setAddingItemForTask(null);
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
                              sx={{ mt: 0, bgcolor: "teal" }}
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
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  <BarChartIcon sx={{ fontSize: "0.8rem", mr: 1 }} />
                  Hoạt động
                </Typography>
                <Button
                  variant="text"
                  sx={{ fontSize: "0.5rem", color: "#fff", bgcolor: "teal" }}
                  onClick={handleToggleDetail}
                >
                  {isDetailHidden ? "Hiện chi tiết" : "Ẩn chi tiết"}
                </Button>
              </Box>
              {!isEditingComment && (
                <Typography
                  variant="body1"
                  sx={{
                    mt: 1,
                    color: "#a4b0be",
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap", // Giữ định dạng dòng
                    cursor: "pointer",
                    fontSize: "0.6rem",
                    // "&:hover": { backgroundColor: "#F5F6F8", borderRadius: 4 }
                  }}
                  onClick={handleCommentClick}
                >
                  Viết bình luận...
                </Typography>
              )}
              {isEditingComment && (
                <>
                  <ReactQuill
                    value={comment}
                    onChange={setComment}
                    placeholder="Write a comment..."
                    style={{ marginTop: "8px" }}
                    theme="snow"
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, false] }],
                        ["bold", "italic", "underline", "strike"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link"],
                        ["image"],
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
                      "image",
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
                      onClick={handleSaveComment}
                      disabled={isEmptyHTML(comment)}
                    >
                      Lưu
                    </Button>
                  </Box>
                </>
              )}
              <>
                {sortedData.map((item, index) => {
                  if (item.type === "comment") {
                    const content = item.content || "";
                    if (isEmptyHTML(content)) return null;

                    return (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          mt: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            src={item?.user?.avatar || ""}
                            sx={{
                              bgcolor: !item?.user?.avatar
                                ? "pink"
                                : "transparent",
                              color: !item?.user?.avatar ? "white" : "inherit",
                              width: 28,
                              height: 28,
                              fontSize: "0.6rem",
                              mt: 2, // Move the avatar down
                            }}
                          >
                            {!item?.user?.avatar &&
                              (item?.user?.full_name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "?")}
                          </Avatar>
                          <Box sx={{ ml: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold", fontSize: "14px" }}
                            >
                              {item.user?.full_name || "Người dùng"}{" "}
                              <span style={{ fontWeight: "normal" }}>
                                {item.user?.username}
                              </span>
                              <Typography
                                variant="body2"
                                component="span"
                                sx={{
                                  fontSize: "0.5rem",
                                  color: "gray",
                                  ml: 0.5,
                                  padding: "3px 0px",
                                }}
                              >
                                {formatTime(item.created_at)}
                              </Typography>
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            ml: 4.5,
                            mt: -1,
                            backgroundColor: "#f5f6fa",
                            p: 0.7,
                            borderRadius: "8px",
                          }}
                        >
                          {editingCommentIndex === item.id ? (
                            <>
                              <ReactQuill
                                value={editingCommentText}
                                onChange={setEditingCommentText}
                                placeholder="Edit your comment..."
                                style={{ marginTop: "8px" }}
                                theme="snow"
                                modules={{
                                  toolbar: [
                                    [{ header: [1, 2, false] }],
                                    ["bold", "italic", "underline", "strike"],
                                    [{ list: "ordered" }, { list: "bullet" }],
                                    ["link"],
                                    ["image"],
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
                                  "image",
                                ]}
                                sx={{
                                  "& .ql-container": {
                                    border: "1px solid #ddd",
                                    borderRadius: 4,
                                  },
                                  "& .ql-toolbar": {
                                    border: "1px solid #ddd",
                                  },
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
                                    fontSize: "0.6rem",
                                    height: "25px",
                                    minWidth: "50px",
                                  }}
                                  onClick={handleSaveEditedComment}
                                  disabled={isEmptyHTML(editingCommentText)}
                                >
                                  Lưu
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  sx={{
                                    color: "#172B4D",
                                    borderColor: "#ddd",
                                    fontSize: "0.6rem",
                                    height: "25px",
                                    minWidth: "50px",
                                    "&:hover": {
                                      backgroundColor: "#E4E7EB",
                                      borderColor: "#bbb",
                                    },
                                  }}
                                  onClick={() => {
                                    setEditingCommentIndex(null); // Thoát chế độ chỉnh sửa
                                    setEditingCommentText(""); // Reset nội dung chỉnh sửa
                                  }}
                                >
                                  Hủy
                                </Button>
                              </Box>
                            </>
                          ) : (
                            <>
                              <Typography
                                variant="body2"
                                style={{
                                  wordWrap: "break-word",
                                  whiteSpace: "pre-wrap",
                                  overflowWrap: "break-word",
                                  wordBreak: "break-word",
                                  fontSize: "0.rem", // Change font size to 0.7rem
                                }}
                              >
                                {content.replace(/<\/?p>/g, "")}
                              </Typography>
                              <Box sx={{ display: "flex", mt: "-4px" }}>
                                <Button
                                  size="small"
                                  onClick={() =>
                                    handleEditComment(item.id, item.content)
                                  }
                                  sx={{
                                    width: "20px",
                                    minWidth: "20px",
                                    ml: "4px",
                                    mr: "-8px",
                                    fontSize: "0.4rem", // Smaller font size
                                    textTransform: "none",
                                    padding: "2px 4px", // Smaller padding
                                  }}
                                >
                                  Sửa
                                </Button>
                                <Button
                                  size="small"
                                  onClick={() => handleDeleteComment(item.id)}
                                  sx={{
                                    width: "20px",
                                    minWidth: "20px",
                                    ml: "10px",
                                    fontSize: "0.4rem", // Smaller font size
                                    textTransform: "none",
                                    padding: "2px 4px", // Smaller padding
                                  }}
                                >
                                  Xóa
                                </Button>
                              </Box>
                            </>
                          )}
                        </Box>
                      </Box>
                    );
                  } else if (item.type === "activity" && !isDetailHidden) {
                    const description = item.description;
                    const keyword = "đã";
                    const keywordIndex = description.indexOf(keyword);

                    if (keywordIndex === -1) return null;

                    const userName = description
                      .substring(0, keywordIndex)
                      .trim();
                    const actionText = description
                      .substring(keywordIndex)
                      .trim();

                    const affectedUser = item.properties?.full_name; // Người bị ảnh hưởng (lấy từ properties)

                    // Hàm để chuyển đổi description thành JSX với link
                    const renderDescriptionWithLink = (
                      description,
                      filePath,
                      fileName
                    ) => {
                      const fileIndex = description.indexOf(fileName);
                      if (fileIndex === -1) return description; // Nếu không tìm thấy, trả về description gốc

                      const beforeFile = description.slice(0, fileIndex);
                      const afterFile = description.slice(
                        fileIndex + fileName.length
                      );

                      // Kiểm tra xem file có phải là ảnh không
                      const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(
                        fileName
                      );

                      return (
                        <>
                          {beforeFile}
                          <span
                            style={{
                              color: "blue",
                              textDecoration: "none", // Mặc định không gạch chân
                              cursor: "pointer",
                              ":hover": {
                                textDecoration: "underline", // Gạch chân khi hover
                              },
                            }}
                            onClick={() => {
                              if (isImage) {
                                handleOpen(filePath); // Mở modal nếu là ảnh
                              } else {
                                window.open(filePath, "_blank"); // Tải file nếu không phải ảnh
                              }
                            }}
                          >
                            {fileName}
                          </span>
                          {afterFile}
                        </>
                      );
                    };

                    return (
                      <Box
                        key={index}
                        display="flex"
                        alignItems="flex-start"
                        mb={1}
                        mt={2}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "pink",
                            width: 28,
                            height: 28,
                            mt: 2,
                            fontSize: "0.6rem",
                            mr: 1.2,
                          }}
                        >
                          {userName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography>
                            <Typography component="span" fontWeight={"bold"}>
                              {userName}
                            </Typography>{" "}
                            {affectedUser ? (
                              // Nếu có affectedUser, in đậm tên đó trong actionText
                              actionText
                                .split(affectedUser)
                                .map((part, i, arr) => (
                                  <React.Fragment key={i}>
                                    {part}
                                    {i < arr.length - 1 && (
                                      <Typography
                                        component="span"
                                        fontWeight="bold"
                                      >
                                        {affectedUser}
                                      </Typography>
                                    )}
                                  </React.Fragment>
                                ))
                            ) : (
                              <Typography component="span" fontWeight="normal">
                                {item.properties &&
                                  item.properties.file_path &&
                                  item.properties.file_name
                                  ? renderDescriptionWithLink(
                                    actionText,
                                    item.properties.file_path,
                                    item.properties.file_name
                                  )
                                  : actionText}
                              </Typography>
                            )}
                          </Typography>
                          <Typography fontSize="0.5rem" color="gray">
                            {formatTime(item.created_at)}
                          </Typography>

                          {/* Hiển thị ảnh nếu file là ảnh */}
                          {item.properties &&
                            item.properties.file_path &&
                            /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(
                              item.properties.file_name
                            ) && (
                              <Box mt={1}>
                                <img
                                  src={item.properties.file_path}
                                  alt="Attachment"
                                  style={{
                                    maxWidth: "100%",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    handleOpen(item.properties.file_path)
                                  }
                                />
                              </Box>
                            )}
                        </Box>

                        {/* Modal để hiển thị ảnh lớn */}
                        <Modal open={open} onClose={handleClose}>
                          <Box
                            sx={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              bgcolor: "background.paper",
                              boxShadow: 24,
                              p: 2,
                              outline: "none",
                            }}
                          >
                            <img
                              src={selectedImage}
                              alt="Selected Attachment"
                              style={{
                                maxWidth: "90vw",
                                maxHeight: "90vh",
                                borderRadius: "8px",
                              }}
                            />
                          </Box>
                        </Modal>
                      </Box>
                    );
                  }

                  return null;
                })}
              </>
            </Grid>

            {/* Cột phải (Sidebar) */}
            <Grid item xs={4}>
              <Box sx={{ borderLeft: "1px solid #ddd", pl: 2 }}>
                <List>
                  <ListItem disablePadding>
                    <ListItemButton onClick={handleJoinCard}>
                      <ListItemIcon>
                        <PersonAddAlt1Icon
                          sx={{ color: "black", fontSize: "0.8rem" }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={isMember ? "Rời khỏi" : "Tham gia"}
                      />
                    </ListItemButton>
                  </ListItem>

                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() =>
                        setMemberListConfig({
                          open: true,
                          type: "card",
                          targetId: cardId,
                        })
                      }
                    >
                      <ListItemIcon>
                        <GroupIcon
                          sx={{ color: "black", fontSize: "0.8rem" }}
                        />
                      </ListItemIcon>
                      <ListItemText primary="Thành viên" />
                    </ListItemButton>
                  </ListItem>

                  <ListItem disablePadding>
                    <ListItemButton onClick={() => setIsLabelListOpen(true)}>
                      <ListItemIcon>
                        <LabelIcon
                          sx={{ color: "black", fontSize: "0.8rem" }}
                        />
                      </ListItemIcon>
                      <ListItemText primary="Nhãn" />
                    </ListItemButton>
                  </ListItem>

                  <ListItem disablePadding>
                    <ListItemButton>
                      <ListItemIcon>
                        <ChecklistIcon
                          sx={{ color: "black", fontSize: "0.8rem" }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary="Việc cần làm"
                        onClick={() => setIsTaskModalOpen(true)}
                      />
                    </ListItemButton>
                  </ListItem>

                  <ListItem disablePadding>
                    <ListItemButton>
                      <ListItemIcon>
                        <EventIcon
                          sx={{ color: "black", fontSize: "0.8rem" }}
                        />
                      </ListItemIcon>
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
                      <ListItemIcon>
                        <AttachFileIcon
                          sx={{ color: "black", fontSize: "0.8rem" }}
                        />
                      </ListItemIcon>
                      <ListItemText primary="Đính kèm" />
                    </ListItemButton>
                  </ListItem>

                  <ListItem disablePadding>
                    <ListItemButton onClick={() => setIsCoverPhotoOpen(true)}>
                      <ListItemIcon>
                        <CollectionsIcon
                          sx={{ color: "black", fontSize: "0.8rem" }}
                        />
                      </ListItemIcon>
                      <ListItemText primary="Ảnh bìa" />
                    </ListItemButton>
                  </ListItem>
                </List>

                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle1" fontWeight="bold">
                  Thao tác
                </Typography>
                <List>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => setIsMoveCardModalOpen(true)}
                    >
                      <ListItemIcon>
                        <MoveUpIcon
                          sx={{ color: "black", fontSize: "0.8rem" }}
                        />
                      </ListItemIcon>
                      <ListItemText primary="Di chuyển" />
                    </ListItemButton>
                  </ListItem>

                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => setIsCopyCardModalOpen(true)}
                    >
                      <ListItemIcon>
                        <FileCopyIcon
                          sx={{ color: "black", fontSize: "0.8rem" }}
                        />
                      </ListItemIcon>
                      <ListItemText primary="Sao chép" />
                    </ListItemButton>
                  </ListItem>

                  <ListItem disablePadding>
                    <ListItemButton>
                      <ListItemIcon>
                        <SpeakerGroupIcon
                          sx={{ color: "black", fontSize: "0.8rem" }}
                        />
                      </ListItemIcon>
                      <ListItemText primary="Tạo mẫu" />
                    </ListItemButton>
                  </ListItem>

                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleArchiveCard(cardId)}>
                      <ListItemIcon>
                        <ArchiveIcon
                          sx={{ color: "black", fontSize: "0.8rem" }}
                        />
                      </ListItemIcon>
                      <ListItemText primary="Lưu trữ" />
                    </ListItemButton>
                  </ListItem>

                  <ListItem disablePadding>
                    <ListItemButton onClick={() => setIsShareModalOpen(true)}>
                      <ListItemIcon>
                        <ShareIcon
                          sx={{ color: "black", fontSize: "0.8rem" }}
                        />
                      </ListItemIcon>
                      <ListItemText primary="Chia sẻ" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        {/* Component Member List */}
        <MemberList
          open={memberListConfig.open}
          onClose={() =>
            setMemberListConfig({ open: false, type: null, targetId: null })
          }
          type={memberListConfig.type}
          targetId={memberListConfig.targetId}
          // members={boardMembers}
          onSelectMember={(type, targetId, userId) => {
            if (type === "card") {
              toggleMember(userId);
            } else if (type === "checklist-item") {
              toggleCheckListItemMember({ itemId: targetId, userId });
            }
          }}
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
          onAddAttachment={handleAddAttachment}
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

        <CoverPhoto
          open={isCoverPhotoOpen}
          handleClose={() => setIsCoverPhotoOpen(false)}
          onCoverImageChange={handleCoverImageChange} // Pass the handler to CoverPhoto
        // onCoverColorChange={handleCoverColorChange} // Pass the handler to CoverPhoto
        />

        <DateModal
          open={isDateModalOpen}
          onClose={() => setIsDateModalOpen(false)}
          onSave={handleSaveDate}
          initialData={dateInfo}
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
      </Box>{" "}
      {/* Move the Box here to wrap the entire content */}
    </Dialog>
  );
};

export default CardModal;

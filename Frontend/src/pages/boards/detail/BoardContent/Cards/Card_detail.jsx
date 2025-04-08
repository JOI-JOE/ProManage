import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Typography,
    Box,
    Checkbox,
    Chip,
    IconButton,
    Button,
    Avatar,
    List,
    LinearProgress,
    ListItem,
} from "@mui/material";
import { useParams } from "react-router-dom";
import "react-lazy-load-image-component/src/effects/blur.css";
import CustomButton from "../../../../../components/Common/CustomButton.jsx";
import { LazyLoadImage } from "react-lazy-load-image-component";
import GroupIcon from "@mui/icons-material/Group";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { PlusIcon } from "@heroicons/react/24/solid";
import { KeyboardArrowDown } from "@mui/icons-material";
import CommentEditor from "./ChildComponent/EditorForm.jsx";
import ChecklistGroup from "./ChildComponent/Checklist/ChecklistGroup.jsx";
import LinkItem from "./ChildComponent/Attachment/LinkItem.jsx";
import FileItem from "./ChildComponent/Attachment/FileItem.jsx";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import LabelDialog from "./ChildComponent/Label/LabelDialog.jsx";
import MemberMenu from "./ChildComponent/Members/MemberMenu.jsx";

dayjs.extend(relativeTime);

const Card_detail = ({ cardId, closeCard, openCard }) => {

    const [open, setOpen] = useState(true);
    const [check, setCheck] = useState(false);

    // Comment/Description State
    const [descriptionText, setDescriptionText] = useState("");            // Nội dung mô tả đang chỉnh sửa
    const [isEditingDescription, setIsEditingDescription] = useState(false); // Đang ở chế độ chỉnh sửa?
    const [isSubmittingDescription, setIsSubmittingDescription] = useState(false); // Đang submit?
    const [savedDescription, setSavedDescription] = useState("");          // Mô tả đã lưu

    // Hàm kiểm tra HTML trống
    const isEmptyHTML = (html) => {
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.innerText.trim() === "";
    };

    // Lưu mô tả sau khi chỉnh sửa
    const handleSaveDescription = async () => {
        if (isEmptyHTML(descriptionText)) return;

        setIsSubmittingDescription(true);
        try {
            // Gọi API hoặc cập nhật mô tả ở đây nếu cần
            // await updateDescription(descriptionText);
            console.log(descriptionText)
            setSavedDescription(descriptionText);
            setIsEditingDescription(false);
        } catch (error) {
            console.error("Lỗi khi lưu mô tả:", error);
        } finally {
            setIsSubmittingDescription(false);
        }
    };

    // Huỷ chỉnh sửa mô tả
    const handleCancelDescriptionEdit = () => {
        setDescriptionText(savedDescription); // Quay lại mô tả cũ
        setIsEditingDescription(false);
    };

    // Mở chế độ chỉnh sửa mô tả
    const handleEditDescription = () => {
        setDescriptionText(savedDescription); // Load mô tả hiện tại vào editor
        setIsEditingDescription(true);
    };

    // ----------------------------------------------------------------------------
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);     // danh sách các comment đã lưu
    const [isEditingComment, setIsEditingComment] = useState(false);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const handleCommentClick = () => {
        setIsEditingComment(true);
    };

    const handleSaveComment = async () => {
        if (isEmptyHTML(comment)) return;

        setIsSubmittingComment(true);
        try {
            // Có thể gọi API lưu comment ở đây
            const newComment = {
                id: Date.now(), // hoặc dùng uuid
                content: comment,
                created_at: new Date().toISOString(),
                author: {
                    name: "Hoàng", // Có thể lấy từ user đang đăng nhập
                    avatar: "",    // URL nếu có
                },
            };

            setComments((prev) => [newComment, ...prev]); // Thêm comment mới lên đầu
            setComment("");
            setIsEditingComment(false);
        } catch (error) {
            console.error("Lỗi khi lưu bình luận:", error);
        } finally {
            setIsSubmittingComment(false);
        }
    };
    // ----------------------------------------------------------------------------

    const checklistItems = [
        { id: 1, label: "ákjklfsaj", checked: false },
        { id: 2, label: "Islakjf", checked: false },
    ];

    const actions = [
        { label: "Thành viên", icon: <GroupIcon fontSize="small" /> },
        { label: "Nhãn", icon: <LocalOfferIcon fontSize="small" /> },
        { label: "Việc cần làm", icon: <CheckBoxIcon fontSize="small" /> },
        { label: "Ngày", icon: <ScheduleIcon fontSize="small" /> },
        { label: "Đính kèm", icon: <AttachFileIcon fontSize="small" /> },
    ];

    const [showAllLinks, setShowAllLinks] = useState(false);
    const [showAllFiles, setShowAllFiles] = useState(false);
    const [linkItems, setLinkItems] = useState([
        {
            id: "1",
            path_url: "https://www.google.com",
            file_name_defaut: "Google Search",
            created_at: "2025-04-08T10:00:00Z",
        },
        {
            id: "2",
            path_url: "https://www.youtube.com",
            file_name_defaut: "YouTube",
            created_at: "2025-04-07T18:30:00Z",
        },
        {
            id: "3",
            path_url: "https://www.facebook.com",
            file_name_defaut: "Facebook",
            created_at: "2025-04-08T09:15:00Z",
        },
        {
            id: "4",
            path_url: "https://www.twitter.com",
            file_name_defaut: "Twitter",
            created_at: "2025-04-06T22:00:00Z",
        },
        {
            id: "5",
            path_url: "https://www.linkedin.com",
            file_name_defaut: "LinkedIn",
            created_at: "2025-04-05T14:45:00Z",
        },
        {
            id: "6",
            path_url: "https://www.instagram.com",
            file_name_defaut: "Instagram",
            created_at: "2025-04-08T08:00:00Z",
        },
    ]);

    const mockFiles = [
        {
            id: 2,
            path_url: "https://example.com/files/project-proposal.pdf",
            file_name_defaut: "Proposal Dự Án.pdf",
            created_at: "2025-03-28T15:45:00",
            is_cover: false,
        },
        {
            id: 3,
            path_url: "https://example.com/files/plan.docx",
            file_name_defaut: "Kế Hoạch.docx",
            created_at: "2025-03-30T11:00:00",
            is_cover: false,
        },
        {
            id: 4,
            path_url: "https://example.com/files/data-report.xlsx",
            file_name_defaut: "Báo cáo dữ liệu.xlsx",
            created_at: "2025-03-29T08:15:00",
            is_cover: false,
        },
        {
            id: 5,
            path_url: "https://example.com/files/assets.zip",
            file_name_defaut: "Tài nguyên.zip",
            created_at: "2025-03-27T10:20:00",
            is_cover: false,
        },
        {
            id: 6,
            path_url: "http://localhost:8000/storage/attachments/1742046705_3aa994dc53c056c6f419.png",
            file_name_defaut: "Ảnh minh họa 2",
            created_at: "2025-03-25T14:00:00",
            is_cover: true,
        },
    ];

    const [selectedImage, setSelectedImage] = useState(null);
    const [preview, setPreview] = useState(false);

    const handleOpen = (url) => {
        const ext = url.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase();
        const imageTypes = ["jpg", "jpeg", "png", "webp", "gif"];
        if (imageTypes.includes(ext)) {
            setSelectedImage(url);
            setPreview(true);
        }
    };

    const handleClose = () => {
        setPreview(false);
        setSelectedImage(null);
    };



    const [openLabelDialog, setOpenLabelDialog] = useState(false);
    const [selectedLabels, setSelectedLabels] = useState([]);

    const handleOpenLabelDialog = () => setOpenLabelDialog(true);
    const handleCloseLabelDialog = () => setOpenLabelDialog(false);

    const handleLabelsChange = (labels) => {
        setSelectedLabels(labels); // Cập nhật danh sách nhãn từ Dialog
    };


    const [anchorEl, setAnchorEl] = useState(null);
    const openMemberMenu = Boolean(anchorEl);

    // Dữ liệu thành viên của thẻ (có thể thêm / xóa)
    const [cardMembersData, setCardMembersData] = useState([
        { id: 1, name: 'haungodang2003', initials: 'H' },
        { id: 2, name: 'user1', initials: 'U1' },
    ]);

    // Thành viên của bảng (chỉ dùng để chọn thêm)
    const boardMembersData = [
        { id: 3, name: 'Ngô Hậu', initials: 'NH' },
        { id: 4, name: 'user2', initials: 'U2' },
    ];

    const handleOpenMemberMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMemberMenu = () => {
        setAnchorEl(null);
    };

    const handleRemoveMemberFromCard = (memberId) => {
        setCardMembersData((prev) => prev.filter((m) => m.id !== memberId));
    };

    const handleUserSelected = (member) => {
        const isAlreadyAdded = cardMembersData.some((m) => m.id === member.id);
        if (!isAlreadyAdded) {
            setCardMembersData((prev) => [...prev, member]);
        }
    };


    return (
        <>
            <Dialog
                open={openCard}
                onClose={closeCard}
                fullWidth
                maxWidth="md"
                disableEnforceFocus={false} // vẫn giữ focus bên trong dialog
                disableEscapeKeyDown={false}
                hideBackdrop={false}
                BackdropProps={{
                    sx: {
                        backgroundColor: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(3px)",
                        mt: "10px",
                    },
                }}
                sx={{
                    "& .MuiDialog-container": {
                        alignItems: "flex-start",
                        justifyContent: "center",
                    },
                    "& .MuiPaper-root": {
                        width: "100%",
                        maxHeight: "100vh - 5px",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: "12px",
                    },
                }}
            >
                <CustomButton
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                    }}
                    type="close"
                    onClick={closeCard}
                />

                <DialogContent
                    sx={{
                        flex: 1,
                        padding: "0px",
                        display: "flex",
                        flexDirection: "column",
                        overflowY: "auto",

                        "&::-webkit-scrollbar": {
                            width: "6px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "#888",
                            borderRadius: "10px",
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                            backgroundColor: "#555",
                        },
                        "&::-webkit-scrollbar-track": {
                            backgroundColor: "#f1f1f1",
                        },
                    }}
                >
                    <Box
                        title="ảnh nền cho card"
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            height: "200px",
                            overflow: "hidden",
                            backgroundColor: "orange",
                            borderRadius: "8px 8px 0 0",
                        }}
                    >
                        <LazyLoadImage
                            src={"https://i.pinimg.com/736x/e3/a9/65/e3a9657ada1a40d273e9ded3d111a7bd.jpg"}
                            alt="Card Cover"
                            effect="blur"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    </Box>
                    <Box sx={{ padding: "16px" }}>
                        {/* Header */}
                        <DialogTitle sx={{ paddingLeft: "40px" }}>
                            <Box sx={{ display: "flex", marginBottom: "20px" }}>
                                <Box>
                                    <Typography variant="h1">hau</Typography>
                                    <Typography variant="body1" sx={{ color: "#757575" }}>
                                        trong danh sách{" "}
                                        <Box
                                            component="span"
                                            sx={{
                                                py: 0.5,
                                                px: 1,
                                                fontWeight: "bold",
                                                borderRadius: "3px",
                                                background: "#e0e0e0",
                                                fontSize: "0.875rem",
                                            }}
                                        >
                                            Cần làm
                                        </Box>
                                    </Typography>
                                </Box>
                            </Box>
                        </DialogTitle>
                        {/* End Header */}

                        {/* Main */}
                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                alignItems: "flex-start",
                            }}
                        >
                            {/* Label, theo dõi */}
                            <Box
                                sx={{
                                    flex: "1 1 auto",
                                    paddingLeft: "40px",
                                    display: "flex",
                                    columnGap: 3,
                                    rowGap: 2,
                                    overflow: "auto",
                                    flexWrap: "wrap",
                                    alignItems: "flex-start",
                                }}
                            >
                                {/* Thành viên */}
                                <Box>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: "#5e6c84", fontWeight: 500, marginBottom: "4px" }}
                                    >
                                        Thành viên
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                        }}
                                    >
                                        {/* <Avatar
                                            sx={{
                                                bgcolor: "#37474f",
                                                color: "white",
                                                fontSize: "14px",
                                                width: "32px",
                                                height: "32px",
                                            }}
                                        >
                                            H
                                        </Avatar> */}
                                        {cardMembersData.map((member) => (
                                            <Avatar
                                                key={member.id}
                                                sx={{
                                                    bgcolor: "#37474f",
                                                    color: "white",
                                                    fontSize: "14px",
                                                    width: "32px",
                                                    height: "32px",
                                                }}
                                            >
                                                {member.initials}
                                            </Avatar>
                                        ))}
                                        <IconButton
                                            sx={{
                                                backgroundColor: "#e0e0e0",
                                                width: "32px",
                                                height: "32px",
                                                borderRadius: "50%",
                                            }}
                                            onClick={handleOpenMemberMenu}
                                        >
                                            <PlusIcon sx={{ fontSize: "20px", color: "#555", position: "relative" }} />
                                        </IconButton>
                                        <MemberMenu
                                            open={openMemberMenu}
                                            onClose={handleCloseMemberMenu}
                                            cardMembers={cardMembersData}
                                            boardMembers={boardMembersData}
                                            onRemoveCardMember={handleRemoveMemberFromCard}
                                            anchorEl={anchorEl}
                                            setAnchorEl={setAnchorEl}
                                            onMemberSelect={handleUserSelected} // Truyền hàm callback xuống
                                        />
                                    </Box>

                                </Box>

                                {/* Nhãn */}
                                <Box>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: "#5e6c84", fontWeight: 500, marginBottom: "4px" }}
                                    >
                                        Nhãn
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            flexWrap: "wrap",
                                            gap: "6px",
                                        }}
                                    >
                                        {selectedLabels.map((label) => (
                                            <Chip
                                                key={label.id}
                                                label={label.name}
                                                sx={{
                                                    backgroundColor: label.color,
                                                    height: "32px",
                                                    borderRadius: "4px",
                                                    color: "white",
                                                    fontWeight: 500,
                                                }}
                                            />
                                        ))}

                                        <IconButton
                                            sx={{
                                                backgroundColor: "#e0e0e0",
                                                width: "32px",
                                                height: "32px",
                                                borderRadius: "4px",
                                                "&:hover": {
                                                    backgroundColor: "#ccc",
                                                },
                                            }}
                                            onClick={handleOpenLabelDialog}
                                        >
                                            <PlusIcon sx={{ fontSize: "16px", color: "#555" }} />
                                        </IconButton>
                                    </Box>

                                    <LabelDialog
                                        open={openLabelDialog}
                                        onClose={handleCloseLabelDialog}
                                        onLabelsChange={handleLabelsChange}
                                        initialLabels={selectedLabels}
                                    />
                                </Box>

                                {/* Ngày */}
                                <Box sx={{ minWidth: "200px" }}>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: "#5e6c84", fontWeight: 500, marginBottom: "3px" }}
                                    >
                                        Ngày
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            px: 1.5,
                                            py: 1,
                                            borderRadius: 1,
                                            backgroundColor: "#e4e6ea",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <Typography
                                            variant="body1"
                                            sx={{ fontWeight: 500, color: "#172b4d", fontSize: "14px" }}
                                        >
                                            8 thg 4 – 21:35 9 thg 4
                                        </Typography>
                                        <KeyboardArrowDown sx={{ fontSize: 20, color: "#172b4d", ml: 0.5 }} />
                                    </Box>
                                </Box>

                                {/* Mô tả */}
                                <Box sx={{ width: "100%" }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            py: "5px",
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "#5e6c84", fontWeight: 500, marginBottom: "3px" }}
                                        >
                                            Mô tả
                                        </Typography>
                                        {!isEditingDescription && (
                                            <Button onClick={handleEditDescription}>Chỉnh sửa</Button>
                                        )}
                                    </Box>

                                    {isEditingDescription ? (
                                        <CommentEditor
                                            value={descriptionText}
                                            onChange={setDescriptionText}
                                            onSave={handleSaveDescription}
                                            onCancel={handleCancelDescriptionEdit}
                                            isSaveDisabled={isEmptyHTML(descriptionText)}
                                            isLoading={isSubmittingDescription}
                                            editorHeight="120px"
                                            minHeight="80px"
                                        />
                                    ) : savedDescription ? (
                                        <Box
                                            sx={{
                                                borderRadius: "4px",
                                                backgroundColor: "#fff",
                                                padding: "6px 12px",
                                                cursor: "pointer",
                                            }}
                                            dangerouslySetInnerHTML={{ __html: savedDescription }}
                                            onClick={handleEditDescription}
                                        />
                                    ) : (
                                        <Box
                                            sx={{
                                                border: "1px solid #d1d1d1",
                                                borderRadius: "4px",
                                                height: "60px",
                                                padding: "6px 12px",
                                                backgroundColor: "#e4e6ea",
                                                color: "#172b4d",
                                                cursor: "pointer",
                                                fontSize: "14px",
                                            }}
                                            onClick={handleEditDescription}
                                        >
                                            Thêm mô tả chi tiết hơn...
                                        </Box>
                                    )}
                                </Box>


                                {/* Tệp đính kèm */}
                                <Box sx={{ width: "100%", mb: "16px" }}>
                                    {/* Header */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            mb: 1,
                                        }}
                                    >
                                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}>
                                            <AttachFileIcon sx={{ fontSize: "20px", mr: 1 }} />
                                            Các tập tin đính kèm
                                        </Typography>

                                        <Button
                                            variant="contained"
                                            size="small"
                                            sx={{
                                                textTransform: "none",
                                                fontSize: "14px",
                                                borderRadius: "6px",
                                                backgroundColor: "#e4e6ea",
                                                color: "#172b4d",
                                                "&:hover": {
                                                    backgroundColor: "#d6d8da",
                                                },
                                            }}
                                        >
                                            Thêm
                                        </Button>
                                    </Box>

                                    {/* Danh sách liên kết */}
                                    <Box>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                fontWeight: "bold",
                                                fontSize: "14px",
                                                color: "#172b4d",
                                                mb: "6px",
                                            }}
                                        >
                                            Liên kết
                                        </Typography>
                                        <List sx={{ padding: 0 }}>
                                            {(showAllLinks ? linkItems : linkItems.slice(0, 4)).map((file) => (
                                                <LinkItem key={file.id} file={file} />
                                            ))}
                                        </List>
                                        {linkItems.length > 4 && (
                                            <Button
                                                onClick={() => setShowAllLinks(!showAllLinks)}
                                                size="small"
                                                sx={{
                                                    mt: 1,
                                                    fontSize: "12px",
                                                    color: "#5e6c84",
                                                    textTransform: "none",
                                                    paddingLeft: "8px",
                                                    justifyContent: "flex-start",
                                                }}
                                            >
                                                {showAllLinks
                                                    ? "Ẩn bớt"
                                                    : `Hiện tất cả ${linkItems.length} tập tin đính kèm`}
                                            </Button>
                                        )}
                                    </Box>

                                    {/* Danh sách tệp */}
                                    <Box>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                fontWeight: "bold",
                                                fontSize: "14px",
                                                color: "#172b4d",
                                            }}
                                        >
                                            Tệp
                                        </Typography>
                                        <List sx={{ padding: 0 }}>
                                            {(showAllFiles ? mockFiles : mockFiles.slice(0, 3)).map((file) => (
                                                <FileItem
                                                    key={file.id}
                                                    file={file}
                                                    handleOpen={handleOpen}
                                                />
                                            ))}
                                        </List>
                                        {mockFiles.length > 4 && (
                                            <Button
                                                onClick={() => setShowAllFiles(!showAllFiles)}
                                                size="small"
                                                sx={{
                                                    // mt: 1,
                                                    fontSize: "12px",
                                                    color: "#5e6c84",
                                                    textTransform: "none",
                                                    paddingLeft: "8px",
                                                    justifyContent: "flex-start",
                                                }}
                                            >
                                                {showAllFiles
                                                    ? "Ẩn bớt"
                                                    : `Hiện tất cả ${mockFiles.length} tệp`}
                                            </Button>
                                        )}
                                    </Box>
                                </Box>

                                {/* Checklist */}
                                <Box sx={{ width: "100%" }}>
                                    <ChecklistGroup />
                                </Box>

                                {/* Activity */}
                                {/* <ActivityFeed /> */}
                                <Box sx={{ width: "100%" }}>
                                    <Box sx={{ width: "100%", mt: 2 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "#5e6c84", fontWeight: 500, marginBottom: "6px" }}
                                        >
                                            Bình luận
                                        </Typography>

                                        {/* Phần viết bình luận */}
                                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 2 }}>
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    bgcolor: 'grey.300',
                                                    fontSize: '0.8rem',
                                                    color: 'grey.700',
                                                    mt: '4px',
                                                }}
                                            >
                                                H
                                            </Avatar>

                                            <Box sx={{ flex: 1 }}>
                                                {!isEditingComment ? (
                                                    <Box
                                                        sx={{
                                                            border: '1px dashed #b0bec5',
                                                            padding: '8px 12px',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            color: '#607d8b',
                                                            fontSize: '0.9rem',
                                                            transition: 'border-color 0.3s ease',
                                                            '&:hover': {
                                                                borderColor: 'teal',
                                                                backgroundColor: 'grey.50',
                                                            },
                                                            '&:focus-within': {
                                                                borderColor: 'primary.main',
                                                                outline: 'none',
                                                            },
                                                        }}
                                                        onClick={handleCommentClick}
                                                    >
                                                        <Typography variant="body1" sx={{ color: '#607d8b' }}>
                                                            Viết bình luận...
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <CommentEditor
                                                        value={comment}
                                                        onChange={setComment}
                                                        onSave={handleSaveComment}
                                                        onCancel={() => {
                                                            setIsEditingComment(false);
                                                            setComment("");
                                                        }}
                                                        isSaveDisabled={isEmptyHTML(comment)}
                                                        isLoading={isSubmittingComment}
                                                        editorHeight="100px"
                                                        minHeight="60px"
                                                    />
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Danh sách comment đã gửi */}
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                            {comments?.map((cmt) => (
                                                <Box
                                                    key={cmt.id}
                                                    sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
                                                >
                                                    {/* Avatar bên trái */}
                                                    <Avatar
                                                        sx={{
                                                            width: 32,
                                                            height: 32,
                                                            bgcolor: 'grey.300',
                                                            fontSize: '0.8rem',
                                                            color: 'grey.700',
                                                        }}
                                                    >
                                                        {cmt.author.name?.charAt(0)}
                                                    </Avatar>

                                                    {/* Nội dung comment */}
                                                    <Box sx={{ flex: 1 }}>
                                                        <Box
                                                            sx={{
                                                                // backgroundColor: '#f4f5f7',
                                                                // padding: '10px 14px',
                                                                // borderRadius: '12px',
                                                                // boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                            }}
                                                        >
                                                            {/* Header: Tên + thời gian */}
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                                    {cmt.author.name}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: 'gray' }}>
                                                                    {/* Giả định bạn có trường created_at dạng ISO date */}
                                                                    {dayjs(cmt.created_at).fromNow()} {/* ví dụ: 2 phút trước */}
                                                                </Typography>
                                                            </Box>

                                                            {/* Nội dung comment */}
                                                            <Box
                                                                sx={{
                                                                    fontSize: "0.9rem", color: "#172b4d",
                                                                    backgroundColor: '#f4f5f7',
                                                                    padding: '10px 14px',
                                                                    borderRadius: '12px',
                                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                                }}
                                                                dangerouslySetInnerHTML={{ __html: cmt.content }}
                                                            />
                                                            <Box>
                                                                <span>xóa</span>
                                                                <span>sửa</span>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>

                                    </Box>
                                </Box>

                            </Box>

                            {/* Controller */}
                            <Box id="controller" sx={{ width: "150px", flex: "0 0 auto", paddingRight: "16px" }}>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                    {actions.map((action, index) => (
                                        <Button
                                            key={index}
                                            startIcon={action.icon}
                                            variant="contained"
                                            disableElevation
                                            sx={{
                                                justifyContent: "flex-start",
                                                backgroundColor: "#e4e6ea",
                                                color: "#172b4d",
                                                textTransform: "none",
                                                fontWeight: 500,
                                                fontSize: "14px",
                                                px: 2,
                                                py: 1,
                                                borderRadius: 1,
                                                width: "150px",
                                                textOverflow: "ellipsis",
                                                overflow: "hidden",
                                                whiteSpace: "nowrap",
                                                "&:hover": {
                                                    backgroundColor: "#d6d8da",
                                                },
                                            }}
                                        >
                                            {action.label}
                                        </Button>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>

                {/* Dialog preview ảnh */}
                <Dialog
                    open={preview}
                    onClose={handleClose}
                    fullWidth
                    maxWidth="sm"
                    sx={{
                        "& .MuiDialog-paper": {
                            backgroundColor: "transparent",
                            boxShadow: "none",
                        },
                    }}
                >
                    <CustomButton type="close"
                        onClick={handleClose}
                        sx={{ position: "absolute", top: 8, right: 8, color: "white" }}
                    />
                    <img
                        src={selectedImage}
                        alt="Preview"
                        style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
                    />
                </Dialog>

            </Dialog>
        </>
    );
};

export default Card_detail;
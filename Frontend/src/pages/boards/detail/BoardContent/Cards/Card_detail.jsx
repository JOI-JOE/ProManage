import React, { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Typography,
    Box,
    Chip,
    IconButton,
    Button,
    Avatar,
    List,
    TextField,
    Paper,
    Divider,
} from "@mui/material";
import "react-lazy-load-image-component/src/effects/blur.css";
import CustomButton from "../../../../../components/Common/CustomButton.jsx";
import { LazyLoadImage } from "react-lazy-load-image-component";
// ICON
import GroupIcon from "@mui/icons-material/Group";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { PlusIcon } from "@heroicons/react/24/solid";
import { KeyboardArrowDown } from "@mui/icons-material";
import PersonRemoveAlt1Icon from '@mui/icons-material/PersonRemoveAlt1';
// PAGE --------------------------------------------------------------------
import dayjs from 'dayjs';
import ChecklistGroup from "./ChildComponent/Checklist/ChecklistGroup.jsx";
import CommentEditor from "./ChildComponent/EditorForm.jsx";
import FileItem from "./ChildComponent/Attachment/FileItem.jsx";
import LinkItem from "./ChildComponent/Attachment/LinkItem.jsx";
import relativeTime from 'dayjs/plugin/relativeTime';
import MemberMenu from "./ChildComponent/Members/MemberMenu.jsx";
import DateItem from "./ChildComponent/Date/DateItem.jsx";
// HOOK --------------------------------------------------------------------
import { useCardById, useJoinOrPutMember, useUpdateCardById } from "../../../../../hooks/useCard.js";
import { useBoard } from "../../../../../contexts/BoardContext.jsx";
import LogoLoading from "../../../../../components/LogoLoading.jsx";
import InitialsAvatar from "../../../../../components/Common/InitialsAvatar.jsx";
import { useMe } from "../../../../../contexts/MeContext.jsx";
import CheckMenu from "./ChildComponent/Checklist/CheckMenu.jsx";
import LabelsPopover from "./ChildComponent/Label/LabelsPopover.jsx";
import AttachmentMenu from "./ChildComponent/Attachment/AttachmentMenu.jsx";
import AttachmentFolder from "./ChildComponent/Attachment/AttachmentFolder.jsx";
import { AttachmentsProvider } from "../../../../../contexts/AttachmentsContext.jsx";

dayjs.extend(relativeTime);

const Card_detail = ({ cardId, closeCard, openCard }) => {
    // Lấy dữ liệu từ hook ---------------------------------------------
    // const { listData } = useBoard()
    const { user } = useMe();
    const { listData, members } = useBoard()
    const { data: fetchedCard, isLoading: isLoadingCard, isError } = useCardById(cardId);
    // Function ------------------------------------------
    const {
        updateTitle,
        updateDescription,
        isUpdating
    } = useUpdateCardById(cardId || card?.id);

    const {
        joinCard,
        isJoining,
        putMember,
        isPutting,
        removeMember,
        isRemoving
    } = useJoinOrPutMember(cardId || card?.id);
    // State -----------
    const [card, setCard] = useState(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    useEffect(() => {
        if (fetchedCard) {
            setCard(fetchedCard);
        }
    }, [fetchedCard]);
    // Lọc dữ liệu list
    const list = listData?.lists?.find(
        (item) => item.id === card?.list_board_id
    );
    // End ============================================================================

    // Test

    // FUNCTION TITLE - 1 ------------------------------------------------------------
    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setCard(prev => ({
            ...prev,
            title: newTitle
        }));
    };
    const handleTitleClick = () => {
        setIsEditingTitle(true);
    };

    const handleSaveTitle = async () => {
        const currentTitle = card?.title || "";

        if (isEmptyHTML(currentTitle)) {
            // Nếu người dùng để trống thì khôi phục lại title ban đầu
            setCard(prev => ({
                ...prev,
                title: fetchedCard?.title || ""
            }));
            setIsEditingTitle(false);
            return;
        }

        setIsEditingTitle(false);

        if (currentTitle !== fetchedCard?.title) {
            try {
                await updateTitle(currentTitle); // Gọi hook để update title
            } catch (error) {
                console.error("Lỗi khi cập nhật tiêu đề:", error);
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSaveTitle();
        } else if (e.key === "Escape") {
            // Khôi phục lại tiêu đề ban đầu
            setCard(prev => ({
                ...prev,
                title: fetchedCard?.title || ""
            }));
            setIsEditingTitle(false);
        }
    };
    // End ============================================================================

    // FUNCTION MEMBER - 2 ----------------------------------------------------------
    const [memberMenuAnchorEl, setMemberMenuAnchorEl] = useState(null);
    const openMemberMenu = Boolean(memberMenuAnchorEl);

    // Lấy danh sách ID thành viên trong card
    const memberIdsInCard = card?.membersId || [];

    // Thành viên đã có trong card
    const cardMembersData = React.useMemo(() => (
        members?.filter(member => memberIdsInCard.includes(member.id)) || []
    ), [members, memberIdsInCard]);

    // Thành viên thuộc board nhưng chưa có trong card
    const boardMembersData = React.useMemo(() => (
        members?.filter(member => !memberIdsInCard.includes(member.id)) || []
    ), [members, memberIdsInCard]);

    const handleOpenMemberMenu = (event) => {
        console.log('dang mở')
        setMemberMenuAnchorEl(event?.currentTarget || null); // dùng event nếu có, không thì null
    };

    const handleCloseMemberMenu = () => {
        setMemberMenuAnchorEl(null);
    };
    // Rời khỏi / tham gia card
    const hanleAttendMember = async () => {
        if (!card) return;

        const isMember = card.membersId?.includes(user.id);

        try {
            if (isMember) {
                const res = await joinCard(user.id);

                setCard(prev => ({
                    ...prev,
                    membersId: prev.membersId.filter(id => id !== user.id),
                }));

                if (res?.success === true && res.joined === false) {
                    setCard(prev => ({
                        ...prev,
                        membersId: prev.membersId.filter(id => id !== user.id),
                    }));
                }

            } else {
                const res = await joinCard();
                setCard(prev => ({
                    ...prev,
                    membersId: [...(prev.membersId || []), user.id],
                }));

                if (res?.success === true && res.joined === true) {
                    setCard(prev => ({
                        ...prev,
                        membersId: [...(prev.membersId || []), user.id],
                    }));
                }
            }
        } catch (error) {
            console.error('Lỗi khi xử lý thành viên:', error);
        }
    };
    // Thêm thành viên từ danh sách board
    const handleUserSelected = async (member) => {
        if (!card || memberIdsInCard.includes(member.id)) return;

        try {
            await putMember(member.id);
            setCard(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    membersId: [...(prev.membersId || []), member.id],
                };
            });
        } catch (error) {
            console.error('Lỗi khi thêm member vào card:', error);
        }
    };
    // Xoá member khỏi card
    const handleRemoveMemberFromCard = async (memberId) => {
        if (!card) return;

        try {
            await removeMember(memberId);
            setCard(prev => ({
                ...prev,
                membersId: prev.membersId?.filter(id => id !== memberId)
            }));
        } catch (error) {
            console.error('Lỗi khi xoá member khỏi card:', error);
        }
    };
    // End ============================================================================

    // FUNCTION MEMBER - 3 ----------------------------------------------------------
    const [descriptionText, setDescriptionText] = useState("");
    const [isEditingDescription, setIsEditingDescription] = useState(false);

    const isEmptyHTML = (html) => {
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.innerText.trim() === "";
    };
    // Lưu mô tả sau khi chỉnh sửa
    const handleSaveDescription = async () => {
        // if (isEmptyHTML(descriptionText)) return
        if (descriptionText === card?.description) {
            setIsEditingDescription(false);
            return;
        }

        try {
            await updateDescription(descriptionText); // Gọi mutation
            setCard(prev => ({
                ...prev,
                description: descriptionText,
            }));
            setIsEditingDescription(false);
        } catch (error) {
            console.error("Lỗi khi lưu mô tả:", error);
        }
    };
    // Huỷ chỉnh sửa mô tả
    const handleCancelDescriptionEdit = () => {
        setDescriptionText(card?.description || "");
        setIsEditingDescription(false);
    };
    // Mở chế độ chỉnh sửa mô tả
    const handleEditDescription = () => {
        setDescriptionText(card?.description || "");
        setIsEditingDescription(true);
    };
    // ----------------------------------------------------------------------------

    // FUNCTION CHECKLIST - 4 ----------------------------------------------------------
    const [anchorElCheckList, setAnchorElCheckList] = useState(null);
    const checklistGroupRef = useRef();

    // Mở menu
    const handleOpenCheckList = (event) => {
        setAnchorElCheckList(event.currentTarget);
    };
    // Đóng menu
    const handleCloseCheckList = () => {
        setAnchorElCheckList(null);
    };
    // Thêm checklist mới từ component cha
    const handleAddChecklist = ({ title, copyFrom }) => {
        const newChecklist = {
            id: Date.now(),
            title,
            copyFrom,
            items: [],
        };
        // Gọi hàm trong ChecklistGroup để thêm checklist
        if (checklistGroupRef.current?.addChecklistFromOutside) {
            checklistGroupRef.current.addChecklistFromOutside(newChecklist);
        }
        handleCloseCheckList();
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
    //---------------------------------------------------------------
    const [selectedImage, setSelectedImage] = useState(null);
    const [preview, setPreview] = useState(false);

    const isImageFile = (url) => {
        const ext = url.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase();
        const imageTypes = ["jpg", "jpeg", "png", "webp", "gif"];
        return imageTypes.includes(ext);
    };
    const handleOpenPreview = (url) => {
        if (isImageFile(url)) {
            setSelectedImage(url);
            setPreview(true);
        }
    };
    const handleClosePreview = () => {
        setPreview(false);
        setSelectedImage(null);
    };
    //-------------------------------------------------------------
    const [labelsAnchorEl, setLabelsAnchorEl] = useState(null);
    // Handler to open the labels popover
    const handleOpenLabelsMenu = (event) => {
        setLabelsAnchorEl(event.currentTarget);
    };
    // Handler to close the labels popover
    const handleCloseLabelsMenu = () => {
        setLabelsAnchorEl(null);
    };
    //-----------------
    const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
    // Hàm mở dialog
    const handleOpenDateDialog = () => {
        setIsDateDialogOpen(true);
    };
    // Hàm đóng dialog
    const handleCloseDateDialog = () => {
        setIsDateDialogOpen(false);
    };

    // ---------------------------------------------------------------------
    const [anchorElFile, setAnchorElFile] = useState(null);

    const handleOpenFile = (event) => {
        setAnchorElFile(event.currentTarget);
    };

    const handleCloseFile = () => {
        setAnchorElFile(null);
    };

    const isCurrentUserInCard = card?.membersId?.includes(user.id);
    const actions = [
        {
            label: isCurrentUserInCard ? "Rời khỏi" : "Tham gia",
            icon: isCurrentUserInCard ? <PersonRemoveAlt1Icon fontSize="small" /> : <PersonAddIcon fontSize="small" />,
            onClick: hanleAttendMember
        },
        {
            label: "Thành viên",
            icon: <GroupIcon fontSize="small" />,
            onClick: (e) => handleOpenMemberMenu(e)
        },
        { label: "Nhãn", icon: <LocalOfferIcon fontSize="small" /> },
        {
            label: "Việc cần làm",
            icon: <CheckBoxIcon fontSize="small" />,
            onClick: handleOpenCheckList
        },
        { label: "Ngày", icon: <ScheduleIcon fontSize="small" /> },
        {
            label: "Đính kèm",
            icon: <AttachFileIcon fontSize="small" />,
            onClick: handleOpenFile
        },
    ];


    return (
        <>
            <AttachmentsProvider cardId={cardId}>
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
                            maxHeight: "calc(100vh)", // Giới hạn chiều cao để giống Trello
                            margin: "20px",
                            display: "flex",
                            flexDirection: "column",
                            borderRadius: "18px",
                            overflow: "hidden",
                        },
                        height: "100vh"
                    }}
                >

                    {isLoadingCard ? (
                        <LogoLoading />
                    ) : (
                        <>
                            <DialogContent
                                sx={{
                                    flex: 1,
                                    padding: "0px",
                                    flexDirection: "column",
                                    overflowY: "auto",

                                    "&::-webkit-scrollbar": {
                                        width: "6px", // Độ rộng hợp lý cho UI
                                    },
                                    "&::-webkit-scrollbar-thumb": {
                                        backgroundColor: "#bbb", // Màu mặc định của thanh kéo
                                        borderRadius: "10px",
                                    },
                                    "&::-webkit-scrollbar-thumb:hover": {
                                        backgroundColor: "#999", // Hover rõ ràng hơn
                                    },
                                    "&::-webkit-scrollbar-track": {
                                        backgroundColor: "#f1f1f1", // Màu nền thanh trượt
                                    },
                                }}
                            >
                                {/* Ảnh bìa */}
                                <Box
                                    sx={{
                                        position: "relative",
                                        overflow: "hidden",
                                        flexShrink: 0,
                                        borderRadius: "12px 12px 0 0",
                                        backgroundColor: "rgb(150 151 159)"
                                    }}
                                >
                                    <Box
                                        sx={{ display: "flex", justifyContent: "center", cursor: "pointer" }}
                                        onClick={() =>
                                            handleOpenPreview(
                                                "https://wallpapers.com/images/hd/the-wind-rises-1920-x-1080-wallpaper-fouebsfnbvnf3rz4.jpg"
                                            )
                                        }
                                    >
                                        <LazyLoadImage
                                            src="https://wallpapers.com/images/hd/the-wind-rises-1920-x-1080-wallpaper-fouebsfnbvnf3rz4.jpg"
                                            alt="Card Cover"
                                            effect="blur"
                                            style={{
                                                minHeight: '116px',
                                                width: "100%",
                                                maxHeight: "160px",
                                                objectFit: "contain",
                                                background: 'white',
                                            }}
                                        />
                                    </Box>

                                    <CustomButton
                                        sx={{
                                            position: "absolute",
                                            right: 8,
                                            top: 8,
                                            zIndex: 10000,
                                            color: "#fff",
                                        }}
                                        type="close"
                                        onClick={closeCard}
                                    />
                                </Box>

                                <Box sx={{ padding: "16px" }}>
                                    {/* Header */}
                                    <DialogTitle sx={{ paddingLeft: "40px" }}>
                                        <Box sx={{ display: "flex", marginBottom: "20px" }}>
                                            <Box>
                                                {isEditingTitle ? (
                                                    <TextField
                                                        fullWidth
                                                        value={card?.title || ""}
                                                        onChange={handleTitleChange}
                                                        onBlur={handleSaveTitle}
                                                        onKeyDown={handleKeyDown}
                                                        autoFocus
                                                        variant="standard"
                                                        sx={{ fontSize: "20px", pb: "10px" }}
                                                    />
                                                ) : (
                                                    <Typography
                                                        variant="h1"
                                                        sx={{ fontSize: "20px", pb: "10px", cursor: "pointer" }}
                                                        onClick={handleTitleClick}
                                                    >
                                                        {card?.title}
                                                    </Typography>
                                                )}

                                                <Typography variant="body1" sx={{ color: "#757575" }}>
                                                    trong danh sách{" "}
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            p: 0.5,
                                                            color: "black",
                                                            fontWeight: "bold",
                                                            borderRadius: "3px",
                                                            background: "#e0e0e0",
                                                            fontSize: "0.875rem",
                                                        }}
                                                    >
                                                        {list?.name}
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
                                            {/* Danh sách thành viên và nút thêm */}
                                            {cardMembersData.length > 0 ? (
                                                <>
                                                    <Box sx={{ marginBottom: 1 }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ color: "#5e6c84", fontWeight: 500, marginBottom: "4px" }}
                                                        >
                                                            Thành viên
                                                        </Typography>
                                                        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                                                            {cardMembersData.map((member) => (
                                                                <InitialsAvatar
                                                                    key={member.id}
                                                                    sx={{
                                                                        fontSize: "14px",
                                                                        width: "32px",
                                                                        height: "32px",
                                                                    }}
                                                                    size={"32px"}
                                                                    initials={member.initials}
                                                                    name={member.full_name}
                                                                    avatarSrc={member.image}
                                                                />
                                                            ))}
                                                            {/* Nút thêm thành viên được đặt cùng dòng với avatar */}
                                                            <IconButton
                                                                sx={{
                                                                    backgroundColor: "#e0e0e0",
                                                                    width: "32px",
                                                                    height: "32px",
                                                                    borderRadius: "50%",
                                                                }}
                                                                onClick={(e) => handleOpenMemberMenu(e)}
                                                            >
                                                                <PlusIcon sx={{ fontSize: "20px", color: "#555", position: "relative" }} />
                                                            </IconButton>
                                                        </Box>
                                                    </Box>
                                                </>
                                            ) : (null)}

                                            {/* Nhãn */}
                                            {card?.labels.length > 0 ? (
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
                                                        {/* {selectedLabels.map((label) => ( */}
                                                        <Chip
                                                            // key={label.id}
                                                            // label={label.name || ''}
                                                            sx={{
                                                                // backgroundColor: label.color,
                                                                height: "32px",
                                                                borderRadius: "4px",
                                                                // color: ['#ffca28', '#ffcdd2'].includes(label.color) ? '#000' : '#fff',
                                                                fontWeight: 500,
                                                                margin: '0 4px 4px 0'
                                                            }}
                                                        />
                                                        {/* ))} */}

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
                                                            onClick={handleOpenLabelsMenu}
                                                        >
                                                            <PlusIcon sx={{ fontSize: "16px", color: "#555" }} />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            ) : (null)}

                                            {/* Ngày */}
                                            <Box sx={{ minWidth: "200px" }}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ color: "#5e6c84", fontWeight: 500, marginBottom: "3px" }}
                                                >
                                                    Ngày
                                                </Typography>
                                                <Box
                                                    onClick={() => handleOpenDateDialog("card", "card-id")} // Thêm dòng này
                                                    sx={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        px: 1.5,
                                                        py: 1,
                                                        borderRadius: 1,
                                                        backgroundColor: "#e4e6ea",
                                                        cursor: "pointer",
                                                        '&:hover': {
                                                            backgroundColor: '#d9dbdf' // Thêm hiệu ứng hover
                                                        }
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
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ color: "#5e6c84", fontWeight: 500, marginBottom: "3px" }}
                                                    >
                                                        Mô tả
                                                    </Typography>

                                                    {card && !isEditingDescription && !isEmptyHTML(card?.description) && (
                                                        <Button onClick={handleEditDescription}>Chỉnh sửa</Button>
                                                    )}
                                                </Box>

                                                {isEditingDescription ? (
                                                    <CommentEditor
                                                        value={descriptionText}
                                                        onChange={setDescriptionText}
                                                        onSave={handleSaveDescription}
                                                        onCancel={handleCancelDescriptionEdit}
                                                        isLoading={isUpdating}
                                                        editorHeight="120px"
                                                        minHeight="80px"
                                                    />
                                                ) : !isEmptyHTML(card?.description) ? (
                                                    <Box
                                                        sx={{
                                                            borderRadius: "4px",
                                                            backgroundColor: "#fff",
                                                            cursor: "pointer",
                                                        }}
                                                        dangerouslySetInnerHTML={{ __html: card?.description }}
                                                        onClick={handleEditDescription}
                                                    />
                                                ) : (
                                                    <Box
                                                        sx={{
                                                            border: "1px solid #d1d1d1",
                                                            borderRadius: "4px",
                                                            minHeight: "60px",
                                                            padding: "6px 12px",
                                                            backgroundColor: "#e4e6ea",
                                                            color: "#172b4d",
                                                            cursor: "pointer",
                                                            fontSize: "14px",
                                                            whiteSpace: "pre-wrap",
                                                        }}
                                                        onClick={handleEditDescription}
                                                        dangerouslySetInnerHTML={{
                                                            __html: `<span style="color:#5e6c84">Hãy thêm mô tả chi tiết hơn...</span>`,
                                                        }}
                                                    />
                                                )}
                                            </Box>

                                            {/* Tệp đính kèm */}
                                            <Box sx={{ width: "100%" }}>
                                                {/* Attachments section */}
                                                <AttachmentFolder cardId={cardId} />
                                            </Box>


                                            {/* Checklist */}
                                            <Box sx={{ width: "100%" }}>
                                                <ChecklistGroup cardId={card?.id}
                                                    ref={checklistGroupRef}
                                                    members={boardMembersData}
                                                />
                                            </Box>

                                            {/* Activity */}
                                            {/* <ActivityFeed /> */}
                                            <Box sx={{ width: "100%" }}>
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
                                                                <Box>
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

                                        {/* Controller */}
                                        <Box
                                            id="controller"
                                            sx={{
                                                width: "150px",
                                                flex: "0 0 auto",
                                                paddingRight: 2, // dùng spacing scale thay cho "16px"
                                            }}
                                        >
                                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                                {actions.map(({ icon, label, onClick }, index) => (
                                                    <Button
                                                        key={index}
                                                        startIcon={icon}
                                                        onClick={onClick}
                                                        variant="contained"
                                                        disableElevation
                                                        title={label}
                                                        sx={{
                                                            justifyContent: "flex-start",
                                                            backgroundColor: "#e4e6ea",
                                                            color: "#172b4d",
                                                            textTransform: "none",
                                                            fontWeight: 500,
                                                            fontSize: 14,
                                                            px: 2,
                                                            py: 1,
                                                            borderRadius: 1,
                                                            width: "100%",
                                                            textOverflow: "ellipsis",
                                                            overflow: "hidden",
                                                            whiteSpace: "nowrap",
                                                            "&:hover": {
                                                                backgroundColor: "#d6d8da",
                                                            },
                                                        }}
                                                    >
                                                        {label}
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
                                onClose={handleClosePreview} // đóng dialog khi click ra ngoài
                                fullWidth
                                maxWidth="sm"
                                hideBackdrop={false} // đảm bảo backdrop hiển thị
                                sx={{
                                    "& .MuiDialog-paper": {
                                        backgroundColor: "transparent",
                                        boxShadow: "none",
                                        overflow: "hidden",
                                        borderRadius: 2,
                                    },
                                }}
                            >
                                {/* Nút đóng */}
                                <CustomButton
                                    type="close"
                                    onClick={handleClosePreview}
                                    sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        color: "#fff",
                                        backgroundColor: "rgba(0,0,0,0.5)",
                                        "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                                    }}
                                />

                                {/* Ảnh preview */}
                                <Box
                                    component="img"
                                    src={selectedImage}
                                    alt="Preview"
                                    loading="lazy"
                                    sx={{
                                        width: "100%",
                                        maxHeight: "80vh",
                                        objectFit: "contain",
                                        borderRadius: 2,
                                    }}
                                />
                            </Dialog>


                            {/* MenuMember */}
                            <MemberMenu
                                open={openMemberMenu}
                                onClose={handleCloseMemberMenu}
                                cardMembers={cardMembersData}
                                boardMembers={boardMembersData}
                                onRemoveCardMember={handleRemoveMemberFromCard}
                                anchorEl={memberMenuAnchorEl}
                                setAnchorEl={setMemberMenuAnchorEl}
                                onMemberSelect={handleUserSelected}
                            />

                            {/* Sử dụng DateItem */}
                            <DateItem
                                open={isDateDialogOpen}
                                onClose={handleCloseDateDialog}
                                type="card" // hoặc "checklist-item"
                                targetId="123" // ID của card hoặc checklist item
                            />

                            {/* Checklist */}
                            <CheckMenu
                                anchorEl={anchorElCheckList}
                                open={Boolean(anchorElCheckList)}
                                onClose={handleCloseCheckList}
                                onAdd={handleAddChecklist}
                                listOptions={[
                                    { label: "Việc hôm nay", value: "today" },
                                    { label: "Dự án 2025", value: "2025" },
                                ]}
                            />

                            <LabelsPopover
                                anchorEl={labelsAnchorEl}
                                open={Boolean(labelsAnchorEl)}
                                onClose={handleCloseLabelsMenu}
                                cardId={cardId} // Pass the current card ID if needed
                            />

                            <AttachmentMenu anchorEl={anchorElFile} open={Boolean(anchorElFile)} onClose={handleCloseFile} />
                        </>

                    )}
                </Dialog >
            </AttachmentsProvider>

        </>
    );
};

export default Card_detail;
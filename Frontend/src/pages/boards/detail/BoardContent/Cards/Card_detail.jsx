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
    Popover,
    Stack,
} from "@mui/material";
import "react-lazy-load-image-component/src/effects/blur.css";
import CustomButton from "../../../../../components/Common/CustomButton.jsx";
import { LazyLoadImage } from "react-lazy-load-image-component";
// ICON
import GroupIcon from "@mui/icons-material/Group";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import InventoryIcon from '@mui/icons-material/Inventory';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ScheduleIcon from "@mui/icons-material/Schedule";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { PlusIcon } from "@heroicons/react/24/solid";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonRemoveAlt1Icon from '@mui/icons-material/PersonRemoveAlt1';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import RemoveIcon from '@mui/icons-material/Remove';
// PAGE --------------------------------------------------------------------
import dayjs from 'dayjs';
import ChecklistGroup from "./ChildComponent/Checklist/ChecklistGroup.jsx";
import CommentEditor from "./ChildComponent/EditorForm.jsx";
import relativeTime from 'dayjs/plugin/relativeTime';
import MemberMenu from "./ChildComponent/Members/MemberMenu.jsx";
// HOOK --------------------------------------------------------------------
import { useCardById, useJoinOrPutMember, useRemoveCard, useUpdateCardById } from "../../../../../hooks/useCard.js";
import { useBoard } from "../../../../../contexts/BoardContext.jsx";
import LogoLoading from "../../../../../components/LogoLoading.jsx";
import InitialsAvatar from "../../../../../components/Common/InitialsAvatar.jsx";
import { useMe } from "../../../../../contexts/MeContext.jsx";
import CheckMenu from "./ChildComponent/Checklist/CheckMenu.jsx";
import AttachmentMenu from "./ChildComponent/Attachment/AttachmentMenu.jsx";
import AttachmentFolder from "./ChildComponent/Attachment/AttachmentFolder.jsx";
import { AttachmentsProvider } from "../../../../../contexts/AttachmentsContext.jsx";
import CommentSection from "./ChildComponent/Comment/CommentSection.jsx";
import { CommentProvider } from "../../../../../contexts/CommentContext.jsx";
import LabelList from "./ChildComponent/Label/LabelList.jsx";
import CardDateSection from "./ChildComponent/Date/CardDateSection.jsx";
import { Delete } from "@mui/icons-material";

dayjs.extend(relativeTime);

const Card_detail = ({ cardId, closeCard, openCard }) => {
    // Lấy dữ liệu từ hook ---------------------------------------------
    const { user } = useMe();
    const { listData, members, refetchListData, listLoading } = useBoard()
    const { data: fetchedCard, isLoading: isLoadingCard, isError, refetch: refetchCard } = useCardById(cardId);
    // Function ------------------------------------------
    const {
        updateTitle,
        updateDescription,
        updateIsCompleted,
        updateIsArchived,
        isUpdating
    } = useUpdateCardById(cardId || card?.id);
    const { mutateAsync: useRemoveCardMutate } = useRemoveCard();

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
    const [coverLoading, setCoverLoading] = useState(false);
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
    // ------------------------------
    const [deleteAnchorEl, setDeleteAnchorEl] = useState(null);
    const [isRemoveLoading, setRemoveLoading] = useState(false);
    const deleteButtonRef = useRef(null);

    const handleOpenDeletePopover = (event) => {
        setDeleteAnchorEl(deleteButtonRef.current);
        console.log(event)

    };

    const handleCloseDeletePopover = () => {
        setDeleteAnchorEl(null);
    };

    const handleConfirmDelete = async () => {
        setRemoveLoading(true); // Bật loading
        try {
            await useRemoveCardMutate(cardId); // hoặc gọi API xoá thực tế
            await refetchListData();
            handleCloseDeletePopover();
        } catch (error) {
            console.error('Lỗi xoá card:', error);
        } finally {
            setRemoveLoading(false); // Tắt loading
        }
    };

    const handleArchiveCard = async () => {
        try {
            if (!card?.id) return;

            await updateIsArchived(true); // Chờ API hoàn tất

            setCard(prev => ({
                ...prev,
                is_archived: true,
            }));
            console.log("✅ Card đã được lưu trữ.");
        } catch (error) {
            console.error("❌ Lỗi khi lưu trữ card:", error);
        }
    };

    const handleRestoreCard = async () => {
        try {
            if (!card?.id) return;

            await updateIsArchived(false); // Chờ API khôi phục thành công

            setCard(prev => ({
                ...prev,
                is_archived: false,
            }));

        } catch (error) {
            console.error("❌ Lỗi khi khôi phục thẻ:", error);
        } finally {
            handleCloseDeletePopover(); // Đóng popover dù có lỗi hay không
        }
    };


    const isCurrentUserInCard = card?.membersId?.includes(user.id);
    const labelListRef = useRef(null);
    const dateSectionRef = useRef(null);
    const attachmentFolderRef = useRef(null);
    console.log("attachmentFolderRef", attachmentFolderRef.current);


    const mainActions = [
        {
            label: isCurrentUserInCard ? "Rời khỏi" : "Tham gia",
            icon: isCurrentUserInCard ? <PersonRemoveAlt1Icon fontSize="small" /> : <PersonAddIcon fontSize="small" />,
            onClick: hanleAttendMember,
        },
        {
            label: "Thành viên",
            icon: <GroupIcon fontSize="small" />,
            onClick: (e) => handleOpenMemberMenu(e),
        },
        {
            label: "Nhãn",
            icon: <LocalOfferIcon fontSize="small" />,
            onClick: (e) => labelListRef.current?.openLabelsPopover(e),
        },
        {
            label: "Việc cần làm",
            icon: <CheckBoxIcon fontSize="small" />,
            onClick: handleOpenCheckList,
        },
        {
            label: "Ngày",
            icon: <ScheduleIcon fontSize="small" />,
            onClick: (e) => dateSectionRef.current?.openDateDialog(e),
        },
        {
            label: "Đính kèm",
            icon: <AttachFileIcon fontSize="small" />,
            onClick: () => attachmentFolderRef.current?.openAttachmentDialog(),
        },
    ];

    // Nhóm Thao tác
    const operationActions = [
        {
            label: "Di chuyển",
            icon: <ArrowForwardIcon fontSize="small" />,
            onClick: () => handleMoveCard(),
        },
        {
            label: "Sao chép",
            icon: <ContentCopyIcon fontSize="small" />,
            onClick: () => handleCopyCard(),
        },
        ...(card?.is_archived
            ? [
                {
                    label: "Gửi tới bảng",
                    icon: <RestartAltIcon fontSize="small" />,
                    onClick: () => handleRestoreCard(),
                },
                {
                    label: "Xoá",
                    icon: <RemoveIcon fontSize="small" />,
                    onClick: handleOpenDeletePopover,
                    sx: {
                        backgroundColor: "error.main",
                        color: "white",
                        "&:hover": {
                            backgroundColor: "error.dark",
                        },
                    },
                    ref: deleteButtonRef,
                },
            ]
            : [
                {
                    label: "Lưu trữ",
                    icon: <InventoryIcon fontSize="small" />,
                    onClick: () => handleArchiveCard(),
                },
            ]),
    ];


    return (
        <>
            <AttachmentsProvider cardId={cardId} setCard={setCard} setCoverLoading={setCoverLoading}
            >

                <Dialog
                    open={openCard}
                    onClose={closeCard}
                    maxWidth="md"
                    disableEnforceFocus={false} // vẫn giữ focus bên trong dialog
                    disableEscapeKeyDown={false}
                    hideBackdrop={false}
                    BackdropProps={{
                        sx: {
                            backgroundColor: "rgba(0,0,0,0.5)",
                            // backgroundColor: "",
                            backdropFilter: "blur(3px)",
                        },
                    }}

                    sx={{
                        "& .MuiDialog-container": {
                            alignItems: "flex-start",
                            justifyContent: "center",
                        },
                        "& .MuiPaper-root": {
                            width: "100%",
                            maxHeight: "95vh", // Giới hạn chiều cao tối đa
                            height: "auto", // Chiều cao tự động theo nội dung
                            margin: "20px",
                            display: "flex",
                            flexDirection: "column",
                            borderRadius: "18px",
                            overflow: "hidden",
                        },
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
                                    background: "#091e420f",
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
                                {card?.thumbnail && (
                                    <Box
                                        sx={{
                                            position: "relative",
                                            overflow: "hidden",
                                            flexShrink: 0,
                                            borderRadius: "12px 12px 0 0",
                                            backgroundColor: "rgb(150 151 159)"
                                        }}
                                    >
                                        {coverLoading ? (
                                            <Box sx={{ height: 160, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <LogoLoading scale={0.5} />
                                            </Box>
                                        ) : (
                                            <Box
                                                sx={{ display: "flex", justifyContent: "center", cursor: "pointer" }}
                                                onClick={() => handleOpenPreview(card?.thumbnail)}
                                            >
                                                <LazyLoadImage
                                                    src={card?.thumbnail}
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
                                        )}

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

                                )}

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
                                                            variant="subtitle2"
                                                            sx={(theme) => {
                                                                return {
                                                                    color: theme.palette.text.secondary,
                                                                    fontWeight: 600,
                                                                }
                                                            }}
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
                                                                sx={(theme) => {
                                                                    return {
                                                                        backgroundColor: "#e0e0e0",
                                                                        width: "32px",
                                                                        height: "32px",
                                                                        borderRadius: 2,
                                                                        backgroundColor: theme.palette.background.paper,
                                                                        boxShadow: theme.shadows[1],
                                                                        borderRadius: "50%",
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.2s ease-in-out',
                                                                        '&:hover': {
                                                                            boxShadow: theme.shadows[3],
                                                                            backgroundColor: theme.palette.action.hover,
                                                                        },
                                                                        "&:hover": {
                                                                            backgroundColor: "#ccc",
                                                                        },
                                                                    }
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
                                            <Box>
                                                <LabelList ref={labelListRef} cardId={cardId} />
                                            </Box>

                                            {/* Ngày */}
                                            <Box sx={{ minWidth: "200px" }}>
                                                <CardDateSection ref={dateSectionRef} cardData={card?.badges} cardId={cardId} />
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
                                                            // backgroundColor: "#fff",
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
                                                <AttachmentFolder ref={attachmentFolderRef} cardId={cardId} />
                                            </Box>

                                            {/* Checklist */}
                                            <Box sx={{ width: "100%" }}>
                                                <ChecklistGroup cardId={card?.id}
                                                    ref={checklistGroupRef}
                                                    members={boardMembersData}
                                                />
                                            </Box>

                                            {/* Activity */}
                                            <Box sx={{ width: "100%", mb: "30px" }}>
                                                <CommentProvider cardId={cardId}>
                                                    <CommentSection />
                                                </CommentProvider>
                                            </Box>

                                        </Box>

                                        {/* Controller */}
                                        <Box
                                            id="controller"
                                            sx={{
                                                flex: "0 0 auto",
                                                paddingRight: 2,
                                                minWidth: 168,
                                                maxWidth: 200,
                                                width: "100%",
                                            }}
                                        >
                                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                                {/* Render mainActions */}
                                                {mainActions.map((action, index) => (
                                                    <Box key={index}>
                                                        <Button
                                                            startIcon={action.icon}
                                                            onClick={action.onClick}
                                                            variant="contained"
                                                            disableElevation
                                                            title={action.label}
                                                            sx={{
                                                                justifyContent: "flex-start",
                                                                backgroundColor: "#e4e6ea",
                                                                color: "#172b4d",
                                                                textTransform: "none",
                                                                fontWeight: 600,
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
                                                            {action.label}
                                                        </Button>
                                                    </Box>
                                                ))}

                                                {/* Render nhóm Thao tác */}
                                                <Box>
                                                    <Box
                                                        sx={{
                                                            py: 0.5,
                                                            fontWeight: 500,
                                                            color: "#5e6c84",
                                                            fontSize: "14px",
                                                        }}
                                                    >
                                                        Thao tác
                                                    </Box>
                                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 0.5 }}>
                                                        {operationActions.map((action, index) => (
                                                            <Box key={index}>
                                                                <Button
                                                                    startIcon={action.icon}
                                                                    onClick={action.onClick}
                                                                    ref={action.label === "Xoá" ? deleteButtonRef : null}
                                                                    variant="contained"
                                                                    disableElevation
                                                                    title={action.label}
                                                                    sx={{
                                                                        justifyContent: "flex-start",
                                                                        backgroundColor: "#e4e6ea",
                                                                        color: "#172b4d",
                                                                        textTransform: "none",
                                                                        fontWeight: 600,
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
                                                                        ...action.sx,
                                                                    }}
                                                                >
                                                                    {action.label}
                                                                </Button>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                </Box>
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

                            {/* Delete Confirmation Popover */}
                            <Popover
                                open={Boolean(deleteAnchorEl)}
                                anchorEl={deleteAnchorEl}
                                onClose={handleCloseDeletePopover}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                PaperProps={{
                                    sx: {
                                        p: 2,
                                        borderRadius: 2,
                                        boxShadow: 3,
                                        width: 304,
                                        mt: 2
                                    }
                                }}
                            >
                                {isRemoveLoading ? (
                                    <LogoLoading />
                                ) : (
                                    <>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Bạn muốn xoá thẻ?
                                        </Typography>
                                        <Typography variant="body2" paragraph>
                                            Tất cả hoạt động trên thẻ sẽ bị xoá khỏi bảng tin hoạt động và bạn sẽ không thể mở lại thẻ nữa. Sẽ không có cách nào để hoàn tác. Bạn có chắc không?
                                        </Typography>

                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Button
                                                onClick={handleCloseDeletePopover}
                                                variant="outlined"
                                                size="small"
                                                sx={{
                                                    textTransform: 'none',
                                                    fontWeight: 600
                                                }}
                                            >
                                                Huỷ
                                            </Button>
                                            <Button
                                                onClick={handleConfirmDelete}
                                                variant="contained"
                                                color="error"
                                                size="small"
                                                startIcon={<Delete fontSize="small" />}
                                                sx={{
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    '&:hover': {
                                                        backgroundColor: 'error.dark'
                                                    }
                                                }}
                                            >
                                                Xoá
                                            </Button>
                                        </Stack>
                                    </>
                                )}
                            </Popover>



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
                        </>

                    )}
                </Dialog >
            </AttachmentsProvider >

        </>
    );
};

export default Card_detail;
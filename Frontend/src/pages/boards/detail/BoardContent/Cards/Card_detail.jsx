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
    TextField,
    Popover,
    Stack,
    Checkbox,
} from "@mui/material";
import "react-lazy-load-image-component/src/effects/blur.css";
import CustomButton from "../../../../../components/Common/CustomButton.jsx";
import { LazyLoadImage } from "react-lazy-load-image-component";
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
import { Delete } from "@mui/icons-material";
import dayjs from 'dayjs';
import ChecklistGroup from "./ChildComponent/Checklist/ChecklistGroup.jsx";
import CommentEditor from "./ChildComponent/EditorForm.jsx";
import relativeTime from 'dayjs/plugin/relativeTime';
import MemberMenu from "./ChildComponent/Members/MemberMenu.jsx";
import { useCardById, useJoinOrPutMember, useRemoveCard, useUpdateCardById } from "../../../../../hooks/useCard.js";
import { useBoard } from "../../../../../contexts/BoardContext.jsx";
import LogoLoading from "../../../../../components/LogoLoading.jsx";
import InitialsAvatar from "../../../../../components/Common/InitialsAvatar.jsx";
import { useMe } from "../../../../../contexts/MeContext.jsx";
import CheckMenu from "./ChildComponent/Checklist/CheckMenu.jsx";
import AttachmentFolder from "./ChildComponent/Attachment/AttachmentFolder.jsx";
import { AttachmentsProvider } from "../../../../../contexts/AttachmentsContext.jsx";
import CommentSection from "./ChildComponent/Comment/CommentSection.jsx";
import { CommentProvider } from "../../../../../contexts/CommentContext.jsx";
import CardDateSection from "./ChildComponent/Date/CardDateSection.jsx";
import ImagePreview from "./Common/ImagePreview.jsx";
import CopyCardPopUp from "./Common/CopyCardDialog.jsx";
import MoveCardPopUp from "./Common/MoveCardDialog.jsx";

dayjs.extend(relativeTime);

const Card_detail = ({ cardId, closeCard, openCard }) => {
    const { user } = useMe();
    const { orderedLists, members, refetchorderedLists } = useBoard();
    const { data: fetchedCard, isLoading: isLoadingCard, isError, refetch: refetchCard } = useCardById(cardId);
    const { updateTitle, updateDescription, updateIsCompleted, updateIsArchived, isUpdating } = useUpdateCardById(cardId || card?.id);
    const { mutateAsync: useRemoveCardMutate } = useRemoveCard();
    const { joinCard, isJoining, putMember, isPutting, removeMember, isRemoving } = useJoinOrPutMember(cardId || card?.id);

    const [card, setCard] = useState(null);
    const [coverLoading, setCoverLoading] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    useEffect(() => {
        if (fetchedCard) {
            setCard(fetchedCard);
        }
    }, [fetchedCard]);

    const list = orderedLists.find((item) => item.id === card?.list_board_id);

    // Hàm xử lý thay đổi trạng thái Checkbox
    const handleCheckboxChange = async (event) => {
        const newDueComplete = event.target.checked;
        try {
            await updateIsCompleted(newDueComplete);
            setCard(prev => ({
                ...prev,
                badges: {
                    ...prev.badges,
                    dueComplete: newDueComplete,
                },
            }));
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái hoàn thành:", error);
        }
    };

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setCard(prev => ({
            ...prev,
            title: newTitle,
        }));
    };

    const handleTitleClick = () => {
        setIsEditingTitle(true);
    };

    const handleSaveTitle = async () => {
        const currentTitle = card?.title || "";
        if (isEmptyHTML(currentTitle)) {
            setCard(prev => ({
                ...prev,
                title: fetchedCard?.title || "",
            }));
            setIsEditingTitle(false);
            return;
        }

        setIsEditingTitle(false);
        if (currentTitle !== fetchedCard?.title) {
            try {
                await updateTitle(currentTitle);
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
            setCard(prev => ({
                ...prev,
                title: fetchedCard?.title || "",
            }));
            setIsEditingTitle(false);
        }
    };

    const [memberMenuAnchorEl, setMemberMenuAnchorEl] = useState(null);
    const openMemberMenu = Boolean(memberMenuAnchorEl);
    const memberIdsInCard = card?.membersId || [];
    const cardMembersData = React.useMemo(() => (
        members?.filter(member => memberIdsInCard.includes(member.id)) || []
    ), [members, memberIdsInCard]);
    const boardMembersData = React.useMemo(() => (
        members?.filter(member => !memberIdsInCard.includes(member.id)) || []
    ), [members, memberIdsInCard]);

    const handleOpenMemberMenu = (event) => {
        setMemberMenuAnchorEl(event?.currentTarget || null);
    };

    const handleCloseMemberMenu = () => {
        setMemberMenuAnchorEl(null);
    };

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

    const handleRemoveMemberFromCard = async (memberId) => {
        if (!card) return;
        try {
            await removeMember(memberId);
            setCard(prev => ({
                ...prev,
                membersId: prev.membersId?.filter(id => id !== memberId),
            }));
        } catch (error) {
            console.error('Lỗi khi xoá member khỏi card:', error);
        }
    };

    const [descriptionText, setDescriptionText] = useState("");
    const [isEditingDescription, setIsEditingDescription] = useState(false);

    const isEmptyHTML = (html) => {
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.innerText.trim() === "";
    };
    const handleSaveDescription = async () => {
        // Check if the description is empty or unchanged
        if (descriptionText === card?.description) {
            setIsEditingDescription(false);
            return;
        }
        const isDescriptionEmpty = isEmptyHTML(descriptionText);
        const newDescription = isDescriptionEmpty ? null : descriptionText;

        try {
            await updateDescription(newDescription);
            setCard(prev => ({
                ...prev,
                description: newDescription,
            }));
            setIsEditingDescription(false);
        } catch (error) {
            console.error("Lỗi khi lưu mô tả:", error);
        }
    };

    const handleCancelDescriptionEdit = () => {
        setDescriptionText(card?.description || "");
        setIsEditingDescription(false);
    };

    const handleEditDescription = () => {
        setDescriptionText(card?.description || "");
        setIsEditingDescription(true);
    };

    const [anchorElCheckList, setAnchorElCheckList] = useState(null);
    const checklistGroupRef = useRef();

    const handleOpenCheckList = (event) => {
        setAnchorElCheckList(event.currentTarget);
    };

    const handleCloseCheckList = () => {
        setAnchorElCheckList(null);
    };

    const handleAddChecklist = ({ title, copyFrom }) => {
        const newChecklist = {
            id: Date.now(),
            title,
            copyFrom,
            items: [],
        };
        if (checklistGroupRef.current?.addChecklistFromOutside) {
            checklistGroupRef.current.addChecklistFromOutside(newChecklist);
        }
        handleCloseCheckList();
    };

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

    const [deleteAnchorEl, setDeleteAnchorEl] = useState(null);
    const [isRemoveLoading, setRemoveLoading] = useState(false);
    const deleteButtonRef = useRef(null);

    const handleOpenDeletePopover = (event) => {
        setDeleteAnchorEl(deleteButtonRef.current);
    };

    const handleCloseDeletePopover = () => {
        setDeleteAnchorEl(null);
    };

    const handleConfirmDelete = async () => {
        setRemoveLoading(true);
        try {
            await useRemoveCardMutate(cardId);
            await refetchorderedLists();
            handleCloseDeletePopover();
        } catch (error) {
            console.error('Lỗi xoá card:', error);
        } finally {
            setRemoveLoading(false);
        }
    };

    const handleArchiveCard = async () => {
        try {
            if (!card?.id) return;
            await updateIsArchived(true);
            setRemoveLoading(true);
            setCard(prev => ({
                ...prev,
                is_archived: true,
            }));
        } catch (error) {
            setRemoveLoading(false);
            console.error("❌ Lỗi khi lưu trữ thẻ:", error);
        }
    };

    const isCurrentUserInCard = card?.membersId?.includes(user.id);
    const labelListRef = useRef(null);
    const dateSectionRef = useRef(null);
    const attachmentFolderRef = useRef(null);
    const moveCardPopUpRef = useRef(null);
    const copyCardPopUpRef = useRef(null);

    // COPY
    const handleOpenCopy = (event) => {
        if (copyCardPopUpRef.current) {
            copyCardPopUpRef.current.open(event.currentTarget);
        }
    };
    // MOVE
    const handleOpenMovePopover = (event) => {
        if (moveCardPopUpRef.current) {
            moveCardPopUpRef.current.open(event.currentTarget);
        }
    };

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

    const operationActions = [
        {
            label: "Di chuyển",
            icon: <ArrowForwardIcon fontSize="small" />,
            onClick: handleOpenMovePopover,
        },
        {
            label: "Sao chép",
            icon: <ContentCopyIcon fontSize="small" />,
            onClick: handleOpenCopy,
        },
        {
            label: "Lưu trữ",
            icon: isRemoveLoading ? <LogoLoading scale={0.3} y={40} x={40} /> : <InventoryIcon fontSize="small" />,
            onClick: () => handleArchiveCard(),
        },
    ];

    const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

    return (
        <AttachmentsProvider cardId={cardId} setCard={setCard} setCoverLoading={setCoverLoading}>
            <CommentProvider cardId={cardId}>
                <Dialog
                    open={openCard}
                    onClose={closeCard}
                    maxWidth="md"
                    disableEnforceFocus={false}
                    disableEscapeKeyDown={false}
                    hideBackdrop={false}
                    disablePortal={true}
                    BackdropProps={{
                        sx: {
                            backgroundColor: "rgba(0,0,0,0.5)",
                            backdropFilter: "blur(3px)",
                            pointerEvents: "auto",
                        },
                        onMouseDown: (e) => e.stopPropagation(),
                        onMouseMove: (e) => e.stopPropagation(),
                        onMouseUp: (e) => e.stopPropagation(),
                    }}
                    sx={{
                        "& .MuiDialog-container": {
                            alignItems: "flex-start",
                            justifyContent: "center",
                        },
                        "& .MuiPaper-root": {
                            width: "100%",
                            maxHeight: "95vh",
                            height: "auto",
                            margin: "20px",
                            display: "flex",
                            flexDirection: "column",
                            borderRadius: "18px",
                            overflow: "hidden",
                            pointerEvents: "auto",
                        },
                        pointerEvents: openCard ? "auto" : "none",
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
                                        width: "6px",
                                    },
                                    "&::-webkit-scrollbar-thumb": {
                                        backgroundColor: "#bbb",
                                        borderRadius: "10px",
                                    },
                                    "&::-webkit-scrollbar-thumb:hover": {
                                        backgroundColor: "#999",
                                    },
                                    "&::-webkit-scrollbar-track": {
                                        backgroundColor: "#f1f1f1",
                                    },
                                }}
                            >
                                {card?.thumbnail && (
                                    <Box
                                        sx={{
                                            position: "relative",
                                            overflow: "hidden",
                                            flexShrink: 0,
                                            borderRadius: "12px 12px 0 0",
                                            backgroundColor: "rgb(150 151 159)",
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
                                    <DialogTitle sx={{ paddingLeft: "40px", width: '100%' }}>
                                        <Box sx={{ display: "flex", marginBottom: "20px", position: 'relative' }}>
                                            <Checkbox
                                                {...label}
                                                checked={card?.badges?.dueComplete || false}
                                                onChange={handleCheckboxChange}
                                                color="success"
                                                sx={{ position: "absolute", left: -50, top: -10 }}
                                                disabled={isUpdating}
                                            />

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
                                                        sx={{ fontSize: "20px", pb: "10px", width: "100%" }}
                                                    />
                                                ) : (
                                                    <Box sx={{ display: "flex" }}>
                                                        <Typography
                                                            variant="h1"
                                                            sx={{ fontSize: "20px", pb: "10px", cursor: "pointer" }}
                                                            onClick={handleTitleClick}
                                                        >
                                                            {card?.title}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                <Typography variant="body1" sx={{ color: "#757575" }}>
                                                    trong danh sách{" "}
                                                    <Box
                                                        onClick={handleOpenMovePopover}
                                                        component="span"
                                                        sx={{
                                                            p: 0.5,
                                                            color: "black",
                                                            fontWeight: "bold",
                                                            borderRadius: "3px",
                                                            background: "#e0e0e0",
                                                            fontSize: "0.875rem",
                                                            cursor: 'pointer',
                                                        }}
                                                        ref={moveCardPopUpRef}
                                                    >
                                                        {list?.name}
                                                    </Box>
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </DialogTitle>

                                    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
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
                                            {cardMembersData.length > 0 ? (
                                                <Box sx={{ marginBottom: 1 }}>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={(theme) => ({
                                                            color: theme.palette.text.secondary,
                                                            fontWeight: 600,
                                                        })}
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
                                                        <IconButton
                                                            sx={(theme) => ({
                                                                backgroundColor: theme.palette.background.paper,
                                                                width: "32px",
                                                                height: "32px",
                                                                boxShadow: theme.shadows[1],
                                                                borderRadius: "50%",
                                                                cursor: "pointer",
                                                                transition: "all 0.2s ease-in-out",
                                                                "&:hover": {
                                                                    boxShadow: theme.shadows[3],
                                                                    backgroundColor: "#ccc",
                                                                },
                                                            })}
                                                            onClick={(e) => handleOpenMemberMenu(e)}
                                                        >
                                                            <PlusIcon sx={{ fontSize: "20px", color: "#555", position: "relative" }} />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            ) : null}

                                            <Box sx={{ minWidth: "200px" }}>
                                                <CardDateSection ref={dateSectionRef} cardData={card?.badges} cardId={cardId} />
                                            </Box>

                                            <Box sx={{ width: "100%", mb: "20px" }}>
                                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                    <Typography
                                                        variant="subtitle1"
                                                        sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}
                                                    >
                                                        Mô tả
                                                    </Typography>
                                                    {card && !isEditingDescription && !isEmptyHTML(card?.description) && (
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            onClick={handleEditDescription}
                                                            sx={{
                                                                textTransform: 'none',
                                                                fontSize: '14px',
                                                                borderRadius: '6px',
                                                                backgroundColor: '#e4e6ea',
                                                                color: '#172b4d',
                                                                '&:hover': {
                                                                    backgroundColor: '#d6d8da',
                                                                },
                                                            }}
                                                        >
                                                            Chỉnh sửa
                                                        </Button>
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
                                                        sx={{ borderRadius: "4px", cursor: "pointer" }}
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

                                            <Box sx={{ width: "100%" }}>
                                                <AttachmentFolder ref={attachmentFolderRef} cardId={cardId} refetchCard={refetchCard} />
                                            </Box>

                                            <Box sx={{ width: "100%" }}>
                                                <ChecklistGroup cardId={card?.id} ref={checklistGroupRef} members={boardMembersData} />
                                            </Box>

                                            <Box sx={{ width: "100%" }}>
                                                <CommentSection />
                                            </Box>
                                        </Box>

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

                                                <Box>
                                                    <Box sx={{ py: 0.5, fontWeight: 500, color: "#5e6c84", fontSize: "14px" }}>
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

                            <ImagePreview
                                open={Boolean(preview)}
                                onClose={handleClosePreview}
                                imageSrc={selectedImage}
                            />

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
                                        mt: 2,
                                    },
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
                                                sx={{ textTransform: 'none', fontWeight: 600 }}
                                            >
                                                Hủy
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
                                                    '&:hover': { backgroundColor: 'error.dark' },
                                                }}
                                            >
                                                Xoá
                                            </Button>
                                        </Stack>
                                    </>
                                )}
                            </Popover>

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
                            <CopyCardPopUp
                                ref={copyCardPopUpRef}
                                card={card}
                            />

                            <MoveCardPopUp
                                ref={moveCardPopUpRef}
                                card={card}
                            />
                        </>
                    )}
                </Dialog>
            </CommentProvider>
        </AttachmentsProvider>
    );
};

export default Card_detail;
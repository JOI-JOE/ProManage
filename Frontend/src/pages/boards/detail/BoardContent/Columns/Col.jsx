import React, { memo, useState } from "react";
import {
    Box,
    Button,
    TextField,
    Tooltip,
    Typography,
    Menu,
    MenuItem,
    Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
    Archive as ArchiveIcon,
    Close as CloseIcon,
    ContentCopy as ContentCopyIcon,
    DeleteForever as DeleteForeverIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    AddCard as AddCardIcon,
} from "@mui/icons-material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import CopyColumn from "./Col_option/CoppyColumn";
import ConfirmDeleteDialog from "./Col_option/DeleteColumn";
import ArchiveColumnDialog from "./Col_option/Archive";
import Card_list from "../Cards/Card_list";

const StyledMenu = styled(Menu)(({ theme }) => ({
    "& .MuiPaper-root": {
        borderRadius: 6,
        marginTop: theme.spacing(1),
        minWidth: 180,
        color: "rgb(55, 65, 81)",
        boxShadow:
            "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    },
}));

const Col = memo(({ list = { id: "", name: "Untitled", cards: [] }, isDragging: externalIsDragging }) => {
    const [title, setTitle] = useState(list?.name || "Untitled");
    const [isEditing, setIsEditing] = useState(false);
    const [cards, setCards] = useState(list?.cards || []);

    const [dialogs, setDialogs] = useState({ copy: false, delete: false, archive: false });
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [openCard, setOpenCard] = useState(false);
    const [cardName, setCardName] = useState("");

    const toggleDialog = (type, value) => setDialogs(prev => ({ ...prev, [type]: value }));
    const handleMenu = (event) => setMenuAnchor(event.currentTarget);
    const closeMenu = () => setMenuAnchor(null);

    const handleTitleUpdate = (e) => {
        if (e.type === "blur" || (e.key === "Enter" && e.type === "keydown")) {
            setIsEditing(false);
            if (title.trim()) {
                list.name = title; // Cập nhật tiêu đề trong list
            }
        }
    };

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: list?.id || "default-col", // Đảm bảo id là duy nhất
        data: {
            type: 'column', // Quan trọng: Đảm bảo type là "column"
            list, // Thêm thông tin cần thiết
        },
    });

    const dndKitColumnStyles = {
        transform: CSS.Transform.toString(transform),
        transition,
        height: "100%",
        opacity: isDragging ? 0.5 : undefined,
        cursor: isDragging ? "grabbing" : "grab"
    };

    const finalIsDragging = externalIsDragging !== undefined ? externalIsDragging : isDragging;

    return (
        <div ref={setNodeRef} style={dndKitColumnStyles} {...attributes} {...listeners}>
            <Box
                sx={{
                    minWidth: "300px",
                    maxWidth: "300px",
                    ml: 2,
                    borderRadius: "6px",
                    height: "fit-content",
                    bgcolor: (theme) => (theme.palette.mode === "dark" ? "#333643" : "#ebecf0"),
                    opacity: finalIsDragging ? 0.5 : 1,
                    '&:hover': {
                        bgcolor: (theme) => (theme.palette.mode === "dark" ? "#3f4251" : "#e3e5e8")
                    }
                }}
            >
                {/* Header */}
                <Box sx={{
                    height: (theme) => theme.trello.columnHeaderHeight,
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {isEditing ? (
                        <TextField
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleTitleUpdate}
                            onKeyDown={handleTitleUpdate}
                            size="small"
                            variant="outlined"
                            autoFocus
                            fullWidth
                        />
                    ) : (
                        <Typography
                            variant="h6"
                            sx={{
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                            onClick={() => setIsEditing(true)}
                        >
                            {title}
                        </Typography>
                    )}
                    <Tooltip title="More options">
                        <KeyboardArrowDownIcon
                            sx={{ cursor: 'pointer' }}
                            onClick={handleMenu}
                        />
                    </Tooltip>
                </Box>

                {/* Danh sách Card */}
                <Card_list
                    listId={list?.id} // Truyền listId trực tiếp, không cần xử lý mặc định ở đây
                    cards={cards || []} // Sử dụng mảng rỗng nếu cards là null hoặc undefined
                />

                {/* Footer */}
                <Box sx={{ p: 2 }}>
                    {openCard ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                size="small"
                                placeholder="Enter card title..."
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                fullWidth
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => {
                                    if (cardName.trim()) {
                                        const newCard = {
                                            id: `card-${Date.now()}`,
                                            title: cardName,
                                            list_board_id: list?.id || "default-column",
                                            position: cards.length + 1
                                        };
                                        setCards([...cards, newCard]);
                                        setOpenCard(false);
                                        setCardName('');
                                    }
                                }}
                            >
                                Add
                            </Button>
                            <CloseIcon
                                sx={{ cursor: 'pointer' }}
                                onClick={() => {
                                    setOpenCard(false);
                                    setCardName('');
                                }}
                            />
                        </Box>
                    ) : (
                        <Button
                            startIcon={<AddCardIcon />}
                            onClick={() => setOpenCard(true)}
                            fullWidth
                            sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}
                        >
                            Add a card
                        </Button>
                    )}
                </Box>

                {/* Menu */}
                <StyledMenu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={closeMenu}
                >
                    <MenuItem onClick={() => { toggleDialog("copy", true); closeMenu(); }}>
                        <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
                        Copy list
                    </MenuItem>
                    <MenuItem onClick={() => { toggleDialog("archive", true); closeMenu(); }}>
                        <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
                        Archive list
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => { toggleDialog("delete", true); closeMenu(); }} sx={{ color: 'error.main' }}>
                        <DeleteForeverIcon fontSize="small" sx={{ mr: 1 }} />
                        Delete list
                    </MenuItem>
                </StyledMenu>

                {/* Dialogs */}
                <CopyColumn
                    open={dialogs.copy}
                    onClose={() => toggleDialog("copy", false)}
                    list={list}
                />
                <ConfirmDeleteDialog
                    open={dialogs.delete}
                    onClose={() => toggleDialog("delete", false)}
                    list={list}
                />
                <ArchiveColumnDialog
                    open={dialogs.archive}
                    onClose={() => toggleDialog("archive", false)}
                    listName={list?.name || "Untitled"}
                />
            </Box>
        </div>
    );
});

export default Col;
import React, { useMemo, useState } from "react";
import { Box, TextField, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ArchiveIcon from "@mui/icons-material/Archive";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { mapOrder } from "../../../../../../utils/sort";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "react-toastify";
import CopyColumn from "./Col_option/CoppyColumn";
import ConfirmDeleteDialog from "./Col_option/DeleteColumn";
import ArchiveColumnDialog from "./Col_option/Archive";
import Card_list from "../Cards/Card_list";
import Card_new from "../Cards/Card_new";
import { useCreateCard } from "../../../../../hooks/useCard";

const StyledMenu = styled((props) => (
    <Menu
        elevation={0}
        anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
        }}
        transformOrigin={{
            vertical: "top",
            horizontal: "center",
        }}
        {...props}
    />
))(({ theme }) => ({
    "& .MuiPaper-root": {
        borderRadius: 6,
        marginTop: theme.spacing(1),
        minWidth: 180,
        color: "rgb(55, 65, 81)",
        boxShadow:
            "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
        "& .MuiMenu-list": {
            padding: "4px 0",
        },
        "& .MuiMenuItem-root": {
            "& .MuiSvgIcon-root": {
                fontSize: 18,
                color: "#000",
                marginRight: theme.spacing(1.5),
            },
            "&:active": {},
        },
        ...theme.applyStyles("dark", {
            color: theme.palette.grey[300],
        }),
    },
}));

const Col = ({ column }) => {
    const [openCopyDialog, setOpenCopyDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
    const [openCard, setOpenCard] = useState(false);
    const [title, setTitle] = useState(column?.title);
    const [isEditing, setIsEditing] = useState(false);
    const [prevTitle, setPrevTitle] = useState(column?.title);
    const [anchorEl, setAnchorEl] = useState(null);

    const { mutateAsync } = useCreateCard();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: column.id, data: { ...column } });

    const columnStyle = {
        transform: CSS.Translate.toString(transform),
        transition,
        height: "100%",
        opacity: isDragging ? 0.5 : undefined,
    };

    const open = Boolean(anchorEl);

    //============================================================ COPY======================================================
    const handleCopyClick = () => {
        setOpenCopyDialog(true);
        setAnchorEl(null);
    };

    const handleCopyConfirm = (newTitle) => {
        console.log("Cột đã sao chép với tên mới:", newTitle);
        setOpenCopyDialog(false);
    };

    //============================================================ REMOVE======================================================
    const handleDeleteClick = () => {
        setOpenDeleteDialog(true);
        setAnchorEl(null);
    };

    const handleDeleteConfirm = () => {
        console.log("Cột đã bị xóa");
        setOpenDeleteDialog(false);
    };

    //============================================================ ARCHIVE======================================================
    const handleArchiveClick = () => {
        setOpenArchiveDialog(true);
        setAnchorEl(null);
    };

    const handleArchiveConfirm = async () => {
        try {
            await updateClosed(column.id);
            toast.success(`Cột "${column.title}" đã được lưu trữ.`);
        } catch (error) {
            toast.error("Có lỗi xảy ra khi lưu trữ cột.");
        }
        setOpenArchiveDialog(false);
    };

    //======================================== Thêm card mới========================================
    const handleAddCard = async (cardName) => {
        if (!cardName.trim()) {
            toast.error("Nhập tên thẻ!");
            return;
        }

        if (!column?.id) {
            toast.error("Không xác định được ID của cột!");
            return;
        }

        const cards = column.cards || [];

        const calculatePosition = () => {
            if (cards.length) {
                return Math.max(...cards.map((card) => card.position)) + 1000;
            }
            return 1000;
        };

        const newCard = {
            id: Date.now(), // ID tạm thời
            title: cardName,
            columnId: column.id,
            position: calculatePosition(),
        };

        const optimisticCards = [...cards, newCard].sort(
            (a, b) => a.position - b.position
        );

        try {
            const response = await mutateAsync({
                title: cardName,
                columnId: column.id,
                position: newCard.position,
            });

            // Cập nhật lại state với dữ liệu từ API
            const updatedCards = optimisticCards.map((card) =>
                card.id === newCard.id ? response : card
            );

            // Gọi hàm cập nhật từ context để cập nhật board
            // updateListName(column.id, { cards: updatedCards });
        } catch (error) {
            console.error("Lỗi khi thêm thẻ:", error);
            toast.error(`Thêm thẻ thất bại: ${error.message}`);
        }
    };

    //======================================== Sửa tiêu đề========================================
    const handleTitleClick = () => {
        setIsEditing(true);
    };

    const handleTitleUpdate = async (e) => {
        if (e.type === "blur" || (e.type === "keydown" && e.key === "Enter")) {
            if (!title.trim()) {
                setTitle(prevTitle);
            } else {
                setPrevTitle(title);
                await updateListName(column.id, { title });
            }
            setIsEditing(false);
        }
    };

    //======================================== Dropdown========================================
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    //======================================== Render========================================
    const cardOrderIds = useMemo(() => column?.cards?.map(card => card.id) || [], [column?.cards]);

    const orderedCards = useMemo(() => {
        if (!column?.cards || !cardOrderIds.length) return [];
        return mapOrder(column.cards, cardOrderIds, "id");
    }, [column?.cards, cardOrderIds]);

    return (
        <div ref={setNodeRef} style={columnStyle} {...attributes}>
            <Box
                {...listeners}
                sx={{
                    minWidth: "245px",
                    maxWidth: "245px",
                    backgroundColor: "#dcdde1",
                    ml: 2,
                    borderRadius: "6px",
                    height: "fit-content",
                }}
            >
                {/* Column Header */}
                <Box
                    sx={{
                        height: (theme) => theme.trello.columnFooterHeight,
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    {isEditing ? (
                        <TextField
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onFocus={() => setPrevTitle(title)}
                            onBlur={handleTitleUpdate}
                            onKeyDown={handleTitleUpdate}
                            autoFocus
                            variant="outlined"
                            size="small"
                            sx={{
                                height: "20px",
                                width: "200px",
                                "& .MuiInputBase-input": {
                                    fontSize: "0.765rem",
                                    padding: "4px",
                                },
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": {
                                        borderColor: "teal",
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "teal",
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "teal",
                                    },
                                },
                            }}
                        />
                    ) : (
                        <Typography
                            sx={{
                                fontWeight: "bold",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                color: "#333",
                            }}
                            onClick={handleTitleClick}
                        >
                            {title}
                        </Typography>
                    )}

                    <Box>
                        <Tooltip title="More option">
                            <KeyboardArrowDownIcon
                                sx={{ color: "secondary.main", cursor: "pointer" }}
                                id="basic-column-dropdown"
                                aria-controls={open ? "basic-menu-column-dropdown" : undefined}
                                aria-haspopup="true"
                                aria-expanded={open ? "true" : undefined}
                                onClick={handleClick}
                            />
                        </Tooltip>

                        <StyledMenu
                            id="demo-customized-menu-workspace"
                            MenuListProps={{
                                "aria-labelledby": "basic-column-dropdown",
                            }}
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            {...(!open && { inert: "true" })}
                        >
                            <MenuItem
                                onClick={handleCopyClick}
                                disableRipple
                                sx={{ fontSize: "0.85rem", color: "secondary.main" }}
                            >
                                <ContentCopyIcon />
                                Copy
                            </MenuItem>
                            <MenuItem
                                onClick={handleClose}
                                disableRipple
                                sx={{ fontSize: "0.85rem", color: "secondary.main" }}
                            >
                                <VisibilityIcon />
                                Theo dõi
                            </MenuItem>

                            <Divider sx={{ my: 0.5 }} />

                            <MenuItem
                                onClick={handleArchiveClick}
                                disableRipple
                                sx={{ fontSize: "0.85rem", color: "secondary.main" }}
                            >
                                <ArchiveIcon />
                                Archive this column
                            </MenuItem>

                            <MenuItem
                                onClick={handleDeleteClick}
                                disableRipple
                                sx={{ fontSize: "0.85rem", color: "secondary.main" }}
                            >
                                <DeleteForeverIcon />
                                Remove this column
                            </MenuItem>
                        </StyledMenu>
                    </Box>
                </Box>

                {/* Column List Card */}
                <Card_list cards={orderedCards} />

                {/* Column Footer */}
                <Card_new openCard={openCard} setOpenCard={setOpenCard} addCard={handleAddCard} />
            </Box>

            {/* Dialogs */}
            <ArchiveColumnDialog
                open={openArchiveDialog}
                onClose={() => setOpenArchiveDialog(false)}
                onConfirm={handleArchiveConfirm}
            />

            <CopyColumn
                open={openCopyDialog}
                onClose={() => setOpenCopyDialog(false)}
                onCopy={handleCopyConfirm}
            />

            <ConfirmDeleteDialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
};

export default Col;
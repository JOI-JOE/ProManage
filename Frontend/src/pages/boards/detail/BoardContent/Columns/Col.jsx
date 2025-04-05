import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Box,
    TextField,
    Tooltip,
    Typography,
    Button,
    Snackbar
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ArchiveIcon from "@mui/icons-material/Archive";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import VisibilityIcon from "@mui/icons-material/Visibility";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { mapOrder } from "../../../../../../utils/sort";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "react-toastify";
import CopyColumn from "./Col_option/CoppyColumn";
import ConfirmDeleteDialog from "./Col_option/DeleteColumn";
import ArchiveColumnDialog from "./Col_option/Archive";
import Card_list from "../Cards/Card_list";
import Card_new from "../Cards/Card_new";
import { v4 as uuidv4 } from "uuid";
import { useCreateCard } from "../../../../../hooks/useCard";
import { useUpdateListClosed, useUpdateListName } from "../../../../../hooks/useList";

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

const Col = ({ column, onArchive }) => {
    const [openCopyDialog, setOpenCopyDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
    const [openCard, setOpenCard] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    // Thông báo
    const [showAlert, setShowAlert] = useState(false);

    // Lưu trữ thông tin cột đã lưu trữ
    const archivedColumnRef = useRef(null);
    const [archivedColumn, setArchivedColumn] = useState(null);

    // Api của list
    const [tempName, setTempName] = useState(column?.name);
    const [isEditing, setIsEditing] = useState(false);
    const { mutate: updateList } = useUpdateListName();

    // Api lưu trữ
    const { mutate: closeList } = useUpdateListClosed();

    /// Api của card
    const createCardMutation = useCreateCard();
    const [cardName, setCardName] = useState("");
    const [localCards, setLocalCards] = useState(column?.cards || []);



    useEffect(() => {
        setLocalCards(column?.cards || []); // Chỉ theo dõi sự thay đổi của cards
    }, [column?.cards]);

    //======================================== Thêm card mới========================================
    const handleAddCard = async (cardName) => {
        if (!cardName.trim()) return;

        const tempId = `temp-${uuidv4()}`;
        const newCard = {
            id: tempId, // ID tạm thời
            title: cardName,
            columnId: column.id,
            position: localCards.length
                ? Math.max(...localCards.map((ca) => ca.position)) + 1000
                : 1000,
        };

        setLocalCards((prev = []) => [...prev, newCard]); // 🔥 Đảm bảo prev luôn là mảng
        setCardName("");

        try {
            await createCardMutation.mutateAsync(newCard);
        } catch (error) {
            console.error("Lỗi khi thêm thẻ:", error);
            setLocalCards((prev = []) => prev.filter((card) => card.id !== tempId)); // Rollback nếu lỗi
        }
    };
    // ---------------------------------------------------------------------------------------------

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: column?.id, data: { ...column } });

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
        setOpenArchiveDialog(false);
        try {
            // Gọi API để lưu trữ cột
            onArchive(column.id);
            setShowAlert(true);
            await closeList({
                listId: column.id,
                closed: 1,
            });

        } catch (error) {
            console.error("Lỗi khi lưu trữ:", error);
            toast.error("Có lỗi xảy ra khi lưu trữ cột.");
            setShowAlert(false); // Tắt alert khi có lỗi
        }
    };
    //======================================== Sửa tiêu đề========================================
    useEffect(() => {
        if (column?.name !== tempName) {
            setTempName(column?.name || '');
        }
    }, [column?.name]);

    const handleTitleClick = () => {
        setIsEditing(true);
        setTempName(column?.name);
    };

    const handleKeyDown = async (e) => {
        if (e.key === "Enter") {
            await handleUpdate();
        } else if (e.key === "Escape") {
            setTempName(column?.name);
            setIsEditing(false);
        }
    };

    const handleBlur = async () => {
        await handleUpdate();
    };

    const handleUpdate = async () => {
        const newName = tempName.trim();

        if (!newName) {
            setTempName(column?.name);
            setIsEditing(false);
            return;
        }

        if (newName !== column?.name) {
            try {
                await updateList({ listId: column.id, newName });
            } catch (error) {
                console.error("Lỗi khi cập nhật tên cột:", error);
                setTempName(column?.name);
            }
        }

        setIsEditing(false);
    };

    //======================================== Dropdown========================================
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    //======================================== ALERT ========================================

    //======================================== Render========================================
    const cardOrderIds = useMemo(() => localCards.map(card => card.id) || [], [localCards]);

    const orderedCards = useMemo(() => {
        if (!localCards.length || !cardOrderIds.length) return [];
        return mapOrder(localCards, cardOrderIds, "id");
    }, [localCards, cardOrderIds]);

    return (
        <div ref={setNodeRef} style={columnStyle} {...attributes} >
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
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            variant="outlined"
                            size="bold"
                            sx={{
                                height: "10px",
                                width: "200px",
                                "& .MuiInputBase-input": {
                                    fontSize: "0.765rem",
                                    padding: "4px",
                                },
                                "& .MuiInputBase-input": {
                                    fontSize: "0.765rem",
                                    padding: "10px", // Căn chỉnh padding để text không bị lệch
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
                            onClick={handleTitleClick}
                            sx={{
                                fontWeight: "bold",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                color: "#333",
                            }}
                        >
                            {tempName}
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
                            id="column-actions-menu"
                            MenuListProps={{
                                "aria-labelledby": "column-actions-button",
                            }}
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right",
                            }}
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "left",
                            }}
                            sx={{
                                mt: 1,
                                "& .MuiPaper-root": {
                                    minWidth: "240px",
                                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                                    borderRadius: "8px",
                                    padding: "4px 0",
                                }
                            }}
                        >
                            {/* Nhóm thao tác chính */}
                            <MenuItem sx={{ fontSize: "14px", px: 2, py: 1 }}>
                                {/* <ListItemIcon>
                                    <AddIcon fontSize="small" />
                                </ListItemIcon> */}
                                Thêm thẻ
                            </MenuItem>

                            <MenuItem sx={{ fontSize: "14px", px: 2, py: 1 }}>
                                {/* <ListItemIcon>
                                    <ContentCopyIcon fontSize="small" />
                                </ListItemIcon> */}
                                Sao chép danh sách
                            </MenuItem>

                            <MenuItem sx={{ fontSize: "14px", px: 2, py: 1 }}>
                                {/* <ListItemIcon>
                                    <DriveFileMoveIcon fontSize="small" />
                                </ListItemIcon> */}
                                Di chuyển danh sách
                            </MenuItem>

                            <MenuItem sx={{ fontSize: "14px", px: 2, py: 1 }}>
                                {/* <ListItemIcon>
                                    <ListAltIcon fontSize="small" />
                                </ListItemIcon> */}
                                Di chuyển tất cả thẻ trong danh sách này
                            </MenuItem>

                            <MenuItem sx={{ fontSize: "14px", px: 2, py: 1 }}>
                                {/* <ListItemIcon>
                                    <SortIcon fontSize="small" />
                                </ListItemIcon> */}
                                Sắp xếp theo...
                            </MenuItem>

                            <Divider sx={{ my: 0.5 }} />

                            {/* Nhóm lưu trữ */}
                            <MenuItem
                                onClick={handleArchiveClick}
                                sx={{
                                    fontSize: "14px",
                                    px: 2,
                                    py: 1,
                                }}
                            >
                                {/* <ListItemIcon sx={{ color: "inherit" }}>
                                    <ArchiveIcon fontSize="small" />
                                </ListItemIcon> */}
                                Lưu trữ danh sách này
                            </MenuItem>

                            <MenuItem
                                // onClick={handleArchiveAllCards}
                                sx={{
                                    fontSize: "14px",
                                    px: 2,
                                    py: 1,
                                }}
                            >
                                {/* <ListItemIcon sx={{ color: "inherit" }}>
                                    <ArchiveIcon fontSize="small" />
                                </ListItemIcon> */}
                                Lưu trữ tất cả các thẻ trong danh sách này
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



            {/* <CopyColumn
                open={openCopyDialog}
                onClose={() => setOpenCopyDialog(false)}
                onCopy={handleCopyConfirm}
            /> */}

            <ConfirmDeleteDialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={handleDeleteConfirm}
            />
        </div >


    );
};

export default Col;
import React, { useEffect, useMemo, useState } from "react";
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
import { v4 as uuidv4 } from "uuid";
import { useCreateCard } from "../../../../../hooks/useCard";
import { useParams } from "react-router-dom";
import { useDuplicateList, useListsClosed, useUpdateListName } from "../../../../../hooks/useList";

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
    const { boardId } = useParams();
    // const { mutate: updateList } = useUpdateListName(boardId);
    const updateListNameMutation = useUpdateListName(); // dùng custom hook bạn đã tạo

    const { listsClosed, updateClosedMutation, deleteMutation } = useListsClosed(boardId);
    const { mutate: duplicateListMutate, isPending } = useDuplicateList(boardId);



    const [openCopyDialog, setOpenCopyDialog] = useState(false);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
    const [openCard, setOpenCard] = useState(false);

    const [title, setTitle] = useState(column?.title);
    const [isEditing, setIsEditing] = useState(false);
    const [prevTitle, setPrevTitle] = useState(column?.title);
    const [anchorEl, setAnchorEl] = useState(null);

    const createCardMutation = useCreateCard();
    const [cardName, setCardName] = useState("");
    const [localCards, setLocalCards] = useState(column?.cards || []);

    useEffect(() => {
        setLocalCards(column?.cards || []); // Chỉ theo dõi sự thay đổi của cards
    }, [column?.cards]);

    //======================================== Thêm card mới========================================
    const handleAddCard = async (cardName) => {
        if (!cardName.trim()) return;

        const newCard = {
            // id: tempId, // ID tạm thời
            title: cardName,
            columnId: column.id,
            position: localCards.length
                ? Math.max(...localCards.map((ca) => ca.position)) + 1000
                : 1000,
            boardId: boardId,
        };

        // setLocalCards((prev = []) => [...prev, newCard]); // 🔥 Đảm bảo prev luôn là mảng
        setCardName("");

        try {
            await createCardMutation.mutateAsync(newCard);
        } catch (error) {
            console.error("Lỗi khi thêm thẻ:", error);
            setLocalCards((prev = []) => prev.filter((card) => card.id !== tempId)); // Rollback nếu lỗi
        }
    };

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
    // duplicateMutation
    const handleCopyConfirm = (newTitle) => {
        console.log("Cột đã sao chép với tên mới:", newTitle);

        // Gửi mutation để sao chép
        duplicateListMutate({ listId: column.id, name: newTitle });

        // Đóng dialog
        setOpenCopyDialog(false);
    };

    //============================================================ REMOVE======================================================
    const handleDeleteClick = () => {
        setOpenDeleteDialog(true);
        setAnchorEl(null);
    };

    const handleDeleteConfirm = () => {
        deleteMutation.mutate(column.id, {
            onSuccess: () => {
                toast.success(`Cột "${column.title}" đã bị xoá.`);
                setOpenArchiveDialog(false);
            },
            onError: () => {
                toast.error("Có lỗi xảy ra khi lưu trữ cột.");
            },
        });
    };

    const handleTitleUpdate = (e) => {
        if (e.type === "blur" || (e.type === "keydown" && e.key === "Enter")) {
          if (!title.trim()) {
            setTitle(prevTitle);
          } else {
            // Gửi mutation để update tên list
            updateListNameMutation.mutate({
              listId: column.id,
              newName: title,
            });
      
            setPrevTitle(title);
          }
      
          setIsEditing(false);
        }
      };
      

    // const handleDeleteConfirm = (id) => {
    //     const confirmDelete = window.confirm("Bạn có chắc muốn xóa danh sách này?");
    //     if (confirmDelete) {
    //       deleteMutation.mutate(id, {
    //         onSuccess: () => {
    //           toast.success("Xóa danh sách thành công!");
    //         },
    //         onError: () => {
    //           toast.error("Xóa danh sách thất bại!");
    //         },
    //       });
    //     }
    //   };
    //============================================================ ARCHIVE======================================================
    const handleArchiveClick = () => {
        setOpenArchiveDialog(true);
        setAnchorEl(null);
    };

    const handleArchiveConfirm = () => {
        updateClosedMutation.mutate(column.id, {
            onSuccess: () => {
                toast.success(`Cột "${column.title}" đã được lưu trữ.`);
                setOpenArchiveDialog(false);
            },
            onError: () => {
                toast.error("Có lỗi xảy ra khi lưu trữ cột.");
            },
        });
    };

    //======================================== Sửa tiêu đề========================================
    const handleTitleClick = () => {
        setIsEditing(true);
    };




    //======================================== Dropdown========================================
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

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
                            {/* <MenuItem
                                onClick={handleClose}
                                disableRipple
                                sx={{ fontSize: "0.85rem", color: "secondary.main" }}
                            >
                                <VisibilityIcon />
                                Theo dõi
                            </MenuItem> */}

                            <Divider sx={{ my: 0.5 }} />

                            <MenuItem
                                onClick={handleArchiveClick}
                                disableRipple
                                sx={{ fontSize: "0.85rem", color: "secondary.main" }}
                            >
                                <ArchiveIcon />
                              Lưu trữ
                            </MenuItem>

                            <MenuItem
                                onClick={handleDeleteClick}
                                disableRipple
                                sx={{ fontSize: "0.85rem", color: "secondary.main" }}
                            >
                                <DeleteForeverIcon />
                               Xoá
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
                defaultTitle={column.title}
                onClose={() => setOpenCopyDialog(false)}
                onCopy={handleCopyConfirm}
                isLoading={isPending}

            />

            <ConfirmDeleteDialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={handleDeleteConfirm}
            />
        </div >
    );
};

export default Col;
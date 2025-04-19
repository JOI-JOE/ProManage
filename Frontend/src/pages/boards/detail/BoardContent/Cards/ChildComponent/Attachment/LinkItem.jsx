import React, { useState } from "react";
import {
    ListItem,
    IconButton,
    Box,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button,
    Typography,
    CircularProgress
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useAttachments } from '../../../../../../../contexts/AttachmentsContext'; // Adjust path

// Hàm lấy domain từ link
const getDomain = (url) => {
    try {
        const { hostname } = new URL(url);
        return hostname;
    } catch (e) {
        return "";
    }
};

const LinkItem = ({ file }) => {
    const { handleDeleteLink, handleEditLink, refetchAttachment } = useAttachments();
    const domain = getDomain(file.path_url);
    const [anchorEl, setAnchorEl] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); // State for delete loading
    const [isEditing, setIsEditing] = useState(false); // New state for edit loading
    const [editedLink, setEditedLink] = useState({
        url: file.path_url,
        displayText: file.file_name_defaut
    });
    const open = Boolean(anchorEl);
    // Xử lý menu
    const handleMenuClick = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    // Xử lý dialog chỉnh sửa
    const handleEditDialogOpen = () => {
        setEditDialogOpen(true);
        handleMenuClose();
    };
    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
    };
    const handleDeleteDialogOpen = () => {
        setDeleteDialogOpen(true);
        handleMenuClose();
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
    };
    const handleSaveEdit = async () => {
        setIsEditing(true); // Start loading
        try {
            await handleEditLink(file.id, editedLink.displayText || editedLink.url, editedLink.url);
            refetchAttachment();
            handleEditDialogClose(); // Close dialog on success
        } catch (error) {
            console.error("Failed to save edited link:", error);
        } finally {
            setIsEditing(false); // Stop loading
        }
    };
    const handleConfirmDelete = async () => {
        setIsDeleting(true); // Start loading
        try {
            await handleDeleteLink(file.id); // Perform delete operation
            refetchAttachment();
            handleDeleteDialogClose(); // Close dialog on success
        } catch (error) {
            console.error("Failed to delete link:", error);
        } finally {
            setIsDeleting(false); // Stop loading
        }
    };

    // Xử lý thay đổi input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedLink(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <>
            <ListItem
                key={file.id}
                sx={{
                    backgroundColor: "#DFE1E6",
                    borderRadius: "8px",
                    p: 0.1,
                    px: 2,
                    mb: 0.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "background-color 0.3s ease-in-out",
                    "&:hover": {
                        backgroundColor: "#EBECF0",
                    },
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", flex: 1, overflow: "hidden" }}>
                    {/* Favicon */}
                    <img
                        src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
                        alt="favicon"
                        style={{
                            width: "16px",
                            height: "16px",
                            marginRight: "8px",
                            flexShrink: 0,
                        }}
                    />

                    {/* Link */}
                    <Box
                        component="a"
                        href={file.path_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={file.file_name_defaut}
                        sx={{
                            color: "#0052CC",
                            fontSize: "14px",
                            textDecoration: "underline",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flexGrow: 1,
                        }}
                    >
                        {file.file_name_defaut}
                    </Box>
                </Box>

                {/* Icon ba chấm */}
                <IconButton
                    onClick={handleMenuClick}
                    size="small"
                    sx={{ ml: 1 }}
                >
                    <MoreHorizIcon fontSize="small" sx={{ color: "#6b778c" }} />
                </IconButton>

                {/* Popup Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    sx={{
                        "& .MuiPaper-root": {
                            borderRadius: "4px",
                            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                            minWidth: "120px",
                        }
                    }}
                >
                    <MenuItem onClick={handleEditDialogOpen} sx={{ fontSize: '14px', py: 0.7 }}>
                        Sửa
                    </MenuItem>
                    <MenuItem
                        onClick={handleDeleteDialogOpen}
                        sx={{
                            fontSize: '14px',
                            py: 0.7,
                            color: '#FF5630',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 86, 48, 0.04)'
                            }
                        }}
                    >
                        Xoá
                    </MenuItem>
                </Menu>
            </ListItem>

            {/* Dialog chỉnh sửa liên kết */}
            <Dialog
                open={editDialogOpen}
                onClose={handleEditDialogClose}
                maxWidth="sm"
                fullWidth
                sx={{
                    "& .MuiPaper-root": {
                        borderRadius: "8px",
                        padding: "16px",
                    }
                }}
            >
                <DialogTitle sx={{ p: 0, fontSize: "16px", fontWeight: 500 }}>
                    Sửa tệp đính kèm
                </DialogTitle>

                <DialogContent sx={{ p: 0, mt: 2 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                            Tìm kiếm hoặc dán liên kết
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            name="url"
                            value={editedLink.url}
                            onChange={handleInputChange}
                            disabled={isEditing}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "4px",
                                }
                            }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                            Văn bản hiển thị (không bắt buộc)
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            name="displayText"
                            value={editedLink.displayText}
                            onChange={handleInputChange}
                            disabled={isEditing}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "4px",
                                }
                            }}
                        />
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 0, mt: 3 }}>
                    <Button
                        onClick={handleEditDialogClose}
                        disabled={isEditing}
                        sx={{
                            color: "#42526E",
                            textTransform: "none",
                            fontWeight: 500,
                        }}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSaveEdit}
                        variant="contained"
                        disabled={isEditing}
                        sx={{
                            backgroundColor: "#0052CC",
                            color: "white",
                            textTransform: "none",
                            fontWeight: 500,
                            "&:hover": {
                                backgroundColor: "#0747A6",
                            },
                            display: "flex",
                            alignItems: "center",
                            gap: 1
                        }}
                    >
                        {isEditing ? (
                            <>
                                <CircularProgress size={16} sx={{ color: "white" }} />
                                Đang lưu...
                            </>
                        ) : (
                            "Lưu"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog xác nhận xóa */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteDialogClose}
                maxWidth="xs"
                fullWidth
                sx={{
                    "& .MuiPaper-root": {
                        borderRadius: "8px",
                        padding: "16px",
                    }
                }}
            >
                <DialogTitle sx={{ p: 0, fontSize: "16px", fontWeight: 500 }}>
                    Xác nhận xóa
                </DialogTitle>

                <DialogContent sx={{ p: 0, mt: 2 }}>
                    <Typography variant="body2">
                        Bạn có chắc chắn muốn xóa liên kết này?
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ p: 0, mt: 3 }}>
                    <Button
                        onClick={handleDeleteDialogClose}
                        disabled={isDeleting}
                        sx={{
                            color: "#42526E",
                            textTransform: "none",
                            fontWeight: 500,
                        }}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        disabled={isDeleting}
                        sx={{
                            backgroundColor: "#FF5630",
                            color: "white",
                            textTransform: "none",
                            fontWeight: 500,
                            "&:hover": {
                                backgroundColor: "#DE350B",
                            },
                            display: "flex",
                            alignItems: "center",
                            gap: 1
                        }}
                    >
                        {isDeleting ? (
                            <>
                                <CircularProgress size={16} sx={{ color: "white" }} />
                                Đang xóa...
                            </>
                        ) : (
                            "Xóa"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default LinkItem;
import React, { useState, useCallback, useMemo } from "react";
import {
    ListItem,
    IconButton,
    Box,
    Typography,
    MenuItem,
    Menu,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PanoramaIcon from "@mui/icons-material/Panorama";
import { useAttachments } from "../../../../../../../contexts/AttachmentsContext";
import LogoLoading from "../../../../../../../components/LogoLoading";
import SnackAlert from "../../Common/SnackAlert";

const FileItem = React.memo(({ file, handleOpen }) => {
    const { handleDeleteFile, handleEditFile, handleEditCover, refetchAttachment } = useAttachments();
    const [loading, setLoading] = useState(false);
    const [loadingCover, setLoadingCover] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    // const [isCover, setIsCover] = useState(file.is_cover);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [newFileName, setNewFileName] = useState(file.file_name_defaut || "");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const fileExt = useMemo(() => (
        file.path_url.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase() || "default"
    ), [file.path_url]);

    const isImage = useMemo(() => (
        ["jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff", "svg"].includes(fileExt)
    ), [fileExt]);

    const fileIcons = useMemo(() => ({
        pdf: "PDF",
        doc: "DOC",
        docx: "DOCX",
        xls: "XLS",
        xlsx: "XLSX",
        ppt: "PPT",
        pptx: "PPTX",
        rar: "RAR",
        zip: "ZIP",
        txt: "TXT",
        json: "JSON",
        jsx: "JSX",
        js: "JS",
        css: "CSS",
        html: "HTML",
        mp4: "MP4",
        mov: "MOV",
        avi: "AVI",
        mkv: "MKV",
        mp3: "MP3",
        wav: "WAV",
        flac: "FLAC",
        csv: "CSV",
        xml: "XML",
        md: "MD",
        py: "PY",
        java: "JAVA",
        cpp: "CPP",
        c: "C",
        ts: "TS",
        tsx: "TSX",
        php: "PHP",
        rb: "RB",
        sh: "SH",
        bat: "BAT",
        exe: "EXE",
        dmg: "DMG",
        iso: "ISO",
        ai: "AI",
        psd: "PSD",
        sketch: "SKETCH",
        fig: "FIG",
        default: "FILE",
    }), []);

    const formatDate = useCallback((dateStr) => {
        if (!dateStr) return "Không xác định";
        try {
            return new Date(dateStr).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        } catch (e) {
            return dateStr;
        }
    }, []);

    const handleClick = useCallback(() => {
        if (isImage && handleOpen) {
            handleOpen(file.path_url);
        }
    }, [isImage, handleOpen, file.path_url]);

    const handleMenuOpen = useCallback((event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    }, []);

    const handleMenuClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleDeleteClick = useCallback(() => {
        setOpenDeleteDialog(true);
        handleMenuClose();
    }, [handleMenuClose]);

    const handleDeleteConfirm = useCallback(async () => {
        if (loadingDelete) return;
        setLoadingDelete(true);
        try {
            await handleDeleteFile(file.id);
            await new Promise((resolve) => setTimeout(resolve, 50));
            await refetchAttachment();
            setOpenDeleteDialog(false);
        } catch (error) {
            setSnackbarMessage(error.message || "❌ Lỗi khi xóa tệp. Vui lòng thử lại.");
            setSnackbarOpen(true);
        } finally {
            setLoadingDelete(false);
        }
    }, [handleDeleteFile, file.id, loadingDelete]);

    const handleDeleteCancel = useCallback(() => {
        setOpenDeleteDialog(false);
    }, []);

    const handleEditClick = useCallback(() => {
        setNewFileName(file.file_name_defaut || "");
        setOpenEditDialog(true);
        handleMenuClose();
    }, [file.file_name_defaut, handleMenuClose]);

    const handleEditConfirm = useCallback(async () => {
        if (loading || !newFileName.trim() || newFileName.trim() === file.file_name_defaut?.trim()) {
            setOpenEditDialog(false);
            return;
        }
        setLoading(true);
        try {
            await handleEditFile(file.id, newFileName.trim());
            refetchAttachment();
            setOpenEditDialog(false);
        } catch (error) {
            setSnackbarMessage(error.message || "❌ Lỗi khi cập nhật tên tệp. Vui lòng thử lại.");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    }, [loading, newFileName, file.id, file.file_name_defaut, handleEditFile]);

    const handleEditCancel = useCallback(() => {
        setOpenEditDialog(false);
    }, []);

    const handleDownloadClick = useCallback(() => {
        window.open(file.path_url, "_blank");
        handleMenuClose();
    }, [file.path_url, handleMenuClose]);

    const handleCoverActionClick = useCallback(async () => {
        if (loadingCover) return;
        const newIsCover = !file.is_cover;
        setLoadingCover(true);
        try {
            await handleEditCover(file.id, newIsCover, null);
            refetchAttachment()
            handleMenuClose();
        } catch (error) {
            setSnackbarMessage(error.message || "❌ Lỗi khi cập nhật ảnh bìa. Vui lòng thử lại.");
            setSnackbarOpen(true);
        } finally {
            setLoadingCover(false);
        }
    }, [loadingCover, file.is_cover, file.id, handleEditCover, handleMenuClose]);

    const handleSnackbarClose = useCallback(() => {
        setSnackbarOpen(false);
    }, []);

    const open = Boolean(anchorEl);

    return (
        <>
            <ListItem
                sx={{
                    p: 0.5,
                    borderRadius: "8px",
                    mb: 0.5,
                    border: "1px solid #dfe1e6",
                    cursor: isImage ? "pointer" : "default",
                    alignItems: "flex-start",
                    position: "relative",
                    pr: 6,
                    transition: "background-color 0.3s ease-in-out",
                    backgroundColor: "#DFE1E6",
                    "&:hover": { backgroundColor: "#EBECF0" },
                }}
                onClick={handleClick}
                secondaryAction={
                    <Box
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            display: "flex",
                            alignItems: "center",
                            pl: 1,
                        }}
                    >
                        {isImage && (
                            <IconButton
                                edge="end"
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpen(file.path_url);
                                }}
                                sx={{ mr: 0.5 }}
                            >
                                <OpenInNewIcon fontSize="small" />
                            </IconButton>
                        )}
                        <IconButton edge="end" size="small" onClick={handleMenuOpen}>
                            <MoreVertIcon fontSize="small" />
                        </IconButton>
                    </Box>
                }
            >
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        flexShrink: 0,
                        borderRadius: "4px",
                        overflow: "hidden",
                        backgroundColor: isImage ? "transparent" : "#E1E3E6",
                        color: "#374151",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "12px",
                        mr: 2,
                        mt: 0.5,
                    }}
                >
                    {isImage ? (
                        <Box
                            component="img"
                            src={file.path_url}
                            alt={file.file_name_defaut}
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                                e.target.style.display = "none";
                                e.target.parentElement.innerText = fileIcons[fileExt] || fileIcons.default;
                                e.target.parentElement.style.backgroundColor = "#E1E3E6";
                            }}
                        />
                    ) : (
                        fileIcons[fileExt] || fileIcons.default
                    )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden", py: 0.5, pr: 3 }}>
                    <Typography
                        sx={{
                            fontWeight: "500",
                            fontSize: "14px",
                            wordBreak: "break-word",
                            whiteSpace: "normal",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            lineHeight: 1.4,
                        }}
                    >
                        {file.file_name_defaut || "Không có tên"}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "12px", color: "#5e6c84", mt: 0.5, display: "flex", alignItems: "center" }}>
                        {`Đã thêm ${file.addedTime || formatDate(file.created_at)}`}
                        {file.is_cover && (
                            <>
                                <PanoramaIcon sx={{ fontSize: "14px", ml: 1, verticalAlign: "middle" }} />
                                • Ảnh bìa
                            </>
                        )}
                    </Typography>
                </Box>
            </ListItem>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                sx={{ "& .MuiPaper-root": { borderRadius: "4px", boxShadow: "0 0 10px rgba(0,0,0,0.1)", minWidth: "120px" } }}
            >
                <Box sx={{ pointerEvents: loadingCover ? "none" : "auto", opacity: loadingCover ? 0.6 : 1 }}>
                    <MenuItem onClick={handleEditClick} sx={{ fontSize: "14px", py: 0.7 }}>
                        Sửa
                    </MenuItem>
                    <MenuItem onClick={handleDownloadClick} sx={{ fontSize: "14px", py: 0.7 }}>
                        Tải xuống
                    </MenuItem>
                    {isImage && (
                        <MenuItem onClick={handleCoverActionClick} sx={{ fontSize: "14px", py: 0.7 }}>
                            {loadingCover ? <LogoLoading scale={0.3} /> : file.is_cover ? "Loại bỏ ảnh bìa" : "Tạo ảnh bìa"}
                        </MenuItem>
                    )}
                    <MenuItem onClick={handleDeleteClick} sx={{ fontSize: "14px", py: 0.7, color: "#FF5630" }}>
                        Xoá
                    </MenuItem>
                </Box>
            </Menu>

            <Dialog
                open={openDeleteDialog}
                onClose={handleDeleteCancel}
                maxWidth="xs"
                fullWidth
                sx={{ "& .MuiPaper-root": { borderRadius: "8px", padding: "16px" } }}
            >
                <DialogTitle sx={{ p: 0, fontSize: "16px", fontWeight: 500 }}>
                    Xác nhận xóa
                </DialogTitle>
                <DialogContent sx={{ p: 0, mt: 2 }}>
                    <Typography variant="body2">
                        Bạn có chắc chắn muốn xóa file này?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 0, mt: 3 }}>
                    <Button
                        onClick={handleDeleteCancel}
                        sx={{ color: "#42526E", textTransform: "none", fontWeight: 500 }}
                        disabled={loadingDelete}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        sx={{
                            backgroundColor: "#FF5630",
                            color: "white",
                            textTransform: "none",
                            fontWeight: 500,
                            "&:hover": { backgroundColor: "#DE350B" },
                            minWidth: 100,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        disabled={loadingDelete}
                    >
                        {loadingDelete ? <LogoLoading scale={0.3} /> : "Xóa"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openEditDialog}
                onClose={handleEditCancel}
                sx={{ "& .MuiPaper-root": { borderRadius: "8px" } }}
            >
                <DialogTitle sx={{ fontSize: "16px", fontWeight: "500" }}>
                    Sửa tệp đính kèm
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Tên tệp"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        fullWidth
                        margin="normal"
                        sx={{
                            "& .MuiInputBase-input": { fontSize: "14px" },
                            "& .MuiInputLabel-root": { color: "#1f2937", fontSize: "14px" },
                            "& .MuiInputLabel-root.Mui-focused": { color: "#1f2937" },
                            width: "400px",
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    {loading ? (
                        <Box sx={{ ml: 1 }}>
                            <LogoLoading scale={0.3} />
                        </Box>
                    ) : (
                        <>
                            <Button onClick={handleEditCancel} sx={{ color: "#5e6c84" }}>
                                Hủy
                            </Button>
                            <Button
                                onClick={handleEditConfirm}
                                sx={{
                                    bgcolor: "#1976d2",
                                    color: "white",
                                    minWidth: 100,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    "&:hover": { bgcolor: "#1565c0" },
                                }}
                            >
                                Cập nhật
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            <SnackAlert
                open={snackbarOpen}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
                autoHideDuration={6000}
                severity="error"
            />
        </>
    );
});

export default FileItem;
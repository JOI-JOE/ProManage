import React, { useState, useRef, useEffect } from 'react';
import {
    Dialog,
    Button,
    TextField,
    Box,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    CircularProgress,
    Snackbar,
    Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AttachmentIcon from '@mui/icons-material/Attachment';
import ComputerIcon from '@mui/icons-material/Computer';
import { useAttachments } from '../../../../../../../contexts/AttachmentsContext';

const AttachmentMenu = ({ open, onClose, onAlert }) => {
    const [linkText, setLinkText] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [uploadError, setUploadError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
    const [uploadingSnackbarOpen, setUploadingSnackbarOpen] = useState(false);
    const fileInputRef = useRef(null);
    const { attachments, isLoading, cardId, handleUploadNewFiles, handleAddNewLinks } = useAttachments();

    useEffect(() => {
        if (searchTerm) {
            const results = attachments.files.filter((file) =>
                file.file_name_defaut.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResults(results.slice(0, Math.max(4, results.length)));
        } else {
            setSearchResults(attachments.files.slice(-4));
        }
    }, [searchTerm, attachments.files]);

    useEffect(() => {
        if (uploadError) {
            setErrorSnackbarOpen(true);
        }
    }, [uploadError]);

    useEffect(() => {
        setUploadingSnackbarOpen(isUploading);
    }, [isUploading]);

    const handleCloseError = () => {
        setUploadError('');
        setErrorSnackbarOpen(false);
    };

    const handleChooseFile = () => {
        if (!isLoading) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event) => {
        const selectedFiles = Array.from(event.target.files);
        if (!selectedFiles || selectedFiles.length === 0) {
            setUploadError('Vui lòng chọn ít nhất một tệp.');
            if (onAlert) onAlert('Vui lòng chọn ít nhất một tệp.', 'error');
            return;
        }
        const maxSizeInBytes = 10240 * 1024; // 10MB
        const allowedFileTypes = [
            'image/jpeg',
            'image/png',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/x-rar-compressed',
            'application/zip',
            'text/csv',
            'application/vnd.oasis.opendocument.text',
            'application/vnd.oasis.opendocument.spreadsheet',
            'application/vnd.oasis.opendocument.presentation',
        ];

        const invalidFiles = selectedFiles.filter((file) => {
            if (file.size > maxSizeInBytes) return true;
            if (!allowedFileTypes.includes(file.type)) return true;
            return false;
        });

        if (invalidFiles.length > 0) {
            const errorMessages = invalidFiles.map((file) => {
                if (file.size > maxSizeInBytes) {
                    return `Tệp "${file.name}" quá lớn. Kích thước tối đa cho phép là 10MB.`;
                }
                return `Tệp "${file.name}" có định dạng không được hỗ trợ.`;
            });
            const errorMessage = errorMessages.join(' ');
            setUploadError(errorMessage);
            return;
        }

        setIsUploading(true);

        try {
            const filesToUpload = selectedFiles.map((file) => ({ originalFile: file }));
            await handleUploadNewFiles(cardId, filesToUpload);
            handleClose();
        } catch (err) {
            console.error('❌ Failed to upload files:', err);
            const errorMessage = err?.response?.data?.message || 'Tải tệp thất bại. Vui lòng thử lại.';
            setUploadError(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    const validateUrl = (url) => {
        if (!url.trim()) {
            return { isValid: false, message: 'Vui lòng nhập đường dẫn.' };
        }

        const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;
        const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

        if (!urlPattern.test(normalizedUrl)) {
            return { isValid: false, message: 'Đường dẫn không hợp lệ. Vui lòng kiểm tra lại.' };
        }

        if (url.length > 2000) {
            return { isValid: false, message: 'Đường dẫn quá dài. Tối đa 2000 ký tự.' };
        }

        return { isValid: true, normalizedUrl };
    };

    const handleAddLink = async () => {
        if (isLoading || isUploading) return;

        const validation = validateUrl(linkUrl);
        if (!validation.isValid) {
            setUploadError(validation.message);
            return;
        }

        setIsUploading(true);

        const newLink = {
            file_name_defaut: linkText.trim() || linkUrl,
            path_url: validation.normalizedUrl,
            type: 'link',
        };

        try {
            await handleAddNewLinks(cardId, [newLink]);
            setLinkText('');
            setLinkUrl('');
            setIsUploading(false); // Đặt lại trạng thái loading trước khi đóng
            console.log(newLink)
            handleClose(); // Đóng dialog sau khi thêm thành công
        } catch (err) {
            console.error('❌ Failed to add link:', err);
            const errorMessage = err.response?.data?.message || 'Thêm liên kết thất bại. Vui lòng thử lại.';
            setUploadError(errorMessage);
            setIsUploading(false); // Đảm bảo trạng thái loading được đặt lại
        }
    };

    const handleClose = () => {
        if (!isLoading && !isUploading) {
            setLinkText('');
            setLinkUrl('');
            setSearchTerm('');
            setUploadError('');
            setIsUploading(false); // Đảm bảo trạng thái loading được đặt lại
            onClose();
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 400,
                        maxWidth: '90vw',
                        borderRadius: 1,
                        p: 2,
                    },
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachmentIcon sx={{ color: '#6b778c', mr: 1 }} />
                        <Typography variant="h6">Đính kèm</Typography>
                    </Box>
                    <IconButton size="small" onClick={handleClose} disabled={isLoading || isUploading}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Typography variant="body2" sx={{ mb: 1 }}>
                    Đính kèm tệp từ máy tính của bạn
                </Typography>

                <Typography variant="body2" sx={{ mb: 2, color: '#6b778c' }}>
                    Bạn cũng có thể kéo và thả tệp để tải chúng lên.
                </Typography>

                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleChooseFile}
                    disabled={isLoading || isUploading}
                    sx={{
                        mb: 3,
                        py: 1.5,
                        bgcolor: '#f4f5f7',
                        color: '#172b4d',
                        '&:hover': { bgcolor: '#e6e9ee' },
                        textTransform: 'none',
                        boxShadow: 'none',
                        border: '1px solid #dfe1e6',
                        position: 'relative',
                    }}
                >
                    {isUploading ? (
                        <CircularProgress size={24} sx={{ position: 'absolute' }} />
                    ) : (
                        'Chọn tệp'
                    )}
                </Button>

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    multiple
                    disabled={isLoading || isUploading}
                />

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Tìm kiếm hoặc dán liên kết
                </Typography>

                <TextField
                    fullWidth
                    placeholder="Tìm các liên kết gần đây hoặc dán một liên kết..."
                    variant="outlined"
                    size="small"
                    value={linkUrl}
                    onChange={(e) => {
                        setLinkUrl(e.target.value);
                        setSearchTerm(e.target.value);
                    }}
                    disabled={isLoading || isUploading}
                    sx={{ mb: 2 }}
                />

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Văn bản hiển thị (không bắt buộc)
                </Typography>

                <TextField
                    fullWidth
                    placeholder="Văn bản cần hiển thị"
                    variant="outlined"
                    size="small"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    disabled={isLoading || isUploading}
                    sx={{ mb: 3 }}
                />

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Đã xem gần đây
                </Typography>

                <List sx={{ p: 0 }}>
                    {searchResults.map((file) => (
                        <ListItem key={file.id} sx={{ px: 0, py: 0.2 }}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                <ComputerIcon fontSize="small" sx={{ color: '#6b778c' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    file.file_name_defaut.length > 20
                                        ? file.file_name_defaut.substring(0, 20) + "..."
                                        : file.file_name_defaut
                                }
                                secondary={`• ${file.created_at}`}
                            />
                        </ListItem>
                    ))}
                    {searchResults.length < 4 && !searchTerm && attachments.files.length > 4 && (
                        <ListItem sx={{ px: 0, py: 0.2 }}>
                            <ListItemText
                                secondaryTypographyProps={{ color: '#6b778c', textAlign: 'center' }}
                                secondary={`Hiển thị ${searchResults.length}/${attachments.files.length} tệp gần đây`}
                            />
                        </ListItem>
                    )}
                </List>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                        onClick={handleClose}
                        disabled={isLoading || isUploading}
                        sx={{
                            mr: 1,
                            color: '#42526e',
                            textTransform: 'none',
                        }}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleAddLink}
                        disabled={!linkUrl || isLoading || isUploading}
                        sx={{
                            bgcolor: '#0052cc',
                            '&:hover': { bgcolor: '#0747a6' },
                            textTransform: 'none',
                            position: 'relative',
                        }}
                    >
                        {isUploading ? (
                            <CircularProgress size={24} sx={{ color: '#fff' }} />
                        ) : (
                            'Chèn'
                        )}
                    </Button>
                </Box>

                <Snackbar
                    open={errorSnackbarOpen}
                    autoHideDuration={5000}
                    onClose={handleCloseError}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
                        {uploadError}
                    </Alert>
                </Snackbar>

                <Snackbar
                    open={uploadingSnackbarOpen}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        severity="info"
                        icon={<CircularProgress size={20} />}
                        sx={{ width: '100%' }}
                    >
                        Đang tải liên kết lên...
                    </Alert>
                </Snackbar>
            </Dialog>
        </>
    );
};

export default AttachmentMenu;
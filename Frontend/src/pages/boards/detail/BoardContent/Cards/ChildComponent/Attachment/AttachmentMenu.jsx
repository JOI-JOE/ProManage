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
import { usePostAttachmentFile } from '../../../../../../../hooks/useCard';

const AttachmentMenu = ({ open, onClose }) => {
    const [linkText, setLinkText] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [uploadError, setUploadError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { attachments, isLoading, cardId, handleUpdateAttachments } = useAttachments();
    const { mutateAsync: postAttachmentFileMutateAsync } = usePostAttachmentFile();

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

    const handleChooseFile = () => {
        if (!isLoading) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event) => {
        const selectedFiles = Array.from(event.target.files);
        if (!selectedFiles || selectedFiles.length === 0) return;

        const maxSizeInBytes = 10240 * 1024; // 10MB
        const allowedFileTypes = [
            'image/jpeg',
            'image/png',
            'application/pdf',
            'text/plain',
            'application/msword', // .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/vnd.ms-excel', // .xls
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-powerpoint', // .ppt
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
            'application/x-rar-compressed', // .rar
            'application/zip', // .zip
            'text/csv', // .csv
            'application/vnd.oasis.opendocument.text', // .odt
            'application/vnd.oasis.opendocument.spreadsheet', // .ods
            'application/vnd.oasis.opendocument.presentation', // .odp
        ];

        const invalidFiles = selectedFiles.filter((file) => {
            if (file.size > maxSizeInBytes) {
                return true; // File quá lớn
            }
            if (!allowedFileTypes.includes(file.type)) {
                return true; // Loại file không hợp lệ
            }
            return false;
        });

        if (invalidFiles.length > 0) {
            const errorMessages = invalidFiles.map((file) => {
                if (file.size > maxSizeInBytes) {
                    return `Tệp "${file.name}" quá lớn. Kích thước tối đa cho phép là 10MB.`;
                }
                return `Tệp "${file.name}" không đúng định dạng. Chỉ chấp nhận JPG, PNG, PDF, hoặc TXT.`;
            });
            setUploadError(errorMessages.join(' ')); // Hiển thị tất cả lỗi trong dialog
            return; // Dừng xử lý nếu có file không hợp lệ
        }

        setIsUploading(true); // Bật trạng thái đang tải - hiển thị trong dialog
        setUploadError(''); // Xóa lỗi trước đó

        try {
            const uploadPromises = selectedFiles.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                return postAttachmentFileMutateAsync({ cardId, file: formData });
            });

            const results = await Promise.all(uploadPromises);
            console.log('✅ Files uploaded successfully:', results);

            // Khi có kết quả từ API, đóng dialog và hiển thị thông báo thành công
            handleClose();
            setSuccessMessage('Thành công'); // Hiển thị thông báo thành công sau khi đóng dialog
        } catch (err) {
            console.error('❌ Failed to upload files:', err);
            const errorMessage = err?.response?.data?.message || 'Tải tệp thất bại. Vui lòng thử lại.';
            setUploadError(errorMessage); // Hiển thị lỗi trong dialog
            setIsUploading(false); // Tắt trạng thái đang tải khi có lỗi
        }
    };

    const handleAddLink = async () => {
        if (!linkUrl || isLoading) return;

        const newLink = {
            id: Date.now(),
            file_name_defaut: linkText || linkUrl,
            path_url: linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`,
        };

        try {
            // Giả sử bạn có API để thêm link
            // await handleUpdateAttachments({
            //   ...attachments,
            //   links: [...attachments.links, newLink],
            // });

            // Đóng dialog trước, sau đó hiển thị thông báo thành công
            handleClose();
            setSuccessMessage('Thành công');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Thêm liên kết thất bại. Vui lòng thử lại.';
            setUploadError(errorMessage); // Hiển thị lỗi trong dialog
        }
    };

    const handleClose = () => {
        if (!isLoading && !isUploading) {
            setLinkText('');
            setLinkUrl('');
            setSearchTerm('');
            setUploadError('');
            onClose();
        }
    };

    const handleCloseError = () => {
        setUploadError('');
    };

    const handleCloseSuccess = () => {
        setSuccessMessage('');
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
                    {isLoading || isUploading ? (
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
                            <ListItemText primary={file.file_name_defaut} secondary={`• ${file.addedTime}`} />
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
                        {isLoading || isUploading ? (
                            <CircularProgress size={24} sx={{ color: '#fff' }} />
                        ) : (
                            'Chèn'
                        )}
                    </Button>
                </Box>

                {/* Hiển thị thông báo lỗi trong dialog */}
                {uploadError && (
                    <Alert severity="error" onClose={handleCloseError} sx={{ mt: 2 }}>
                        {uploadError}
                    </Alert>
                )}

                {/* Hiển thị trạng thái đang tải trong dialog */}
                {isUploading && (
                    <Alert
                        severity="info"
                        icon={<CircularProgress size={20} />}
                        sx={{ mt: 2 }}
                    >
                        Đang tải tệp lên...
                    </Alert>
                )}
            </Dialog>

            {/* Snackbar cho trạng thái thành công - hiển thị bên ngoài dialog */}
            <Snackbar open={!!successMessage} autoHideDuration={5000} onClose={handleCloseSuccess}>
                <Alert
                    severity="success"
                    action={
                        <IconButton size="small" onClick={handleCloseSuccess}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    }
                >
                    {successMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default AttachmentMenu;
import React, { useState } from 'react';
import { Box, Typography, Button, List, Dialog } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import LinkItem from './LinkItem';
import FileItem from './FileItem';
import AttachmentMenu from './AttachmentMenu';
import { useAttachments } from '../../../../../../../contexts/AttachmentsContext';
import LogoLoading from '../../../../../../../components/LogoLoading';

const AttachmentFolder = ({ cardId }) => {
    const {
        attachments,
        isLoading,
        error,
        handleEditFile,
        handleDeleteFile,
        handleEditLink,
        handleDeleteLink,
    } = useAttachments();

    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showAllLinks, setShowAllLinks] = useState(false);
    const [showAllFiles, setShowAllFiles] = useState(false);

    const handleOpenPreview = (url) => setPreviewUrl(url);
    const handleClosePreview = () => setPreviewUrl(null);
    const handleOpenUploadDialog = () => setIsUploadDialogOpen(true);
    const handleCloseUploadDialog = () => setIsUploadDialogOpen(false);

    const handleFileMenuSelect = (action, file) => {
        if (action === 'edit') {
            const newFileName = prompt('Enter new file name:', file.file_name_defaut);
            if (newFileName) {
                handleEditFile(file.id, newFileName);
            }
        } else if (action === 'delete') {
            if (window.confirm('Are you sure you want to delete this file?')) {
                handleDeleteFile(file.id);
            }
        }
    };

    const handleLinkMenuSelect = (action, link) => {
        if (action === 'edit') {
            const newLinkName = prompt('Enter new link name:', link.file_name_defaut);
            const newLinkUrl = prompt('Enter new link URL:', link.path_url);
            if (newLinkName || newLinkUrl) {
                handleEditLink(link.id, newLinkName, newLinkUrl);
            }
        } else if (action === 'delete') {
            if (window.confirm('Are you sure you want to delete this link?')) {
                handleDeleteLink(link.id);
            }
        }
    };

    const handleFileUpload = (newFiles) => {
        console.log(newFiles);
        handleCloseUploadDialog();
    };

    const handleLinkAdd = (newLinks) => {
        console.log(newLinks);
        handleCloseUploadDialog();
    };

    if (!attachments.links.length && !attachments.files.length) {
        return null;
    }
    return (
        <>
            <Box>
                {isLoading && <LogoLoading scale={0.3} />}
                {error && <Typography color="error">Lỗi: {error.message}</Typography>}

                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 1,
                    }}
                >
                    <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}
                    >
                        <AttachFileIcon sx={{ fontSize: '20px', mr: 1 }} />
                        Các tập tin đính kèm
                    </Typography>

                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleOpenUploadDialog}
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
                        Thêm
                    </Button>
                </Box>

                {/* Links Section */}
                {attachments.links.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '14px',
                                color: '#172b4d',
                                mb: 1,
                            }}
                        >
                            Liên kết
                        </Typography>
                        <List sx={{ p: 0, ml: 2 }}>
                            {(showAllLinks ? attachments.links : attachments.links.slice(0, 4)).map(
                                (link) => (
                                    <LinkItem
                                        key={link.id}
                                        file={link}
                                        handleMenuSelect={(action) =>
                                            handleLinkMenuSelect(action, link)
                                        }
                                    />
                                )
                            )}
                        </List>
                        {attachments.links.length > 4 && (
                            <Button
                                onClick={() => setShowAllLinks(!showAllLinks)}
                                size="small"
                                sx={{
                                    mt: 1,
                                    fontSize: '12px',
                                    color: '#5e6c84',
                                    textTransform: 'none',
                                    paddingLeft: '8px',
                                    justifyContent: 'flex-start',
                                }}
                            >
                                {showAllLinks
                                    ? 'Ẩn bớt'
                                    : `Hiện tất cả ${attachments.links.length} liên kết`}
                            </Button>
                        )}
                    </Box>
                )}

                {/* Files Section */}
                {attachments.files.length > 0 && (
                    <Box>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '14px',
                                color: '#172b4d',
                                mb: 1,
                            }}
                        >
                            Tệp
                        </Typography>
                        <List sx={{ p: 0, ml: 2 }}>
                            {(showAllFiles ? attachments.files : attachments.files.slice(0, 3)).map(
                                (file) => (
                                    <FileItem
                                        key={file.id}
                                        file={file}
                                        handleOpen={handleOpenPreview}
                                        handleMenuSelect={(action) =>
                                            handleFileMenuSelect(action, file)
                                        }
                                    />
                                )
                            )}
                        </List>
                        {attachments.files.length > 3 && (
                            <Button
                                onClick={() => setShowAllFiles(!showAllFiles)}
                                size="small"
                                sx={{
                                    mt: 1,
                                    fontSize: '12px',
                                    color: '#5e6c84',
                                    textTransform: 'none',
                                    paddingLeft: '8px',
                                    justifyContent: 'flex-start',
                                }}
                            >
                                {showAllFiles
                                    ? 'Ẩn bớt'
                                    : `Hiện tất cả ${attachments.files.length} tệp`}
                            </Button>
                        )}
                    </Box>
                )}

                {/* Image Preview Dialog */}
                <Dialog
                    open={!!previewUrl}
                    onClose={handleClosePreview}
                    maxWidth="md"
                    PaperProps={{
                        sx: { borderRadius: 2, overflow: 'hidden' },
                    }}
                >
                    {previewUrl && (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            style={{ maxWidth: '100%', maxHeight: '90vh' }}
                        />
                    )}
                </Dialog>

                {/* Upload Dialog */}
                {isUploadDialogOpen && (
                    <AttachmentMenu
                        open={isUploadDialogOpen}
                        onClose={handleCloseUploadDialog}
                        onFileUpload={handleFileUpload}
                        onLinkAdd={handleLinkAdd}
                    />
                )}
            </Box>
        </>
    );
};

export default AttachmentFolder;

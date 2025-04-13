import React, { useState } from 'react';
import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import CommentEditor from '../EditorForm';
import { useCommentContext } from '../../../../../../../contexts/CommentContext';
import { useMe } from '../../../../../../../contexts/MeContext';
import InitialsAvatar from '../../../../../../../components/Common/InitialsAvatar';
import LogoLoading from '../../../../../../../components/LogoLoading';

dayjs.extend(relativeTime);

const CommentSection = () => {
    const { user } = useMe();
    const { comments, handleAddComment, handleUpdateComment, handleDeleteComment, isSubmittingComment, isLoading } = useCommentContext();
    const [isEditingComment, setIsEditingComment] = useState(false);
    const [comment, setComment] = useState('');
    const [error, setError] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);

    const currentUser = user;

    const handleCommentClick = () => {
        setIsEditingComment(true);
        setError(null);
        setEditingCommentId(null);
        setComment('');
    };

    const handleSaveComment = async () => {
        setError(null);
        try {
            await handleAddComment(comment);
            setComment('');
            setIsEditingComment(false);
        } catch (err) {
            setError(err.message || 'Đã có lỗi xảy ra khi thêm bình luận');
        }
    };

    const handleSaveEditComment = async (commentId) => {
        setError(null);
        if (!commentId) {
            setError('Không tìm thấy ID bình luận để chỉnh sửa');
            return;
        }

        // Tìm bình luận hiện tại
        const currentComment = comments.find((comment) => comment.id === commentId);
        if (!currentComment) {
            setError('Bình luận không tồn tại');
            return;
        }

        // So sánh nội dung mới với nội dung cũ
        if (currentComment.content === editContent) {
        setEditingCommentId(null);
            setEditContent('');
            return; // Không gọi API nếu nội dung không thay đổi
        }

        try {
            await handleUpdateComment(commentId, editContent);
            setEditingCommentId(null);
            setEditContent('');
        } catch (err) {
            setError(err.message || 'Đã có lỗi xảy ra khi chỉnh sửa bình luận');
        }
    };

    const handleEditComment = (comment) => {
        if (!comment?.id) {
            setError('Không tìm thấy ID bình luận để chỉnh sửa');
            return;
        }
        setEditingCommentId(comment.id);
        setEditContent(comment.content);
        setError(null);
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditContent('');
        setError(null);
    };

    const handleOpenDeleteDialog = (comment) => {
        setCommentToDelete(comment);
        setOpenDeleteDialog(true);
    };

    const handleDeleteCancel = () => {
        setOpenDeleteDialog(false);
        setCommentToDelete(null);
    };

    const handleDeleteConfirm = async () => {
        if (commentToDelete) {
            try {
                await handleDeleteComment(commentToDelete.id);
                setOpenDeleteDialog(false);
                setCommentToDelete(null);
            } catch (err) {
                setError(err.message || 'Đã có lỗi xảy ra khi xóa bình luận');
            }
        }
    };

    const isEmptyHTML = (html) => {
        if (!html) return true;
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent.trim() === '';
    };

    return (
        <Box sx={{ pb: '20px' }}>
            <Typography
                variant="body2"
                sx={{ color: '#5e6c84', fontWeight: 500, marginBottom: '6px' }}
            >
                Bình luận
            </Typography>

            {/* Comment input area */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                <InitialsAvatar
                    sx={{
                        width: '32px',
                        fontSize: '0.8rem',
                        height: '32px',
                    }}
                    size={'32px'}
                    initials={currentUser?.initials}
                    name={currentUser?.full_name}
                    avatarSrc={currentUser?.image}
                />

                <Box sx={{ flex: 1 }}>
                    {error && (
                        <Typography color="error" variant="caption" sx={{ mb: 1, display: 'block' }}>
                            {error}
                        </Typography>
                    )}
                    {!isEditingComment ? (
                        <Box
                            sx={{
                                border: '1px dashed #b0bec5',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                color: '#607d8b',
                                fontSize: '0.9rem',
                                transition: 'border-color 0.3s ease',
                                '&:hover': {
                                    borderColor: 'teal',
                                    backgroundColor: 'grey.50',
                                },
                            }}
                            onClick={handleCommentClick}
                        >
                            <Typography variant="body1" sx={{ color: '#607d8b' }}>
                                Viết bình luận...
                            </Typography>
                        </Box>
                    ) : (
                        <CommentEditor
                            value={comment}
                            onChange={setComment}
                            onSave={handleSaveComment}
                            onCancel={() => {
                                setIsEditingComment(false);
                                setComment('');
                                setError(null);
                            }}
                            isSaveDisabled={isEmptyHTML(comment) || isSubmittingComment}
                            isLoading={isSubmittingComment}
                            editorHeight="100px"
                            minHeight="60px"
                        />
                    )}
                </Box>
            </Box>

            {/* Comments list */}
            {isLoading ? (
                <Typography variant="body2" sx={{ color: '#5e6c84' }}>
                    Đang tải bình luận...
                </Typography>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {comments.map((comment) => (
                        <Box
                            key={comment.id}
                            sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}
                        >
                            <InitialsAvatar
                                sx={{
                                    width: '32px',
                                    fontSize: '0.8rem',
                                    height: '32px',
                                }}
                                size={'32px'}
                                initials={comment?.member?.initials}
                                name={comment?.member?.full_name}
                                avatarSrc={comment?.member?.avatar}
                            />

                            <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.2 }}>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#172b4d' }}
                                    >
                                        {comment?.member?.full_name}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        sx={{ color: '#6b778c', fontSize: '0.75rem' }}
                                    >
                                        • {dayjs(comment.created_at).fromNow()}
                                    </Typography>

                                    {comment.isEdited && (
                                        <Typography
                                            variant="caption"
                                            sx={{ color: '#6b778c', fontSize: '0.75rem' }}
                                        >
                                            • (đã sửa)
                                        </Typography>
                                    )}
                                </Box>

                                {editingCommentId !== comment.id ? (
                                    <>
                                        <Box
                                            sx={{
                                                backgroundColor: 'white',
                                                borderRadius: '8px',
                                                padding: '8px 12px',
                                                fontSize: '0.9rem',
                                                color: '#172b4d',
                                                mb: '4px',
                                                lineHeight: 1.5,
                                                wordBreak: 'break-word',
                                                border: '1px solid #dfe1e6',
                                            }}
                                            dangerouslySetInnerHTML={{ __html: comment?.content }}
                                        />

                                        {currentUser?.id === comment?.member?.id && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 0.5 }}>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: '#5e6c84',
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            textDecoration: 'underline',
                                                        },
                                                        fontSize: '12px',
                                                    }}
                                                    onClick={() => handleEditComment(comment)}
                                                >
                                                    Chỉnh sửa
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: '#5e6c84',
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            textDecoration: 'underline',
                                                        },
                                                        fontSize: '12px',
                                                    }}
                                                    onClick={() => handleOpenDeleteDialog(comment)}
                                                >
                                                    Xóa
                                                </Typography>
                                            </Box>
                                        )}
                                    </>
                                ) : (
                                    <Box sx={{ mt: 2 }}>
                                        <CommentEditor
                                            value={editContent}
                                            onChange={setEditContent}
                                            onSave={() => {
                                                if (!comment?.id) {
                                                    setError("Không tìm thấy ID bình luận để chỉnh sửa");
                                                    return;
                                                }
                                                handleSaveEditComment(comment.id);
                                            }}
                                            onCancel={handleCancelEdit}
                                            isSaveDisabled={isEmptyHTML(editContent) || isSubmittingComment}
                                            isLoading={isSubmittingComment}
                                            editorHeight="100px"
                                            minHeight="60px"
                                        />
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleDeleteCancel}
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
                        Bạn có chắc chắn muốn xóa bình luận này?
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ p: 0, mt: 3 }}>
                    <Button
                        onClick={handleDeleteCancel}
                        sx={{
                            color: "#42526E",
                            textTransform: "none",
                            fontWeight: 500,
                        }}
                    >
                        Hủy
                    </Button>
                    {isSubmittingComment ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                            <LogoLoading scale={0.4} />
                        </Box>
                    ) : (
                        <Button
                            onClick={handleDeleteConfirm}
                            variant="contained"
                            sx={{
                                backgroundColor: "#FF5630",
                                color: "white",
                                textTransform: "none",
                                fontWeight: 500,
                                "&:hover": {
                                    backgroundColor: "#DE350B",
                                }
                            }}
                        >
                            Xóa
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CommentSection;
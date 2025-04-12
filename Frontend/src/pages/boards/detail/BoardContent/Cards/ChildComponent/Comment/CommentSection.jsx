import React, { useState } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import CommentEditor from '../EditorForm';

dayjs.extend(relativeTime);

const CommentSection = () => {
    const [isEditingComment, setIsEditingComment] = useState(false);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]); // State để lưu danh sách comments
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [error, setError] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null); // State để theo dõi comment đang được chỉnh sửa
    const [editContent, setEditContent] = useState(''); // State để lưu nội dung comment đang chỉnh sửa

    // Mock currentUser cho demo (thay bằng dữ liệu thực tế trong ứng dụng)
    const currentUser = {
        id: 'user1',
        name: 'Nguyen Van A',
    };

    const handleCommentClick = () => {
        setIsEditingComment(true);
        setError(null);
        setEditingCommentId(null); // Reset khi thêm comment mới
        setComment(''); // Reset nội dung comment khi mở editor để thêm mới
    };

    const handleSaveComment = async () => {
        if (isEmptyHTML(comment)) {
            setError('Bình luận không được để trống');
            return;
        }

        setIsSubmittingComment(true);
        setError(null);

        try {
            // Thêm comment mới
            const newComment = {
                id: Date.now().toString(), // ID tạm thời
                author: {
                    id: currentUser.id,
                    name: currentUser.name || 'Anonymous',
                },
                content: comment,
                created_at: new Date().toISOString(),
                isEdited: false,
                isImage: false,
            };

            setComments((prevComments) => [...prevComments, newComment]);

            // Reset form
            setComment('');
            setIsEditingComment(false);
        } catch (err) {
            setError(err.message || 'Đã có lỗi xảy ra khi thêm bình luận');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleSaveEditComment = async (commentId) => {
        if (isEmptyHTML(editContent)) {
            setError('Bình luận không được để trống');
            return;
        }

        setIsSubmittingComment(true);
        setError(null);

        try {
            setComments((prevComments) =>
                prevComments.map((c) =>
                    c.id === commentId
                        ? {
                            ...c,
                            content: editContent,
                            isEdited: true,
                            created_at: new Date().toISOString(),
                        }
                        : c
                )
            );

            // Reset sau khi chỉnh sửa
            setEditingCommentId(null);
            setEditContent('');
        } catch (err) {
            setError(err.message || 'Đã có lỗi xảy ra khi chỉnh sửa bình luận');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleDeleteComment = (commentId) => {
        setComments((prevComments) => prevComments.filter((c) => c.id !== commentId));
    };

    const handleEditComment = (comment) => {
        setEditingCommentId(comment.id); // Đặt ID của comment đang chỉnh sửa
        setEditContent(comment.content); // Tải nội dung comment cũ để chỉnh sửa
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditContent('');
        setError(null);
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
                <Avatar
                    sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'grey.300',
                        fontSize: '0.8rem',
                        color: 'grey.700',
                        mt: '4px',
                    }}
                >
                    {currentUser.name?.charAt(0) || 'A'}
                </Avatar>

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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {comments.map((comment) => (
                    <Box
                        key={comment.id}
                        sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}
                    >
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: 'grey.300',
                                fontSize: '0.8rem',
                                color: 'grey.700',
                            }}
                        >
                            {comment.author.name?.charAt(0) || 'A'}
                        </Avatar>

                        <Box sx={{ flex: 1 }}>
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.2 }}>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#172b4d' }}
                                    >
                                        {comment.author.name}
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
                                            sx={{ color: '#6b778c', fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}
                                        >
                                            {/* icon chỉnh sửa nhỏ */}
                                            • (đã sửa)
                                        </Typography>
                                    )}
                                </Box>


                                {/* Ẩn nội dung comment khi đang chỉnh sửa */}
                                {editingCommentId !== comment.id && (
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
                                            dangerouslySetInnerHTML={{ __html: comment.content }}
                                        />

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 0.5 }}>
                                            {currentUser.id === comment.author.id && (
                                                <>
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
                                                        • Chỉnh sửa
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
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                    >
                                                        • Xóa
                                                    </Typography>
                                                </>
                                            )}
                                        </Box>
                                    </>
                                )}

                                {/* Hiển thị CommentEditor khi đang chỉnh sửa comment này */}
                                {editingCommentId === comment.id && (
                                    <Box sx={{ mt: 2 }}>
                                        <CommentEditor
                                            value={editContent}
                                            onChange={setEditContent}
                                            onSave={() => handleSaveEditComment(comment.id)}
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
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default CommentSection;
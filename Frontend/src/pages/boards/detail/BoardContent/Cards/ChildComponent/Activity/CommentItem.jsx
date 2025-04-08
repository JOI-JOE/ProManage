import React from 'react';
import { Box, Avatar, Typography, Button } from '@mui/material';
import ReactQuill from 'react-quill';

const CommentItem = ({
    item,
    editingCommentIndex,
    editingCommentText,
    setEditingCommentText,
    handleSaveEditedComment,
    handleEditComment,
    handleDeleteComment,
    isEmptyHTML,
    formatTime
}) => {
    const content = item.content || "";
    if (isEmptyHTML(content)) return null;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                    src={item?.user?.avatar || ""}
                    sx={{
                        bgcolor: !item?.user?.avatar ? "pink" : "transparent",
                        color: !item?.user?.avatar ? "white" : "inherit",
                        width: 28,
                        height: 28,
                        fontSize: "0.6rem",
                        mt: 2,
                    }}
                >
                    {!item?.user?.avatar && (item?.user?.full_name?.charAt(0)?.toUpperCase() || "?")}
                </Avatar>
                <Box sx={{ ml: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "14px" }}>
                        {item.user?.full_name || "Người dùng"}
                        <Typography component="span" sx={{ fontSize: "0.5rem", color: "gray", ml: 0.5 }}>
                            {formatTime(item.created_at)}
                        </Typography>
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ ml: 4.5, mt: -1, backgroundColor: "#f5f6fa", p: 0.7, borderRadius: "8px" }}>
                {editingCommentIndex === item.id ? (
                    <>
                        <ReactQuill
                            value={editingCommentText}
                            onChange={setEditingCommentText}
                            style={{ marginTop: "8px" }}
                            theme="snow"
                            modules={{
                                toolbar: [
                                    ["bold", "italic", "underline", "strike"],
                                    [{ list: "ordered" }, { list: "bullet" }],
                                    ["link"],
                                    ["clean"],
                                ],
                            }}
                        />
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
                            <Button
                                variant="contained"
                                size="small"
                                sx={{ backgroundColor: "teal", color: "#FFF", fontSize: "0.6rem" }}
                                onClick={handleSaveEditedComment}
                                disabled={isEmptyHTML(editingCommentText)}
                            >
                                Lưu
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{ fontSize: "0.6rem" }}
                                onClick={() => {
                                    setEditingCommentIndex(null);
                                    setEditingCommentText("");
                                }}
                            >
                                Hủy
                            </Button>
                        </Box>
                    </>
                ) : (
                    <>
                        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                            {content.replace(/<\/?p>/g, "")}
                        </Typography>
                        <Box sx={{ display: "flex", mt: "-4px" }}>
                            <Button
                                size="small"
                                onClick={() => handleEditComment(item.id, item.content)}
                                sx={{ fontSize: "0.4rem", p: "2px 4px" }}
                            >
                                Sửa
                            </Button>
                            <Button
                                size="small"
                                onClick={() => handleDeleteComment(item.id)}
                                sx={{ fontSize: "0.4rem", p: "2px 4px" }}
                            >
                                Xóa
                            </Button>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default CommentItem;
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CommentInput = ({
    comment,
    setComment,
    isEditingComment,
    handleCommentClick,
    handleSaveComment,
    isEmptyHTML
}) => {
    return (
        <Box>
            {!isEditingComment && (
                <Typography
                    variant="body1"
                    sx={{
                        mt: 1,
                        color: "#a4b0be",
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                        cursor: "pointer",
                        fontSize: "0.6rem",
                    }}
                    onClick={handleCommentClick}
                >
                    Viết bình luận...
                </Typography>
            )}
            {isEditingComment && (
                <>
                    <ReactQuill
                        value={comment}
                        onChange={setComment}
                        placeholder="Write a comment..."
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
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                        <Button
                            variant="contained"
                            size="small"
                            sx={{
                                backgroundColor: "teal",
                                color: "#FFF",
                                fontSize: "0.7rem",
                            }}
                            onClick={handleSaveComment}
                            disabled={isEmptyHTML(comment)}
                        >
                            Lưu
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default CommentInput;
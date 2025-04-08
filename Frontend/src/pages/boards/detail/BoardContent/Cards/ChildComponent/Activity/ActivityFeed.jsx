import React from 'react';
import {
    Box,
    Typography,
    Button,
    Modal
} from '@mui/material';
import CommentInput from './CommentInput';
import CommentItem from './CommentItem';
import ActivityItem from './ActivityItem';
import BarChartIcon from '@mui/icons-material/BarChart';

const ActivityFeed = ({
    isDetailHidden,
    handleToggleDetail,
    comment,
    setComment,
    isEditingComment,
    handleCommentClick,
    handleSaveComment,
    isEmptyHTML,
    sortedData,
    editingCommentIndex,
    editingCommentText,
    setEditingCommentText,
    handleSaveEditedComment,
    handleEditComment,
    handleDeleteComment,
    open,
    handleOpen,
    handleClose,
    selectedImage,
    formatTime
}) => {
    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    <BarChartIcon sx={{ fontSize: "0.8rem", mr: 1 }} />
                    Hoạt động
                </Typography>
                <Button
                    variant="text"
                    sx={{ fontSize: "0.5rem", color: "#fff", bgcolor: "teal" }}
                    onClick={handleToggleDetail}
                >
                    {isDetailHidden ? "Hiện chi tiết" : "Ẩn chi tiết"}
                </Button>
            </Box>

            <CommentInput
                comment={comment}
                setComment={setComment}
                isEditingComment={isEditingComment}
                handleCommentClick={handleCommentClick}
                handleSaveComment={handleSaveComment}
                isEmptyHTML={isEmptyHTML}
            />

            {sortedData.map((item, index) => {
                if (item.type === "comment") {
                    return (
                        <CommentItem
                            key={index}
                            item={item}
                            editingCommentIndex={editingCommentIndex}
                            editingCommentText={editingCommentText}
                            setEditingCommentText={setEditingCommentText}
                            handleSaveEditedComment={handleSaveEditedComment}
                            handleEditComment={handleEditComment}
                            handleDeleteComment={handleDeleteComment}
                            isEmptyHTML={isEmptyHTML}
                            formatTime={formatTime}
                        />
                    );
                } else if (item.type === "activity" && !isDetailHidden) {
                    return (
                        <ActivityItem
                            key={index}
                            item={item}
                            handleOpen={handleOpen}
                            open={open}
                            handleClose={handleClose}
                            selectedImage={selectedImage}
                            formatTime={formatTime}
                        />
                    );
                }
                return null;
            })}


        </Box>
    );
};

export default ActivityFeed;
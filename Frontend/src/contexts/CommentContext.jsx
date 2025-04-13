import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
    useFetchComments, usePostComment,
    useRemoveComment,
    useUpdateComment
} from "../hooks/useCard";

const CommentContext = createContext();

export const CommentProvider = ({ children, cardId }) => {
    const [comments, setComments] = useState([]);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const { data: fetchComments, isLoading, error } = useFetchComments(cardId);
    const { mutateAsync: postCommentMutate } = usePostComment();
    const { mutateAsync: updateCommentMutate } = useUpdateComment();
    const { mutateAsync: deleteCommentMutate } = useRemoveComment();

    useEffect(() => {
        if (fetchComments) {
            const sortedComments = [...fetchComments].sort((a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
            );
            setComments(sortedComments);
        }
    }, [fetchComments]);

    // Thêm bình luận
    const handleAddComment = useCallback(async (content) => {
        const trimmedContent = content.trim();
        if (!trimmedContent || isEmptyHTML(trimmedContent)) {
            throw new Error('Bình luận không được để trống');
        }
        setIsSubmittingComment(true);
        try {
            const newComment = await postCommentMutate({ cardId, content });
            setComments((prev) => [newComment, ...prev]);
        } catch (error) {
            if (error?.response?.data?.errors?.content) {
                throw new Error(error.response.data.errors.content[0]);
            }
            throw new Error('Đã có lỗi xảy ra khi tạo bình luận');
        } finally {
            setIsSubmittingComment(false);
        }
    }, [cardId, postCommentMutate]);

    // Cập nhật bình luận
    const handleUpdateComment = useCallback(async (commentId, content) => {
        if (!content || isEmptyHTML(content)) {
            throw new Error('Bình luận không được để trống');
        }

        // Tìm bình luận hiện tại
        const currentComment = comments.find((comment) => comment.id === commentId);
        if (!currentComment) {
            throw new Error('Bình luận không tồn tại');
        }

        // So sánh nội dung mới với nội dung cũ
        if (currentComment.content === content) {
            return; // Không gọi API nếu nội dung không thay đổi
        }

        setIsSubmittingComment(true);
        try {
            const updatedComment = await updateCommentMutate({ commentId, content });
            setComments((prev) =>
                prev.map((comment) =>
                    comment.id === updatedComment.id ? updatedComment : comment
                )
            );
        } catch (error) {
            if (error?.response?.data?.errors?.content) {
                throw new Error(error.response.data.errors.content[0]);
            }
            throw new Error('Đã có lỗi xảy ra khi cập nhật bình luận');
        } finally {
            setIsSubmittingComment(false);
        }
    }, [updateCommentMutate, comments]);

    // Xóa bình luận
    const handleDeleteComment = useCallback(async (commentId) => {
        setIsSubmittingComment(true);
        try {
            await deleteCommentMutate(commentId);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
        } catch (error) {
            throw new Error('Đã có lỗi xảy ra khi xóa bình luận');
        } finally {
            setIsSubmittingComment(false);
        }
    }, [deleteCommentMutate]);

    const isEmptyHTML = (html) => {
        if (!html) return true;
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent.trim() === '';
    };

    return (
        <CommentContext.Provider
            value={{
                comments,
                handleAddComment,
                handleUpdateComment,
                handleDeleteComment,
                isSubmittingComment,
                isLoading,
            }}
        >
            {children}
        </CommentContext.Provider>
    );
};

export const useCommentContext = () => {
    const context = useContext(CommentContext);
    if (!context) {
        throw new Error("useCommentContext phải được dùng trong <CommentProvider>");
    }
    return context;
};
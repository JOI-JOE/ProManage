import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    useFetchAttachments,
    usePostAttachmentFile,
    usePostAttachmentLink,
    usePutAttachment,
    useRemoveAttachment,
} from '../hooks/useCard';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Pusher from 'pusher-js';

const AttachmentsContext = createContext();

export const AttachmentsProvider = ({ children, cardId, setCard, setCoverLoading }) => {
    const { data: fetchedAttachments, isLoading, error, refetch: refetchAttachment } = useFetchAttachments(cardId);
    const [attachments, setAttachments] = useState({ links: [], files: [] });

    const { mutateAsync: postAttachmentFileMutate } = usePostAttachmentFile();
    const { mutateAsync: postAttachmentLinkMutate } = usePostAttachmentLink();
    const { mutateAsync: updateAttachmentMutate } = usePutAttachment(cardId);
    const { mutateAsync: removeAttachmentMutate } = useRemoveAttachment();


    // Update attachments state when fetchedAttachments changes
    useEffect(() => {
        if (fetchedAttachments?.data && Array.isArray(fetchedAttachments.data)) {
            const fetchedLinks = fetchedAttachments.data
                .filter((item) => item.type === 'link')
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            const fetchedFiles = fetchedAttachments.data
                .filter((item) => item.type === 'file')
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setAttachments({ links: fetchedLinks, files: fetchedFiles });
        }
    }, [fetchedAttachments?.data]);

    const handleUploadNewFiles = useCallback(async (cardId, filesToUpload) => {
        try {
            const uploadFilePromises = filesToUpload.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file.originalFile);
                await postAttachmentFileMutate({ cardId, file: formData });
            });
            await Promise.all(uploadFilePromises);
        } catch (error) {
            toast.error(error.response?.data?.message || '❌ Lỗi khi tải lên tệp. Vui lòng thử lại.');
            throw error;
        }
    }, [postAttachmentFileMutate]);

    const handleAddNewLinks = useCallback(async (cardId, linksToAdd) => {
        if (!cardId || !linksToAdd || linksToAdd.length === 0) {
            toast.error('❌ Thiếu thông tin cardId hoặc dữ liệu liên kết.');
            throw new Error('Thiếu cardId hoặc dữ liệu link.');
        }

        try {
            const linkPromises = linksToAdd.map(async (link) => {
                await postAttachmentLinkMutate({
                    cardId,
                    link: {
                        file_name_defaut: link.file_name_defaut,
                        path_url: link.path_url,
                        type: 'link',
                    },
                });
            });
            await Promise.all(linkPromises);
            // await ();
        } catch (error) {
            toast.error(error.response?.data?.message || '❌ Không thể thêm liên kết. Vui lòng thử lại.');
            throw error;
        }
    }, [postAttachmentLinkMutate]);

    const handleEditFile = useCallback(async (fileId, newFileName) => {
        try {
            await updateAttachmentMutate({
                attachmentId: fileId,
                data: { file_name_defaut: newFileName },
            });
        } catch (error) {
            toast.error(error.response?.data?.message || '❌ Lỗi khi chỉnh sửa tên tệp. Vui lòng thử lại.');
            throw error;
        }
    }, [updateAttachmentMutate]);

    const handleEditLink = useCallback(async (linkId, newLinkName, newLinkUrl) => {
        try {
            await updateAttachmentMutate({
                attachmentId: linkId,
                data: {
                    file_name_defaut: newLinkName || newLinkUrl,
                    path_url: newLinkUrl,
                    type: 'link',
                },
            });
            setAttachments((prevAttachments) => ({
                ...prevAttachments,
                links: prevAttachments.links.map((link) =>
                    link.id === linkId
                        ? {
                            ...link,
                            file_name_defaut: newLinkName || newLinkUrl,
                            path_url: newLinkUrl,
                        }
                        : link
                ),
            }));
        } catch (error) {
            toast.error(error.response?.data?.message || '❌ Lỗi khi chỉnh sửa liên kết. Vui lòng thử lại.');
            throw error;
        }
    }, [updateAttachmentMutate]);

    const handleEditCover = useCallback(async (attachmentId, isCover, file = null) => {
        try {
            setCoverLoading?.(true);
            const updateData = { is_cover: isCover };

            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('is_cover', isCover);
                await updateAttachmentMutate({ attachmentId, data: formData });
            } else {
                await updateAttachmentMutate({ attachmentId, data: updateData });
            }
            if (setCard) {
                if (isCover) {
                    const updatedAttachment = attachments.files
                        .concat(attachments.links)
                        .find((a) => a.id === attachmentId);
                    if (updatedAttachment) {
                        const newThumbnailUrl = updatedAttachment.path_url || updatedAttachment.file_url;
                        setCard((prev) => ({
                            ...prev,
                            thumbnail: newThumbnailUrl,
                        }));
                    }
                } else {
                    setCard((prev) => ({
                        ...prev,
                        thumbnail: null,
                    }));
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || '❌ Lỗi khi cập nhật ảnh bìa. Vui lòng thử lại.');
            throw error;
        } finally {
            setCoverLoading?.(false);
        }
    }, [updateAttachmentMutate, setCard, setCoverLoading, attachments]);

    const handleDeleteFile = useCallback(async (attachmentId) => {
        try {
            await removeAttachmentMutate(attachmentId);
            setAttachments((prevAttachments) => ({
                ...prevAttachments,
                files: prevAttachments.files.filter((file) => file.id !== attachmentId),
            }));
            const deletedAttachment = attachments.files.concat(attachments.links).find((a) => a.id === attachmentId);
            if (setCard && deletedAttachment?.is_cover) {
                setCard((prev) => ({ ...prev, thumbnail: null }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || '❌ Lỗi khi xóa tệp. Vui lòng thử lại.');
            throw error;
        }
    }, [removeAttachmentMutate, setCard, attachments]);

    const handleDeleteLink = useCallback(async (linkId) => {
        try {
            await removeAttachmentMutate(linkId);
            setAttachments((prevAttachments) => ({
                ...prevAttachments,
                links: prevAttachments.links.filter((link) => link.id !== linkId),
            }));
        } catch (error) {
            toast.error(error.response?.data?.message || '❌ Lỗi khi xóa liên kết. Vui lòng thử lại.');
            throw error;
        }
    }, [removeAttachmentMutate]);

    return (
        <AttachmentsContext.Provider
            value={{
                attachments,
                cardId,
                isLoading,
                error,
                refetchAttachment,
                handleUploadNewFiles,
                handleAddNewLinks,
                handleEditFile,
                handleDeleteFile,
                handleEditLink,
                handleEditCover,
                handleDeleteLink,
                setAttachments,
            }}
        >
            {children}
        </AttachmentsContext.Provider>
    );
};

export const useAttachments = () => {
    const context = useContext(AttachmentsContext);
    if (!context) {
        throw new Error('useAttachments must be used within an AttachmentsProvider');
    }
    return context;
};
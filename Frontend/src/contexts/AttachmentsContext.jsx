import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    useFetchAttachments,
    usePostAttachmentFile,
    usePostAttachmentLink,
    usePutAttachment,
    useRemoveAttachment,
} from '../hooks/useCard';
import { useQueryClient } from '@tanstack/react-query';

const AttachmentsContext = createContext();

export const AttachmentsProvider = ({ children, cardId, setCard, setCoverLoading }) => {
    const queryClient = useQueryClient();
    const { data: fetchedAttachments, isLoading, error } = useFetchAttachments(cardId);
    const [attachments, setAttachments] = useState({ links: [], files: [] });
    const { mutateAsync: postAttachmentFileMutate } = usePostAttachmentFile();
    const { mutateAsync: postAttachmentLinkMutate } = usePostAttachmentLink();
    const { mutateAsync: updateAttachmentMutate } = usePutAttachment();
    const { mutateAsync: removeAttachmentMutate } = useRemoveAttachment();

    // Update attachments state when fetchedAttachments changes
    useEffect(() => {
        if (fetchedAttachments?.data && Array.isArray(fetchedAttachments.data)) {
            const fetchedLinks = fetchedAttachments.data
                .filter(item => item.type === 'link')
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            const fetchedFiles = fetchedAttachments.data
                .filter(item => item.type === 'file')
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setAttachments({ links: fetchedLinks, files: fetchedFiles });
        }
    }, [fetchedAttachments?.data]);

    // Function to invalidate attachments query
    const invalidateAttachments = () => {
        queryClient.invalidateQueries({
            queryKey: ["attachments", cardId],
            exact: true,
        });
    };

    const handleUploadNewFiles = async (cardId, filesToUpload) => {
        try {
            const uploadFilePromises = filesToUpload.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file.originalFile);
                return postAttachmentFileMutate({ cardId, file: formData });
            });
            await Promise.all(uploadFilePromises);
            invalidateAttachments();
        } catch (error) {
            console.error('❌ Error uploading files:', error);
            throw error;
        }
    };

    const handleAddNewLinks = async (cardId, linksToAdd) => {
        if (!cardId || !linksToAdd || linksToAdd.length === 0) {
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
            invalidateAttachments();
        } catch (error) {
            console.error('❌ Error adding new links:', error);
            // setAttachments(prev => ({
            //     ...prev,
            //     links: prev.links.filter(link => !link.id.startsWith('attachment-temp-')),
            // }));
            throw new Error(
                error.response?.data?.message ||
                error.message ||
                'Không thể thêm liên kết. Vui lòng thử lại.'
            );
        }
    };

    const handleEditFile = async (fileId, newFileName) => {
        try {
            await updateAttachmentMutate({
                attachmentId: fileId,
                data: { file_name_defaut: newFileName },
            });
            invalidateAttachments();
        } catch (error) {
            console.error('Error editing file name:', error);
            throw error;
        }
    };

    const handleEditLink = async (linkId, newLinkName, newLinkUrl) => {
        try {
            await updateAttachmentMutate({
                attachmentId: linkId,
                data: {
                    file_name_defaut: newLinkName || newLinkUrl,
                    path_url: newLinkUrl,
                    type: 'link',
                },
            });
            invalidateAttachments();
        } catch (error) {
            console.error('Error editing link:', error);
            throw error;
        }
    };

    const handleEditCover = async (attachmentId, isCover, file = null) => {
        try {
            setCoverLoading?.(true);
            const updateData = { is_cover: isCover };

            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('is_cover', isCover);
                await updateAttachmentMutate({
                    attachmentId,
                    data: formData,
                });
            } else {
                await updateAttachmentMutate({
                    attachmentId,
                    data: updateData,
                });
            }

            const updatedAttachment = attachments.files.concat(attachments.links).find(a => a.id === attachmentId);
            if (setCard && isCover && updatedAttachment) {
                const newThumbnailUrl = updatedAttachment.path_url || updatedAttachment.file_url;
                setCard(prev => ({
                    ...prev,
                    thumbnail: newThumbnailUrl,
                }));
            }
            invalidateAttachments();
        } catch (error) {
            console.error('❌ Error updating cover:', error);
            throw error;
        } finally {
            setCoverLoading?.(false);
        }
    };

    const handleDeleteFile = async (attachmentId) => {
        try {
            await removeAttachmentMutate(attachmentId);
            const deletedAttachment = attachments.files.concat(attachments.links).find(a => a.id === attachmentId);
            const isCover = deletedAttachment?.is_cover;
            if (setCard && isCover) {
                setCard(prev => ({
                    ...prev,
                    thumbnail: null,
                }));
            }
            invalidateAttachments();
        } catch (error) {
            console.error('❌ Error deleting file:', error);
            throw error;
        }
    };

    const handleDeleteLink = async (linkId) => {
        try {
            await removeAttachmentMutate(linkId);
            invalidateAttachments();
        } catch (error) {
            console.error('❌ Error deleting link:', error);
            throw error;
        }
    };

    return (
        <AttachmentsContext.Provider
            value={{
                attachments,
                cardId,
                isLoading,
                error,
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
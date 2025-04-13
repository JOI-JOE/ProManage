import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    usePostAttachmentFile,
    usePostAttachmentLink,
    useFetchAttachments,
    usePutAttachment,
    useRemoveAttachment,
} from '../hooks/useCard';
import { useBoard } from './BoardContext';
// import { optimisticIdManager } from './optimisticIdManager'; // đường dẫn tuỳ vào vị trí file


const AttachmentsContext = createContext();

export const AttachmentsProvider = ({ children, cardId, setCard, setCoverLoading }) => {
    const { refetchListData } = useBoard();
    const { data: fetchedAttachments, isLoading, error, refetch } = useFetchAttachments(cardId);
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
    }, [fetchedAttachments]);

    // Function to handle upload of new files
    const handleUploadNewFiles = async (cardId, filesToUpload) => {
        try {
            const uploadFilePromises = filesToUpload.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file.originalFile);
                return postAttachmentFileMutate({ cardId, file: formData });
            });
            await Promise.all(uploadFilePromises);
            await refetch(); // Refetch attachments
            refetchListData(); // Update board data
        } catch (error) {
            console.error('❌ Error uploading files:', error);
            throw error;
        }
    };

    // Function to handle adding new links with optimistic update
    const handleAddNewLinks = async (cardId, linksToAdd) => {
        try {
            // Optimistic update: Add links to state immediately
            const tempLinks = linksToAdd.map(link => ({
                id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID
                type: 'link',
                file_name_defaut: link.file_name_defaut,
                path_url: link.path_url,
                created_at: new Date().toISOString(),
            }));

            await Promise.all(tempLinks); // Wait for all links to be added
            await refetch(); // Refetch to get the actual data
            refetchListData(); // Update board data
        } catch (error) {
            console.error('❌ Error adding new links:', error);
            // Rollback optimistic update on error
            setAttachments(prev => ({
                ...prev,
                links: prev.links.filter(link => !link.id.startsWith('temp-')),
            }));
            throw error;
        }
    };

    // Function to update file name
    const handleEditFile = async (fileId, newFileName) => {
        try {
            await updateAttachmentMutate({
                attachmentId: fileId,
                data: { file_name_defaut: newFileName },
            });
            await refetch();
            refetchListData();
        } catch (error) {
            console.error("Error editing file name:", error);
            throw error;
        }
    };
    // Function to update link
    const handleEditLink = async (linkId, newLinkName, newLinkUrl) => {
        try {
            await updateAttachmentMutate({
                attachmentId: linkId,
                data: {
                    file_name_defaut: newLinkName || newLinkUrl,
                    path_url: newLinkUrl,
                    type: "link",
                },
            });
            await refetch();
            refetchListData();
        } catch (error) {
            console.error("Error editing link:", error);
            throw error;
        }
    };

    // Function to update cover
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
            await refetch();
            refetchListData();
        } catch (error) {
            console.error('❌ Error updating cover:', error);
            throw error;
        } finally {
            setCoverLoading?.(false);
        }
    };
    // Function to delete file (uncomment when needed)
    const handleDeleteFile = async (attachmentId, file = null) => {
        try {
            setCoverLoading?.(true);
            await removeAttachmentMutate(attachmentId);
            const deletedAttachment = attachments.files.concat(attachments.links).find(a => a.id === attachmentId);
            const isCover = deletedAttachment?.is_cover;
            // Nếu attachment đang là cover → reset thumbnail
            if (setCard && isCover) {
                setCard(prev => ({
                    ...prev,
                    thumbnail: null,
                }));
            }
            await refetch();
            refetchListData();
        } catch (error) {
            console.error('❌ Error deleting file:', error);
            throw error;
        } finally {
            setCoverLoading?.(false);
        }
    };



    // Function to delete link (uncomment when needed)
    const handleDeleteLink = async (linkId) => {
        try {
            await removeAttachmentMutate(linkId);
            await refetch();
            refetchListData();
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
                refetch,
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
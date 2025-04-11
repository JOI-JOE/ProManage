import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePostAttachmentFile, usePostAttachmentLink, useFetchAttachments } from '../hooks/useCard';

const AttachmentsContext = createContext();

export const AttachmentsProvider = ({ children, cardId }) => {
    const { data: fetchedAttachments, isLoading, error, refetch } = useFetchAttachments(cardId);
    const [attachments, setAttachments] = useState({ links: [], files: [] });
    const { mutateAsync: postAttachmentFileMutate } = usePostAttachmentFile();
    const { mutateAsync: postAttachmentLinkMutate } = usePostAttachmentLink();


    useEffect(() => {
        if (fetchedAttachments?.data && Array.isArray(fetchedAttachments.data)) {
            const fetchedLinks = fetchedAttachments.data.filter(item => item.type === 'link');
            const fetchedFiles = fetchedAttachments.data.filter(item => item.type === 'file');
            setAttachments({ links: fetchedLinks, files: fetchedFiles });
        }
    }, [fetchedAttachments]);


    const handleUpdateAttachments = async (updatedAttachments, callback) => {
        setAttachments(updatedAttachments);

        // Identify new files to upload
        const newFilesToUpload = updatedAttachments.files.filter(
            (file) => file.originalFile
        );

        // Identify new links to add
        const newLinksToAdd = updatedAttachments.links.filter(
            (link) => !attachments.links.some(existingLink => existingLink.path_url === link.path_url && existingLink.file_name_defaut === link.file_name_defaut)
        );

        try {
            // Upload new files
            const uploadFilePromises = newFilesToUpload.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file.originalFile);
                return postAttachmentFileMutate({ cardId, file: formData });
            });
            await Promise.all(uploadFilePromises);
            console.log('✅ Successfully posted new files');

            // Add new links
            const addLinkPromises = newLinksToAdd.map(async (link) => {
                return postAttachmentLinkMutate({ cardId, linkData: { file_name_defaut: link.file_name_defaut, path_url: link.path_url, type: 'link' } });
            });
            await Promise.all(addLinkPromises);
            console.log('✅ Successfully posted new links');

            // Re-fetch attachments to update the context with the latest data
            await refetch();
            if (callback) callback(attachments); // Use the updated local state after refetch
        } catch (error) {
            console.error('❌ Error updating attachments:', error);
            // Optionally handle error feedback to the user
        }
    };

    const handleEditFile = (fileId, newFileName) => {
        const updatedFiles = attachments.files.map((file) =>
            file.id === fileId ? { ...file, file_name_defaut: newFileName } : file
        );
        handleUpdateAttachments({ ...attachments, files: updatedFiles });
        // Consider calling an API to update the file name on the server
    };

    const handleDeleteFile = (fileId) => {
        const updatedFiles = attachments.files.filter((file) => file.id !== fileId);
        handleUpdateAttachments({ ...attachments, files: updatedFiles }, refetch);
        // Consider calling an API to delete the file from the server
    };

    const handleEditLink = (linkId, newLinkName, newLinkUrl) => {
        const updatedLinks = attachments.links.map((link) =>
            link.id === linkId
                ? {
                    ...link,
                    file_name_defaut: newLinkName || newLinkUrl,
                    path_url: newLinkUrl.startsWith('http') ? newLinkUrl : `https://${newLinkUrl}`,
                }
                : link
        );
        handleUpdateAttachments({ ...attachments, links: updatedLinks });
        // Consider calling an API to update the link on the server
    };

    const handleDeleteLink = (linkId) => {
        const updatedLinks = attachments.links.filter((link) => link.id !== linkId);
        handleUpdateAttachments({ ...attachments, links: updatedLinks }, refetch);
        // Consider calling an API to delete the link from the server
    };

    return (
        <AttachmentsContext.Provider
            value={{
                attachments,
                cardId,
                isLoading,
                error,
                handleUpdateAttachments,
                handleEditFile,
                handleDeleteFile,
                handleEditLink,
                handleDeleteLink,
                refetch,
                setAttachments, // Expose setAttachments if needed for direct manipulation (use with caution)
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
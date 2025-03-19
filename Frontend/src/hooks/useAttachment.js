import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { getAttachmentsByCard, updateAttachment,} from "../api/attachmentApi";
import { createAttachments, deleteAttachment, getAttachmentsByCard, updateFileNameAttachment } from "../api/models/attachmentsApi";

const useAttachments = (cardId) => {
  const queryClient = useQueryClient();

  // 📌 Lấy danh sách attachment
  const { data: attachments = [], isLoading, error } = useQuery({
    queryKey: ["attachments", cardId],
    queryFn: () => getAttachmentsByCard(cardId),
  });

  // 📌 Mutation: Thêm mới attachment
  const addAttachmentMutation = useMutation({
    mutationFn: (formData) => createAttachments(cardId, formData),

    onMutate: async (newAttachment) => {
      await queryClient.cancelQueries(["attachments", cardId]); // Dừng re-fetch nếu có

      const previousAttachments = queryClient.getQueryData(["attachments", cardId]) || [];

      queryClient.setQueryData(["attachments", cardId], (oldData) => {
        const currentData = Array.isArray(oldData) ? oldData : [];
        return [...currentData, { id: Date.now(), ...newAttachment }];
      });

      return { previousAttachments };
    },

    onSuccess: () => {
      // Chỉ re-fetch API attachments
      queryClient.refetchQueries(["attachments", cardId], { exact: true });
    },

    onError: (_error, _newAttachment, context) => {
      queryClient.setQueryData(["attachments", cardId], context.previousAttachments);
    },
  });


  // 📌 Mutation: Sửa tên attachment
  const updateFileNameAttachmentMutation = useMutation({
    mutationFn: ({ cardId, attachmentId, newFileName }) =>
      updateFileNameAttachment(cardId, attachmentId, newFileName),
    onSuccess: () => {
      queryClient.invalidateQueries(["attachments", cardId]); // Cập nhật lại danh sách
    },
  });

  const removeAttachmentMutation = useMutation({
    mutationFn: (attachmentId) => deleteAttachment(cardId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries(["attachments"]);

    },
  });


  return {
    attachments,
    isLoading,
    error,
    addAttachment: addAttachmentMutation.mutate,
    updateAttachment: updateFileNameAttachmentMutation.mutate,
    removeAttachment: removeAttachmentMutation.mutate,
  };
};

export default useAttachments;

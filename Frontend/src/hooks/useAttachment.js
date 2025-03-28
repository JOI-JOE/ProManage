import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { getAttachmentsByCard, updateAttachment,} from "../api/attachmentApi";
import { createAttachments, deleteAttachment, getAttachmentsByCard, setCoverImage, updateFileNameAttachment } from "../api/models/attachmentsApi";
import { useEffect } from "react";
import echoInstance from "./realtime/useRealtime";

const useAttachments = (cardId) => {
  const queryClient = useQueryClient();

  // 📌 Lấy danh sách attachment
  const { data: attachments = [], isLoading, error } = useQuery({
    queryKey: ["attachments", cardId],
    queryFn: () => getAttachmentsByCard(cardId),
  });


  useEffect(() => {
    if (!cardId || !echoInstance) return;

    const channel = echoInstance.channel(`card.${cardId}`);
    // console.log(`📡 Đang lắng nghe kênh: card.${cardId}`);



    channel.listen(".attachment.uploaded", (data) => {
      // console.log('Realtime archive changed: ', data);

      // queryClient.invalidateQueries(['boardMembers']);
      queryClient.invalidateQueries({ queryKey: ["attachments", cardId], exact: true });
      queryClient.invalidateQueries({ queryKey: ["activities"], exact: true  });

    });

    channel.listen(".attachment.deleted_with_activity", (data) => {
      console.log('Realtime archive changed: ', data);


      queryClient.invalidateQueries({ queryKey: ["attachments"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });

    });

    return () => {
      channel.stopListening(".attachment.uploaded");
      channel.stopListening(".attachment.deleted_with_activity");
      //   channel.stopListening(".CardDelete");
      echoInstance.leave(`card.${cardId}`);
    };
  }, [cardId, queryClient]);


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
      // queryClient.refetchQueries(["attachments", cardId], { exact: true });
      queryClient.invalidateQueries({ queryKey: ["attachments", cardId], exact: true });
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
      queryClient.invalidateQueries({ queryKey: ["attachments", cardId], exact: true });
    },
  });

  const removeAttachmentMutation = useMutation({
    mutationFn: (attachmentId) => deleteAttachment(cardId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", cardId], exact: true });

    },
  });

  const setCoverImageMutation = useMutation({
    mutationFn: (attachmentId) => setCoverImage(cardId, attachmentId),
    onMutate: async (attachmentId) => {
      await queryClient.cancelQueries(["attachments", cardId]);
      const previousAttachments = queryClient.getQueryData(["attachments", cardId]) || [];

      queryClient.setQueryData(["attachments", cardId], (oldData) => {
        const currentData = Array.isArray(oldData) ? oldData : [];
        const isAlreadyCover = currentData.some((file) => file.id === attachmentId && file.is_cover);

        if (isAlreadyCover) {
          // Nếu đã là ảnh bìa, bỏ trạng thái ảnh bìa
          return currentData.map((file) =>
            file.id === attachmentId ? { ...file, is_cover: false } : file
          );
        } else {
          // Đặt ảnh bìa mới, xóa các ảnh bìa cũ
          return currentData.map((file) =>
            file.id === attachmentId
              ? { ...file, is_cover: true }
              : { ...file, is_cover: false }
          );
        }
      });

      return { previousAttachments };
    },
    onSuccess: () => {
      queryClient.refetchQueries(["attachments", cardId], { exact: true });
    },
    onError: (_error, _attachmentId, context) => {
      queryClient.setQueryData(["attachments", cardId], context.previousAttachments);
    },
  });








  return {
    attachments,
    isLoading,
    error,
    addAttachment: addAttachmentMutation.mutate,
    updateAttachment: updateFileNameAttachmentMutation.mutate,
    removeAttachment: removeAttachmentMutation.mutate,

    setCoverImages: setCoverImageMutation.mutate, // Thêm hàm để gọi từ component
  };
};

export default useAttachments;

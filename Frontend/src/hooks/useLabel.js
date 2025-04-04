import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { updateCardLabel, createLabel, getLabelsByBoard, getLabelsByCard, deleteLabelByBoard, updateLabelName } from "../api/models/labelsApi";
import {
  updateCardLabel,
  createLabel,
  getLabelsByCard,
  deleteLabelByBoard,
  updateLabelName,
} from "../api/models/labelsApi";
import echoInstance from "./realtime/useRealtime";
import { useEffect } from "react";
// Custom Hook để lấy labels

// export const useLabels = (boardId) => {
//     const queryClient = useQueryClient();
//     const labels = useQuery({
//         queryKey: ["labels", boardId], // Cache theo boardId
//         queryFn: () => getLabelsByBoard(boardId),
//         enabled: !!boardId, // Chỉ fetch khi có boardId
//         staleTime: 0, // Cache 1 phút
//     });

//     useEffect(() => {
//         if (!boardId) return;
//         const channel = echoInstance.channel(`board.${boardId}`);
//         // console.log(`📡 Đang lắng nghe kênh: board.${boardId}`);

//         channel.listen(".label.created", (event) => {
//             console.log("📡 Nhận sự kiện Label Created:", event);

//             queryClient.setQueryData(["labels", boardId], (oldData) => {
//                 return oldData ? [...oldData, event.label] : [event.label];
//             });

//             // queryClient.invalidateQueries({ queryKey: ["cardLabels", cardId] });
//             queryClient.invalidateQueries({ queryKey: ["labels", boardId], exact: true });
//             // queryClient.invalidateQueries({ queryKey: ["lists"] });
//         });

//         channel.listen(".label.nameUpdated", (event) => {
//             // console.log("📡 Nhận sự kiện Label Updated:", event);

//             queryClient.setQueryData(["labels", boardId], (oldLabels) => {
//                 console.log("🔄 Trước khi cập nhật:", oldLabels);

//                 if (!oldLabels) return [event.label];

//                 const updatedLabels = oldLabels.map((label) =>
//                     label.id === event.label.id ? event.label : label
//                 );

//                 console.log("✅ Sau khi cập nhật:", updatedLabels);
//                 return updatedLabels;
//             });

//             queryClient.invalidateQueries({ queryKey: ["labels"],boardId }); // Cập nhật UI
//             queryClient.invalidateQueries({ queryKey: ["cardLabels"] });
//             // queryClient.invalidateQueries({ queryKey: ["lists"] });

//         });

//         channel.listen(".label.deleted", (event) => {
//             console.log("📡 Label Deleted Event:", event);

//             queryClient.setQueryData(["labels", boardId], (oldLabels) => {
//                 if (!oldLabels) return [];

//                 return oldLabels.filter((label) => label.id !== event.labelId);
//             });
//             //  queryClient.invalidateQueries({ queryKey: ["lists"] });

//             queryClient.invalidateQueries({ queryKey: ["labels", boardId], exact: true });
//             // queryClient.invalidateQueries({ queryKey: ["labels"] });

//         });

//         return () => {
//             channel.stopListening(".label.created");
//             channel.stopListening(".label.nameUpdated");
//             channel.stopListening(".label.deleted");
//             echoInstance.leave(`board.${boardId}`);
//             // console.log(`🛑 Ngừng lắng nghe kênh: board.${boardId}`);
//         };
//     }, [boardId, queryClient]);

//     return labels;
// };

// thêm nhãn
export const useCreateLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
mutationFn: ({ boardId, data }) => createLabel(boardId, data), // 🟢 Sử dụng mutationFn thay vì truyền trực tiếp function

    onSuccess: (newLabel, { boardId }) => {
      queryClient.invalidateQueries({
        queryKey: ["labels", boardId],
        exact: true,
      });
    },

    onError: (error) => {
      console.error("Lỗi khi tạo nhãn:", error.response?.data || error.message);
    },
  });
};

export const useCardLabels = (cardId) => {
  const queryClient = useQueryClient();
  const labelCard = useQuery({
    queryKey: ["cardLabels", cardId],
    queryFn: () => getLabelsByCard(cardId),
    enabled: !!cardId, // Chỉ fetch khi có cardId
  });

  useEffect(() => {
    if (!cardId) return;

    const channel = echoInstance.channel(`card.${cardId}`);
    // console.log(`📡 Đang lắng nghe kênh: card.${cardId}`);

    channel.listen(".label.updated", (event) => {
      console.log("📡 Nhận sự kiện Label Updated:", event);

      queryClient.setQueryData(["labels", cardId], (oldLabels) => {
        if (!oldLabels) return event.labels; // Nếu chưa có data cũ, cập nhật luôn

        return [...event.labels]; // Gán danh sách labels mới từ sự kiện
      });

      queryClient.invalidateQueries({
        queryKey: ["cardLabels", cardId],
        exact: true,
      });

      queryClient.invalidateQueries({ queryKey: ["labels"] });
    });

    return () => {
      channel.stopListening(".label.updated");
      echoInstance.leave(`card.${cardId}`);
      // console.log(`🛑 Ngừng lắng nghe kênh: card.${cardId}`);
    };
  }, [cardId, queryClient]);

  return labelCard;
};
// thêm và xóa nhãn khỏi thẻ
export const useUpdateCardLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, labelId, action }) =>
      updateCardLabel(cardId, labelId, action),

    onSuccess: (_, { cardId, labelId, action, boardId }) => {
      // queryClient.invalidateQueries({ queryKey: ["cardLabels", cardId] })
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.invalidateQueries({
        queryKey: ["cardLabels", cardId],
        exact: true,
      });
    },
  });
};

export const useUpdateLabelName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ labelId, data }) => updateLabelName(labelId, data), // Gọi API cập nhật tên label
    onSuccess: (_, { boardId }) => {
      // Invalidate lại dữ liệu để cập nhật UI
      queryClient.invalidateQueries({
        queryKey: ["labels", boardId],
        exact: true,
      });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
    onError: (error) => {
      console.error(
        "❌ Lỗi khi cập nhật tên nhãn:",
        error.response?.data || error.message
      );
    },
  });
};

export const useDeleteLabelByBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ labelId }) => deleteLabelByBoard(labelId),
    onSuccess: (_, variables) => {
      const { boardId, cardId } = variables || {};
      queryClient.invalidateQueries({ queryKey: ["lists"] });

      if (boardId) {
        queryClient.invalidateQueries({
          queryKey: ["labels", boardId],
          exact: true,
        });
      }

      if (cardId) {
        queryClient.invalidateQueries({
          queryKey: ["cardLabels", cardId],
          exact: true,
        });
      }
    },
    onError: (error) => {
      console.error(
        "❌ Lỗi khi xóa nhãn:",
        error.response?.data || error.message
      );
    },
  });
};

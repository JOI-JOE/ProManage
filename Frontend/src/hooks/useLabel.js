import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateCardLabel, createLabel, getLabelsByBoard, getLabelsByCard, deleteLabelByBoard, updateLabelName } from "../api/models/labelsApi";
import echoInstance from "./realtime/useRealtime";
import { useEffect } from "react";
// Custom Hook để lấy labels
export const useLabels = (boardId) => {
    const queryClient = useQueryClient();
    const labels = useQuery({
        queryKey: ["labels", boardId], // Cache theo boardId
        queryFn: () => getLabelsByBoard(boardId),
        enabled: !!boardId, // Chỉ fetch khi có boardId
        staleTime: 0, // Cache 1 phút
    });

    useEffect(() => {
        if (!boardId) return;


        const channel = echoInstance.channel(`board.${boardId}`);
        // console.log(`📡 Đang lắng nghe kênh: board.${boardId}`);

        channel.listen(".label.created", (event) => {
            console.log("📡 Nhận sự kiện Label Created:", event);

            queryClient.setQueryData(["labels", boardId], (oldData) => {
                return oldData ? [...oldData, event.label] : [event.label];
            });

            queryClient.invalidateQueries({ queryKey: ["cardLabels", cardId] });
        });

        channel.listen(".label.nameUpdated", (event) => {
            // console.log("📡 Nhận sự kiện Label Updated:", event);

            queryClient.setQueryData(["labels", boardId], (oldLabels) => {
                console.log("🔄 Trước khi cập nhật:", oldLabels);
        
                if (!oldLabels) return [event.label];
        
                const updatedLabels = oldLabels.map((label) =>
                    label.id === event.label.id ? event.label : label
                );
        
                console.log("✅ Sau khi cập nhật:", updatedLabels);
                return updatedLabels;
            });


            queryClient.invalidateQueries({ queryKey: ["labels"],boardId }); // Cập nhật UI
            queryClient.invalidateQueries({ queryKey: ["cardLabels"] });
            // queryClient.invalidateQueries({ queryKey: ["lists"] });

        });

        channel.listen(".label.deleted", (event) => {
            console.log("📡 Label Deleted Event:", event);

            queryClient.setQueryData(["labels", boardId], (oldLabels) => {
                if (!oldLabels) return [];

                return oldLabels.filter((label) => label.id !== event.labelId);
            });

            queryClient.invalidateQueries({ queryKey: ["labels"] });

          
            queryClient.invalidateQueries({ queryKey: ["cardLabels"] });

          
        });


        return () => {
            channel.stopListening(".label.created");
            channel.stopListening(".label.nameUpdated");
            channel.stopListening(".label.deleted");
            echoInstance.leave(`board.${boardId}`);
            // console.log(`🛑 Ngừng lắng nghe kênh: board.${boardId}`);
        };
    }, [boardId, queryClient]);

    return labels;
};

// thêm nhãn
export const useCreateLabel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ boardId, data }) => createLabel(boardId, data), // 🟢 Sử dụng mutationFn thay vì truyền trực tiếp function

        onSuccess: (newLabel, { boardId }) => {
            // 🟢 Thay `variables.boardId` bằng `boardId`
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


            queryClient.invalidateQueries({ queryKey: ["cardLabels", cardId] }); // 🟢 Đảm bảo dữ liệu được làm mới

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
        mutationFn: ({ cardId, labelId, action }) => updateCardLabel(cardId, labelId, action),

        onSuccess: (_, { cardId, labelId, action, boardId }) => {
            // queryClient.invalidateQueries({ queryKey: ["cardLabels", cardId] })
            queryClient.invalidateQueries({ queryKey: ["lists"] });
        },
    });
};

export const useUpdateLabelName = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ labelId, data }) => updateLabelName(labelId, data), // 🟢 Gọi hàm updateLabel
        onError: (error) => {
            console.error("Lỗi khi cập nhật tên nhãn:", error.response?.data || error.message);
        },
        onSuccess: () => {
            // queryClient.invalidateQueries({ queryKey: ["cardLabels", cardId] })
            // queryClient.invalidateQueries({ queryKey: ["lists"] });
        },
    });
};


export const useDeleteLabelByBoard = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ labelId }) => deleteLabelByBoard(labelId), // Xóa label chỉ cần labelId
        onSuccess: () => {
           
            queryClient.invalidateQueries({ queryKey: ["lists"] });
          
        },
        onError: (error) => {
            console.error("Lỗi khi xóa nhãn:", error);
        },
    });
};



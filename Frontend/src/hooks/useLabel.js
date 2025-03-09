import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateCardLabel, createLabel, getLabelsByBoard, getLabelsByCard, deleteLabelByBoard, updateLabelName } from "../api/models/labelsApi";
// Custom Hook để lấy labels
export const useLabels = (boardId) => {
    return useQuery({
        queryKey: ["labels", boardId], // Cache theo boardId
        queryFn: () => getLabelsByBoard(boardId),
        enabled: !!boardId, // Chỉ fetch khi có boardId
        staleTime: 0, // Cache 1 phút
    });
};
// thêm nhãn
export const useCreateLabel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ boardId, data }) => createLabel(boardId, data), // 🟢 Sử dụng mutationFn thay vì truyền trực tiếp function

        onSuccess: (newLabel, { boardId }) => {
            queryClient.invalidateQueries({ queryKey: ["labels", boardId] }); // 🟢 Thay `variables.boardId` bằng `boardId`
        },

        onError: (error) => {
            console.error("Lỗi khi tạo nhãn:", error.response?.data || error.message);
        },
    });
};
// thêm và xóa nhãn khỏi thẻ
export const useUpdateCardLabel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ cardId, labelId, action }) => updateCardLabel(cardId, labelId, action),

        onSuccess: (_, { cardId, labelId, action, boardId }) => {
            
            queryClient.setQueryData(["cards", cardId], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    labels: action === "add"
                        ? [...oldData.labels, labelId] // Thêm label nếu action là "add"
                        : oldData.labels.filter(id => id !== labelId) // Xóa label nếu action là "remove"
                };
            });
        },
    });
};
export const useUpdateLabelName = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({  labelId, data }) => updateLabelName(labelId, data), // 🟢 Gọi hàm updateLabel

        onSuccess: (_, { boardId }) => {
            queryClient.invalidateQueries({ queryKey: ["labels", boardId] }); // 🟢 Cập nhật lại danh sách nhãn sau khi cập nhật thành công
            
        },

        onError: (error) => {
            console.error("Lỗi khi cập nhật tên nhãn:", error.response?.data || error.message);
        },
    });
};

export const useCardLabels = (cardId) => {
    return useQuery({
        queryKey: ["cardLabels", cardId],
        queryFn: () => getLabelsByCard(cardId),
        enabled: !!cardId, // Chỉ fetch khi có cardId
    });
};
export const useDeleteLabelByBoard = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ labelId }) => deleteLabelByBoard(labelId), // Xóa label chỉ cần labelId
        onSuccess: (_, { boardId }) => {
            queryClient.invalidateQueries(["labels", boardId]); // Chỉ cập nhật labels của board đó
        },
        onError: (error) => {
            console.error("Lỗi khi xóa nhãn:", error);
        },
    });
};



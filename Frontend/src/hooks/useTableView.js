import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addMemberIncardView, getListByBoard, getMemberByBoard, getTableView, RemoveMember, UpdateCardByList, updateDueDate } from "../api/models/table-viewApi";
import { updateCardLabel, createLabel, getLabelsByBoard, getLabelsByCard, deleteLabelByBoard, updateLabelName } from "../api/models/labelsApi";

export const useTableView = (boardIds = []) => {
    return useQuery({
        queryKey: ['table-view', boardIds],
        queryFn: async () => {
            const res = await getTableView(boardIds)
            return res || []  // đảm bảo return array
        },
        enabled: boardIds.length > 0,
        staleTime: 1000 * 60 * 5,  // 5 phút
        cacheTime: 1000 * 60 * 30, // 30 phút
    });
};
export const useListByBoard = (boardIds = []) => {
    return useQuery({
        queryKey: ['table-view-list', boardIds],
        queryFn: async () => {
            const res = await getListByBoard(boardIds)
            return res || []  // đảm bảo return array
        },
        enabled: boardIds.length > 0,
        staleTime: 1000 * 60 * 5,  // 5 phút
        cacheTime: 1000 * 60 * 30, // 30 phút
    });
};
export const useUpdateCardByList = () => {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: ({ cardId,
            listBoardId }) => UpdateCardByList(cardId, listBoardId),

        onSuccess: () => {

            queryClient.invalidateQueries({ queryKey: ["table-view"], exact: true });

        },
        onError: (error) => {
            console.error("❌ Lỗi khi cập nhật:", error.response?.data || error.message);
        },
    });
};
export const useMemberByBoard = (boardIds = []) => {
    return useQuery({
        queryKey: ['table-view-board-member', boardIds],
        queryFn: async () => {
            const res = await getMemberByBoard(boardIds)
            return res || []  // đảm bảo return array
        },
        enabled: boardIds.length > 0,
        staleTime: 1000 * 60 * 5,  // 5 phút
        cacheTime: 1000 * 60 * 30, // 30 phút
    });
};
export const useAddMemberByCard = () => {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: ({ cardId,
            memberId }) => addMemberIncardView(cardId, memberId),
        onSuccess: () => {

            queryClient.invalidateQueries({ queryKey: ["table-view"], exact: true });

        },
        onError: (error) => {
            console.error("❌ Lỗi khi thêm thành viên", error.response?.data || error.message);
        },
    });
};
export const useDeleteMemberIncard = () => {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: ({ cardId,
            memberId }) => RemoveMember(cardId, memberId),
        onSuccess: () => {

            queryClient.invalidateQueries({ queryKey: ["table-view"], exact: true });

        },
        onError: (error) => {
            console.error("❌ Lỗi khi xóa thành viên", error.response?.data || error.message);
        },
    });
};
export const useUpdateDueDate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ card_id, end_date, end_time, reminder }) => {
            console.log("useUpdateDueDate: preparing to call updateDueDate with:", {
                card_id,
                end_date,
                end_time,
                reminder,
            });
            return updateDueDate(card_id, { end_date, end_time, reminder });
        },
       
    });
};

// Custom Hook để lấy labels
export const useLabels = (boardId) => {
    const queryClient = useQueryClient();
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

       
    });
};


export const useCardLabels = (cardId) => {
    const queryClient = useQueryClient();
    return useQuery({
        queryKey: ["cardLabels", cardId],
        queryFn: () => getLabelsByCard(cardId),
        enabled: !!cardId, // Chỉ fetch khi có cardId
    });


  
};
// thêm và xóa nhãn khỏi thẻ
export const useUpdateCardLabel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ cardId, labelId, action }) => updateCardLabel(cardId, labelId, action),

    });
};

export const useUpdateLabelName = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ labelId, data }) => updateLabelName(labelId, data), // Gọi API cập nhật tên label
        
    });
};

export const useDeleteLabelByBoard = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ labelId }) => deleteLabelByBoard(labelId),
       
        onError: (error) => {
            console.error("❌ Lỗi khi xóa nhãn:", error.response?.data || error.message);
        },
    });
};

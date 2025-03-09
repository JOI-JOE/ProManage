import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getChecklistsByCard, createCheckList, updateCheckList, deleteCheckList } from "../api/models/checkListsApi";


export const useChecklistsByCard = (cardId) => {
    return useQuery({
        queryKey: ["checklists", cardId],
        queryFn: () => getChecklistsByCard(cardId), // Gọi API lấy danh sách comment
        enabled: !!cardId, // Chỉ gọi API nếu có cardId
        staleTime: 1000 * 60 * 5, // Cache trong 5 phút
        cacheTime: 1000 * 60 * 30, // Giữ cache trong 30 phút
    });
};

export const useCreateCheckList = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ card_id, name }) => createCheckList({ card_id, name }), // Gọi API tạo checklist
        onSuccess: (newCheckList, variables) => {
            queryClient.invalidateQueries(["checklists", variables.card_id]); // Cập nhật lại danh sách checklist
        },
        onError: (error) => {
            console.error("❌ Lỗi khi thêm checklist:", error);
        },
    });
};

export const useUpdateCheckList = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, name }) => updateCheckList({ id, name }), // Gọi API cập nhật
        onSuccess: (_, variables) => {
            // Làm mới dữ liệu checklist sau khi cập nhật thành công
            queryClient.invalidateQueries(["checklists", variables.card_id]);
        },
        onError: (error) => {
            console.error("❌ Lỗi khi cập nhật checklist:", error);
        },
        
    });
};

export const useDeleteCheckList = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (checklistId) => deleteCheckList(checklistId), // Gọi API xóa checklist
        onSuccess: (_, checklistId) => {
            console.log(`✅ Xóa checklist thành công: ${checklistId}`);

            // Cập nhật danh sách checklist sau khi xóa
            queryClient.setQueryData(["checklists"], (oldChecklists = []) =>
                oldChecklists.filter((c) => c.id !== checklistId)
            );
        },
        onError: (error) => {
            console.error("❌ Lỗi khi xóa checklist:", error);
        }
    });
};

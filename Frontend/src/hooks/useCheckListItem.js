import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCheckListItem, deleteCheckListItem, toggleCheckListItemStatus, updateCheckListItemName } from "../api/models/checkListItemsApi";

export const useCreateCheckListItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ checklist_id, name }) =>
            createCheckListItem({ checklist_id, name }), // Gọi API thêm checklist item
        onSuccess: (newItem, variables) => {
            console.log("✅ Thêm mục checklist thành công:", newItem);

            // Cập nhật danh sách CheckListItem
            queryClient.invalidateQueries(["checklist-items", variables.checklist_id]);
        },
        onError: (error) => {
            console.error("❌ Lỗi khi thêm mục checklist:", error);
        },
    });
};


export const useToggleCheckListItemStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (itemId) => toggleCheckListItemStatus(itemId),
        onSuccess: (_, itemId) => {
            console.log(`✅ Trạng thái item ${itemId} đã được cập nhật.`);

            // Cập nhật lại danh sách checklist sau khi thay đổi trạng thái
            queryClient.invalidateQueries(["checklist-items"]);
        },
        onError: (error) => {
            console.error("❌ Lỗi khi cập nhật trạng thái:", error);
        },
    });
};

export const useUpdateCheckListItemName = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ itemId, name }) => updateCheckListItemName(itemId, name),
        onSuccess: (_, variables) => {
            console.log(`✅ Cập nhật tên checklist item thành công: ${variables.itemId}`);

            // Cập nhật danh sách checklist ngay lập tức
            queryClient.invalidateQueries(["checklist-items", variables.checklist_id]);
        },
        onError: (error) => {
            console.error("❌ Lỗi khi cập nhật tên checklist item:", error);
        },
        onSettled: () => {
            // Đảm bảo dữ liệu được đồng bộ sau khi xóa
            queryClient.invalidateQueries(["checklist-items"]);
        },
    });
};

export const useDeleteCheckListItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => deleteCheckListItem(id),
        onMutate: async (id) => {
            // Hủy các query đang chạy
            await queryClient.cancelQueries(["checklist-items"]);

            // Lấy dữ liệu cũ
            const previousItems = queryClient.getQueryData(["checklist-items"]);

            // Cập nhật danh sách ngay lập tức mà không cần reload trang
            queryClient.setQueryData(["checklist-items"], (oldItems = []) =>
                oldItems.filter((item) => item.id !== id)
            );

            return { previousItems };
        },
        onError: (error, id, context) => {
            console.error("❌ Lỗi khi xóa ChecklistItem:", error);
            // Nếu lỗi, khôi phục dữ liệu cũ
            queryClient.setQueryData(["checklist-items"], context.previousItems);
        },
        onSettled: () => {
            // Đảm bảo dữ liệu được đồng bộ sau khi xóa
            queryClient.invalidateQueries(["checklist-items"]);
        },
    });
};
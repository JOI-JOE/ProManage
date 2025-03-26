import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getChecklistItemsByCheckList, createCheckListItem, deleteCheckListItem, toggleCheckListItemStatus, updateCheckListItemName, toggleCheckListItemMember, getMembersInCheckListItem } from "../api/models/checkListItemsApi";
import { useEffect } from "react";
import echoInstance from "./realtime/useRealtime";


// export const useChecklistsItemByCheckListItem = (itemId) => {
//     return useQuery({
//         queryKey: ["checklist-items", itemId],
//         queryFn: () => getChecklistItemsByCheckList(itemId), // Gọi API lấy danh sách comment
//         enabled: !!itemId, // Chỉ gọi API nếu có cardId
//         staleTime: 1000 * 60 * 5, // Cache trong 5 phút
//         cacheTime: 1000 * 60 * 30, // Giữ cache trong 30 phút
//     });
// };




export const useCreateCheckListItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ checklist_id, name }) => createCheckListItem({ checklist_id, name }),

        onSuccess: (newItem, { checklist_id, cardId }) => {
            console.log("✅ Thêm mục checklist thành công:", newItem);

            // Cập nhật lại danh sách checklistItems của checklist đó
            queryClient.invalidateQueries({ queryKey: ["checklistItems", checklist_id], exact: true });

            // Cập nhật lại checklist chứa item (ví dụ completion rate)
            queryClient.invalidateQueries({ queryKey: ["checklists", cardId], exact: true });

            // Cập nhật activity nếu backend có trả ra activity mới
            // queryClient.invalidateQueries({ queryKey: ["activities", cardId], exact: true });
        },

        onError: (error) => {
            console.error("❌ Lỗi khi thêm mục checklist:", error);
        },
    });
};




export const useToggleCheckListItemStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ itemId }) => toggleCheckListItemStatus(itemId),
        onSuccess: (_, { itemId, cardId }) => {
            console.log(`✅ Trạng thái item ${itemId} đã được cập nhật.`);

            // Cập nhật lại danh sách item của checklist
            // queryClient.invalidateQueries({ queryKey: ["checklistItems", checklist_id], exact: true });

            // Cập nhật lại checklist (tỉ lệ completion)
            queryClient.invalidateQueries({ queryKey: ["checklists", cardId], exact: true });

            // Cập nhật activity nếu có
            queryClient.invalidateQueries({ queryKey: ["activities", cardId], exact: true });
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
        onSuccess: (_, { cardId }) => {
            console.log(`✅ Cập nhật tên checklist item thành công.`);

            // Làm mới danh sách items thuộc checklist
            // queryClient.invalidateQueries({ queryKey: ["checklistItems", checklist_id], exact: true });

            // Nếu cần cập nhật checklist cha
            queryClient.invalidateQueries({ queryKey: ["checklists", cardId], exact: true });
        },
        onError: (error) => {
            console.error("❌ Lỗi khi cập nhật tên checklist item:", error);
        },
    });
};

export const useDeleteCheckListItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id }) => deleteCheckListItem(id),
        onMutate: async ({ id, checklist_id }) => {
            // Hủy các query liên quan đang chạy
            await queryClient.cancelQueries({ queryKey: ["checklistItems", checklist_id] });

            // Lưu lại dữ liệu cũ
            const previousItems = queryClient.getQueryData(["checklistItems", checklist_id]);

            // Optimistic update: xóa luôn trong cache
            queryClient.setQueryData(["checklistItems", checklist_id], (oldItems = []) =>
                oldItems.filter((item) => item.id !== id)
            );

            return { previousItems, checklist_id };
        },
        onError: (error, { id, checklist_id }, context) => {
            console.error("❌ Lỗi khi xóa ChecklistItem:", error);
            // Rollback dữ liệu nếu lỗi
            if (context?.previousItems) {
                queryClient.setQueryData(["checklistItems", checklist_id], context.previousItems);
            }
        },
        onSettled: (_, __, { cardId }) => {
            // Làm mới dữ liệu sau cùng
            // queryClient.invalidateQueries({ queryKey: ["checklistItems", checklist_id], exact: true });
            queryClient.invalidateQueries({ queryKey: ["checklists", cardId], exact: true });
            queryClient.invalidateQueries({ queryKey: ["lists"] });
        },
    });
};


export const useGetMemberInCheckListItem = (itemId) => {
    const queryClient = useQueryClient();
    const checkListMembers = useQuery({
        queryKey: ["checklist-item-members", itemId],
        queryFn: () => getMembersInCheckListItem(itemId),
        enabled: !!itemId, // chỉ gọi khi có itemId
        staleTime: 1000 * 60, // 1 phút không bị gọi lại
        cacheTime: 1000 * 300, // giữ cache 5 phút
    });

    useEffect(() => {
        if (!itemId || !echoInstance) return;

        const channel = echoInstance.channel(`checklist-item.${itemId}`);
        // console.log(`📡 Đang lắng nghe kênh: card.${cardId}`);

        channel.listen(".ChecklistItemMemberUpdated", (event) => {
            // console.log("🔄 Nhận sự kiện ChecklistItemMemberUpdated:", event);

            queryClient.invalidateQueries({ queryKey: ["checklist-item-members", itemId]});

        });

        return () => {
            channel.stopListening(".ChecklistItemMemberUpdated");
            echoInstance.leave(`checklist-item.${itemId}`);
        };
    }, [itemId, queryClient]);

    return checkListMembers;

};

export const useToggleCheckListItemMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ itemId, userId }) => toggleCheckListItemMember(itemId, userId),
        onSuccess: (_, variables) => {
            // console.log(`✅ Toggle thành viên thành công: itemId = ${variables.itemId}, userId = ${variables.userId}`);
            // Tùy chọn: Invalidate query để load lại danh sách thành viên hoặc checklist items nếu cần
            // queryClient.invalidateQueries({ queryKey: ["checklists"] });
            // hoặc nếu bạn lưu riêng: 
            queryClient.invalidateQueries({ queryKey: ["checklist-item-members", variables.itemId] });
        },
        onError: (error) => {
            console.error("❌ Lỗi khi toggle member checklist item:", error);
        },
    });
};



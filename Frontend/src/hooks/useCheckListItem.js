import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getChecklistItemsByCheckList, createCheckListItem, deleteCheckListItem, toggleCheckListItemStatus, updateCheckListItemName, toggleCheckListItemMember, getMembersInCheckListItem } from "../api/models/checkListItemsApi";
import { useEffect } from "react";
import echoInstance from "./realtime/useRealtime";


// export const useChecklistsItemByCheckList = (checklist_id) => {
//     return useQuery({
//         queryKey: ["checklist-items", checklist_id],
//         queryFn: () => getChecklistItemsByCheckList(checklist_id), // Gọi API lấy danh sách comment
//         enabled: !!checklist_id, // Chỉ gọi API nếu có cardId
//         staleTime: 1000 * 60 * 5, // Cache trong 5 phút
//         cacheTime: 1000 * 60 * 30, // Giữ cache trong 30 phút
//     });
// };



export const useCreateCheckListItem = () => {
    const queryClient = useQueryClient();

    // const { checklist_id } = variables;

    // console.log(checklist_id);

    const createItem = useMutation({
        mutationFn: ({ checklist_id, name }) => createCheckListItem({ checklist_id, name }),

        onSuccess: (newItem, { checklist_id }) => {

            console.log("✅ Thêm mục checklist thành công:", newItem);
            console.log("🆕 Checklist ID:", checklist_id);

            // console.log(`📡 Đang lắng nghe kênh: checklist.${checklist_id}`);

            // setLatestChecklistId(checklist_id);


            // Cập nhật danh sách CheckListItem liên quan
            // queryClient.invalidateQueries({ queryKey: ["checklistItems", checklist_id] });
            // queryClient.invalidateQueries({ queryKey: ["checklists"] });
            queryClient.invalidateQueries({ queryKey: ["lists"] });
        },

        onError: (error) => {
            console.error("❌ Lỗi khi thêm mục checklist:", error);
        },
    });

    return createItem

};



export const useToggleCheckListItemStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (itemId) => toggleCheckListItemStatus(itemId),
        onSuccess: (_, itemId) => {
            console.log(`✅ Trạng thái item ${itemId} đã được cập nhật.`);

            // queryClient.invalidateQueries({ queryKey: ["checklists"] });
            queryClient.invalidateQueries({ queryKey: ["lists"] });
            // queryClient.invalidateQueries({ queryKey: ["activities"] }); 
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
            // queryClient.invalidateQueries({ queryKey: ["checklists"] });
        },
        onError: (error) => {
            console.error("❌ Lỗi khi cập nhật tên checklist item:", error);
        },
        // onSettled: () => {
        //     // Đảm bảo dữ liệu được đồng bộ sau khi xóa
        //     queryClient.invalidateQueries(["checklist-items"]);
        // },
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
            // queryClient.invalidateQueries({ queryKey: ["checklists"] });
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

            queryClient.invalidateQueries({ queryKey: ["checklist-item-members", itemId] });

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
            console.log(`✅ Toggle thành viên thành công: itemId = ${variables.itemId}, userId = ${variables.userId}`);
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



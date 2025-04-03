import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getChecklistsByCard, createCheckList, updateCheckList, deleteCheckList } from "../api/models/checkListsApi";
import { useEffect } from "react";
import echoInstance from "./realtime/useRealtime";


export const useChecklistsByCard = (cardId) => {
    const queryClient = useQueryClient();
    const checklists = useQuery({
        queryKey: ["checklists", cardId],
        queryFn: () => getChecklistsByCard(cardId), // Gọi API lấy danh sách comment
        enabled: !!cardId, // Chỉ gọi API nếu có cardId
        staleTime: 0, // Cache trong 5 phút
        cacheTime: 1000 * 60 * 30, // Giữ cache trong 30 phút
    });

    useEffect(() => {
        if (!cardId) {
            // console.warn("❌ checklist_id chưa có, không đăng ký kênh.");
            return;
        }
    
        // console.log(`📡 Đang lắng nghe kênh: checklist.${cardId}`);
    
        const channel = echoInstance.channel(`checklist.${cardId}`);
    
        channel.listen(".checklistItem.created", (event) => {
            // console.log("📡 Nhận sự kiện ChecklistItemCreated:", event);
    
            // queryClient.setQueryData(["checklistItems", event.checklistItem.checklist.id], (oldItems) => {
            //     console.log("🔄 Cập nhật danh sách cũ:", oldItems);
            //     if (!oldItems) return [event.checklistItem]; // Nếu danh sách rỗng, thêm mới
            //     return [...oldItems, event.checklistItem]; // Thêm item mới vào danh sách
            // });
    
            // queryClient.invalidateQueries({ queryKey: ["checklists"], exact: true  });
            // queryClient.invalidateQueries({ queryKey: ["checklistItems", event.checklistItem.checklist.id], exact: true});
            queryClient.invalidateQueries({ queryKey: ["checklists", cardId], exact: true });

        });

        channel.listen(".checklistItem.updated", (event) => {
            // console.log("🔄 Nhận sự kiện ChecklistItemUpdated:", event);
    
            // queryClient.setQueryData(["checklistItems", event.checklistItem.checklist.id], (oldItems) => {
            //     if (!oldItems) return [];
    
            //     return oldItems.map((item) =>
            //         item.id === event.item.id ? { ...item, name: event.item.name } : item
            //     );
            // });
    
            queryClient.invalidateQueries({ queryKey: ["checklists", cardId], exact: true });

        });

        channel.listen(".checklistItem.deleted", (event) => {
            // console.log("❌ Nhận sự kiện ChecklistItemDeleted:", event);
        
            // queryClient.setQueryData(["checklistItems", cardId], (oldItems) => {
            //     if (!oldItems) return [];
                
            //     return oldItems.filter((item) => item.id !== Number(event.itemId)); // 🔥 Chuyển itemId về số
            // });
        
            // queryClient.invalidateQueries({ queryKey: ["cards", cardId] });
            // queryClient.invalidateQueries({ queryKey: ["checklists", cardId ] });
            // queryClient.invalidateQueries({ queryKey: ["checklistItems", event.checklistItem.checklist.id] });
            queryClient.invalidateQueries({ queryKey: ["checklists", cardId], exact: true });


        });

        channel.listen(".checklist.updated", (event) => {
            // console.log("🔄 Nhận sự kiện ChecklistUpdated:", event);
    
            // queryClient.setQueryData(["checklists"], (oldChecklists) => {
            //     if (!oldChecklists) return [];
    
            //     return oldChecklists.map((checklist) =>
            //         checklist.id === event.checklist.id ? { ...checklist, name: event.checklist.name } : checklist
            //     );
            // });
    
            queryClient.invalidateQueries({ queryKey: ["checklists", cardId], exact: true });
        });

        channel.listen(".checklist.created", () => {
            queryClient.invalidateQueries({ queryKey: ["checklists", cardId], exact: true });
            queryClient.invalidateQueries({ queryKey: ["activities", cardId], exact: true });
        });

        channel.listen(".checklist.deleted", () => {
            queryClient.invalidateQueries({ queryKey: ["checklists", cardId], exact: true });
            queryClient.invalidateQueries({ queryKey: ["activities", cardId], exact: true });
        });

        channel.listen(".checklistItem.toggle", () => {
            queryClient.invalidateQueries({ queryKey: ["checklists", cardId], exact: true });
            queryClient.invalidateQueries({ queryKey: ["activities", cardId], exact: true });
            queryClient.invalidateQueries({ queryKey: ["lists"] });
        });
        

     


        
    
        return () => {
            channel.stopListening(".checklistItem.created");
            channel.stopListening(".checklistItem.updated");
            channel.stopListening(".checklistItem.deleted");
            channel.stopListening(".checklist.updated");
            channel.stopListening(".checklist.created");
            channel.stopListening(".checklist.deleted");
            channel.stopListening(".checklistItem.toggle");
          
            echoInstance.leave(`checklist.${cardId}`);
        };
    }, [cardId, queryClient]); 

    return checklists
};

export const useCreateCheckList = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ card_id, name }) => createCheckList({ card_id, name }), // Gọi API tạo checklist
        onSuccess: (newCheckList, { card_id }) => {
            queryClient.invalidateQueries({ queryKey: ["checklists", card_id], exact:true });
            queryClient.invalidateQueries({ queryKey: ["activities", card_id], exact:true}); 
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
        onSuccess: (_, { cardId }) => {
            // Invalidate chính xác theo cardId
            queryClient.invalidateQueries({ queryKey: ["checklists", cardId], exact: true });
            // queryClient.invalidateQueries({ queryKey: ["activities", cardId], exact: true });
        },
        onError: (error) => {
            console.error("❌ Lỗi khi cập nhật checklist:", error);
        },
    });
};


export const useDeleteCheckList = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ checklistId, cardId }) => deleteCheckList(checklistId), 
        onSuccess: (_, { checklistId, cardId }) => {
            // Xóa trực tiếp trong cache cho nhanh
            queryClient.setQueryData(["checklists", cardId], (oldChecklists = []) =>
                oldChecklists.filter((c) => c.id !== checklistId)
            );

            // Sau đó vẫn có thể invalidate để đảm bảo đồng bộ
            queryClient.invalidateQueries({ queryKey: ["checklists", cardId], exact: true });
            queryClient.invalidateQueries({ queryKey: ["activities", cardId], exact: true });
        },
        onError: (error) => {
            console.error("❌ Lỗi khi xóa checklist:", error);
        }
    });
};



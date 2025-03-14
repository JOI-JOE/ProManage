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
        staleTime: 1000 * 60 * 5, // Cache trong 5 phút
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
            console.log("📡 Nhận sự kiện ChecklistItemCreated:", event);
    
            queryClient.setQueryData(["checklistItems", event.checklistItem.checklist.id], (oldItems) => {
                console.log("🔄 Cập nhật danh sách cũ:", oldItems);
                if (!oldItems) return [event.checklistItem]; // Nếu danh sách rỗng, thêm mới
                return [...oldItems, event.checklistItem]; // Thêm item mới vào danh sách
            });
    
            queryClient.invalidateQueries({ queryKey: ["checklists"] });
            queryClient.invalidateQueries({ queryKey: ["checklistItems", event.checklistItem.checklist.id] });

        });

        channel.listen(".checklistItem.updated", (event) => {
            console.log("🔄 Nhận sự kiện ChecklistItemUpdated:", event);
    
            // queryClient.setQueryData(["checklistItems", event.checklistItem.checklist.id], (oldItems) => {
            //     if (!oldItems) return [];
    
            //     return oldItems.map((item) =>
            //         item.id === event.item.id ? { ...item, name: event.item.name } : item
            //     );
            // });
    
            queryClient.invalidateQueries({ queryKey: ["checklists", cardId] });

        });

        channel.listen(".checklistItem.deleted", (event) => {
            console.log("❌ Nhận sự kiện ChecklistItemDeleted:", event);
        
            // queryClient.setQueryData(["checklistItems", cardId], (oldItems) => {
            //     if (!oldItems) return [];
                
            //     return oldItems.filter((item) => item.id !== Number(event.itemId)); // 🔥 Chuyển itemId về số
            // });
        
            // queryClient.invalidateQueries({ queryKey: ["cards", cardId] });
            queryClient.invalidateQueries({ queryKey: ["checklists", cardId ] });
            queryClient.invalidateQueries({ queryKey: ["checklistItems", event.checklistItem.checklist.id] });

        });

        channel.listen(".checklist.updated", (event) => {
            console.log("🔄 Nhận sự kiện ChecklistUpdated:", event);
    
            queryClient.setQueryData(["checklists"], (oldChecklists) => {
                if (!oldChecklists) return [];
    
                return oldChecklists.map((checklist) =>
                    checklist.id === event.checklist.id ? { ...checklist, name: event.checklist.name } : checklist
                );
            });
    
            queryClient.invalidateQueries({ queryKey: ["checklists"] });
        });

        channel.listen(".checklist.created", (event) => {
            console.log("📡 Nhận sự kiện ChecklistCreated:", event);


            queryClient.invalidateQueries({ queryKey: ["checklists"] });
            queryClient.invalidateQueries({ queryKey: ["activities", cardId] });
        });

        channel.listen(".checklist.deleted", (event) => {
            console.log("🗑 Checklist bị xóa:", event);
        
            // Cập nhật danh sách checklist
            // queryClient.setQueryData(["checklists", event.cardId], (oldChecklists) => {
            //     if (!oldChecklists) return [];
            //     return oldChecklists.filter(checklist => checklist.id !== event.checklistId);
            // });
        
            // // Cập nhật activity nếu có
            // if (event.activity) {
            //     queryClient.setQueryData(["activities", event.cardId], (oldActivities) => {
            //         if (!oldActivities) return [];
            //         return [...oldActivities, event.activity];
            //     });
            // }
        
            queryClient.invalidateQueries({ queryKey: ["checklists"] });
            queryClient.invalidateQueries({ queryKey: ["activities"] });
        });


        channel.listen(".checklistItem.toggle", (event) => {
            console.log("📡 Nhận sự kiện ChecklistItemToggle:", event);
        
            queryClient.setQueryData(["checklistItems", event.checklistItem.checklist_id], (oldItems) => {
                if (!oldItems) return [event.checklistItem];
        
                return oldItems.map((item) =>
                    item.id === event.checklistItem.id ? event.checklistItem : item
                );
            });
        
            // Cập nhật phần trăm hoàn thành của checklist
            queryClient.setQueryData(["checklists"], (oldChecklists) => {
                if (!oldChecklists) return [];
        
                return oldChecklists.map((checklist) =>
                    checklist.id === event.checklistItem.checklist_id
                        ? { ...checklist, completion_rate: event.completionRate }
                        : checklist
                );
            });
        
            // Nếu có activity, cập nhật danh sách hoạt động
            if (event.activity) {
                queryClient.setQueryData(["activities"], (oldActivities) => {
                    return oldActivities ? [event.activity, ...oldActivities] : [event.activity];
                });
            }

            queryClient.invalidateQueries({queryKey: ["checklists"]});
            queryClient.invalidateQueries({ queryKey: ["activities"] }); 
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
            // queryClient.invalidateQueries({ queryKey: ["checklists", card_id] }); // Cập nhật lại danh sách checklist
            // queryClient.invalidateQueries({ queryKey: ["activities"] }); 
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
        onSuccess: (_, { card_id }) => {
            // queryClient.invalidateQueries({ queryKey: ["checklists", card_id] });
            // queryClient.invalidateQueries({ queryKey: ["checklists"] });
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

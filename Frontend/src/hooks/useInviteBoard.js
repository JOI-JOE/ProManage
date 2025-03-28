import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {generateInviteLink, getBoardMembers, getGuestBoards, removeInviteLink, removeMemberFromBoard, updateRoleMemberInBoards } from "../api/models/inviteBoardApi";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import echoInstance from "./realtime/useRealtime";
import { toast } from "react-toastify";


export const useGetBoardMembers = (boardId) => {

    const queryClient = useQueryClient();

    const boardMembers=  useQuery({
        queryKey: ["boardMembers", boardId], // Cache theo boardId
        queryFn: () => getBoardMembers(boardId),
        enabled: !!boardId, // Chỉ fetch khi có boardId
        staleTime: 60 * 1000, // Cache 1 phút (60000 ms)
        cacheTime: 5 * 60 * 1000, // Lưu cache 5 phút để tối ưu
        retry: 2, // Tự động thử lại 2 lần nếu lỗi
        refetchOnWindowFocus: false, // Không fetch lại khi chuyển tab
    });

    useEffect(() => {
        if (!boardId || !echoInstance) return;
    
        const channel = echoInstance.channel(`boards.${boardId}`);
        // console.log(`📡 Đang lắng nghe kênh: card.${cardId}`);
    
    
       
        channel.listen(".BoardUpdateRole", (data) => {
            console.log('Realtime archive changed: ', data);
           
            queryClient.invalidateQueries(['boardMembers']);
      
          });
    
        return () => {
          channel.stopListening(".BoardUpdateRole");
        //   channel.stopListening(".CardDelete");
          echoInstance.leave(`boards.${boardId}`);
        };
      }, [boardId, queryClient]);
    
    

    return boardMembers;
};


export const useGenerateInviteLink = (setLink) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: generateInviteLink, // Gọi API tạo link
        onSuccess: (data) => {
            const inviteLink = data.invite_link; // Lấy link từ response API
            
            if (inviteLink) {
                toast.success("Tạo link mời thành công ")
                   // Cập nhật state ngay lập tức
                   setLink(inviteLink);

                navigator.clipboard.writeText(inviteLink) // Lưu vào clipboard
                    // .then(() => console.log("Đã sao chép link mời:", inviteLink))
                    .catch(err => console.error("Lỗi khi sao chép:", err));

                     // Lưu vào localStorage để sử dụng lại
                localStorage.setItem("InviteLink", inviteLink);
            }

            // queryClient.invalidateQueries(["workspaces"]); // Cập nhật dữ liệu nếu cần
        },
        onError: (error) => {
            console.error("Lỗi khi tạo link mời:", error);
            toast.error("Tạo link không thành công ")
        },
    });
};


export const useUpdateRoleMemberInBoards = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ boardId, userId, role }) => updateRoleMemberInBoards(boardId, userId, role),
        onSuccess: (data) => {
            if (data.success) {
                console.log("Vai trò đã được cập nhật thành công:", data.message);

                // Cập nhật lại dữ liệu trong cache (nếu cần)
                queryClient.invalidateQueries({ queryKey: ["boardMembers",data.boardId], exact: true });
            }
        },
        onError: (error) => {
            const errorMessage = error.message || 'Lỗi không xác định';
            console.error("Lỗi khi cập nhật vai trò thành viên:", errorMessage);
        },
    });
};


export const useRemoveMemberFromBoard = (currentUserId) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
  
    // Mutation để xóa thành viên
    const mutation = useMutation({
      mutationFn: ({ boardId, userId }) => removeMemberFromBoard(boardId, userId),
      onSuccess: (data, variables) => {
        if (data.success) {
          console.log("Thành viên đã được xóa khỏi bảng:", data.message);
  
          // Cập nhật cache boardMembers ngay lập tức
          queryClient.setQueryData(
            ["boardMembers", variables.boardId],
            (oldData) => {
              if (!oldData || !oldData.data) return oldData;
              const updatedMembers = oldData.data.filter(
                (member) => member.id !== variables.userId
              );
              return { ...oldData, data: updatedMembers };
            }
          );
  
          // Cập nhật cache cards (gỡ thành viên khỏi thẻ)
          queryClient.setQueryData(["membersInCard", variables.boardId], (oldData) => {
            if (!oldData || !oldData.data) return oldData;
            const updatedCards = oldData.data.map((card) => ({
              ...card,
              members: card.members
                ? card.members.filter((member) => member.id !== variables.userId)
                : [],
            }));
            return { ...oldData, data: updatedCards };
          });
  
          // Cập nhật cache checklistItems (gỡ thành viên khỏi checklist_item_user)
          queryClient.setQueryData(
            ["checklist-item-members", variables.boardId],
            (oldData) => {
              if (!oldData || !oldData.data) return oldData;
              const updatedItems = oldData.data.map((item) => ({
                ...item,
                users: item.users
                  ? item.users.filter((user) => user.id !== variables.userId)
                  : [],
              }));
              return { ...oldData, data: updatedItems };
            }
          );
  
          // Làm mới dữ liệu từ server
          queryClient.invalidateQueries({ queryKey: ["boardMembers", variables.boardId], exact: true });
          queryClient.invalidateQueries({ queryKey: ["membersInCard", variables.boardId], exact: true });
          queryClient.invalidateQueries({ queryKey: ["checklist-item-members", variables.boardId], exact: true });
          
        }
      },
      onError: (error) => {
        const errorMessage = error.message || "Lỗi không xác định";
        console.error("Lỗi khi xóa thành viên:", errorMessage);
      },
    });
  
    // Lắng nghe event realtime cho người dùng hiện tại
    useEffect(() => {
      if (!currentUserId) return;
  
      // Subscribe vào private channel của user hiện tại
      const channel = echoInstance.private(`user.${currentUserId}`);
  
      channel.listen("MemberRemovedFromBoard", (data) => {
        
        // toast.info(data.message); // Hiển thị thông báo
  
        // Cập nhật cache boardMembers
        queryClient.setQueryData(["boardMembers", data.board_id], (oldData) => {
          if (!oldData || !oldData.data) return oldData;
          const updatedMembers = oldData.data.filter(
            (member) => member.id !== currentUserId
          );
          return { ...oldData, data: updatedMembers };
        });
  
        // Cập nhật cache cards
        queryClient.setQueryData(["membersInCard", data.board_id], (oldData) => {
          if (!oldData || !oldData.data) return oldData;
          const updatedCards = oldData.data.map((card) => ({
            ...card,
            members: card.members
              ? card.members.filter((member) => member.id !== currentUserId)
              : [],
          }));
          return { ...oldData, data: updatedCards };
        });
  
        // Cập nhật cache checklistItems
        queryClient.setQueryData(
          ["checklist-item-members", data.board_id],
          (oldData) => {
            if (!oldData || !oldData.data) return oldData;
            const updatedItems = oldData.data.map((item) => ({
              ...item,
              users: item.users
                ? item.users.filter((user) => user.id !== currentUserId)
                : [],
            }));
            return { ...oldData, data: updatedItems };
          }
        );
  
        // Làm mới dữ liệu từ server
        queryClient.invalidateQueries({ queryKey: ["boardMembers", variables.boardId], exact: true });
        queryClient.invalidateQueries({ queryKey: ["membersInCard", variables.boardId], exact: true });
        queryClient.invalidateQueries({ queryKey: ["checklist-item-members", variables.boardId], exact: true });
  
        // navigate("/home"); // Điều hướng ngay
      });
  
      // Cleanup khi unmount
      return () => {
        channel.stopListening("MemberRemovedFromBoard");
        echoInstance.leave(`user.${currentUserId}`);
      };
    }, [currentUserId, navigate, queryClient]);
  
    return mutation;
  };
  

export const useMemberJoinedListener = (currentUserId) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const channel = echoInstance.private(`user.${currentUserId}`);

        channel.listen('MemberJoinedBoard', (data) => {
            // Hiển thị toast
            toast.success(data.message);
            console.log('helloo')
            // Làm mới danh sách BoardMember
            queryClient.invalidateQueries({ queryKey:['boardMembers', data.board_id],exact:true});
        });

        return () => {
            channel.stopListening('MemberJoinedBoard');
            echoInstance.leave(`user.${currentUserId}`);
        };
    }, [currentUserId, queryClient]);
};

export const useGuestBoards = () => {
  return useQuery({
    queryKey: ["guestBoards"], // Cache danh sách bảng khách
    queryFn: getGuestBoards,
    staleTime: 60 * 1000, // Dữ liệu cũ sau 1 phút
    cacheTime: 5 * 60 * 1000, // Lưu cache trong 5 phút
    retry: 2, // Thử lại tối đa 2 lần nếu lỗi
    refetchOnWindowFocus: false, // Không fetch lại khi chuyển tab
  });
};

export const useRemoveInviteLink = () => {

  const queryClient = useQueryClient();

  return useMutation({
      mutationFn: removeInviteLink, // Gọi API tạo link
      onError: (error) => {
          console.error("Lỗi khi tắt link link mời:", error);
          toast.error("Tắt link không thành công ")
      },
  });

}


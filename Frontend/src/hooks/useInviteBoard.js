import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptRequestJoinBoard, generateInviteLink, getBoardMembers, getGuestBoards, getRequestJoinBoard, rejectRequestJoinBoard, removeInviteLink, removeMemberFromBoard, requestJoinBoard, updateRoleMemberInBoards } from "../api/models/inviteBoardApi";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import echoInstance from "./realtime/useRealtime";
import { toast } from "react-toastify";
import { fetchMemberCardsAndItems } from "../api/models/memberApi";
import { toggleCardMember } from "../api/models/cardsApi";
import { useToggleCheckListItemMember } from "./useCheckListItem";


export const useGetBoardMembers = (boardId) => {

  const queryClient = useQueryClient();

  const boardMembers = useQuery({
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

      // queryClient.invalidateQueries( ["boardMembers", boardId]);
      queryClient.invalidateQueries({ queryKey: ["boardMembers", boardId], exact: true });
      queryClient.invalidateQueries({ queryKey: ["user"], exact: true });
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
    onSuccess: (data, {boardId}) => {
      if (data.success) {
      
        queryClient.invalidateQueries({ queryKey: ["boardMembers", boardId], exact: true });
        
      }
    },
    onError: (error) => {
      const errorMessage = error.message || 'Lỗi không xác định';
      console.error("Lỗi khi cập nhật vai trò thành viên:", errorMessage);
    },
  });
};


export const useRemoveMemberFromBoard = (currentUserId,boardId) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Mutation để xóa thành viên
  const mutation = useMutation({
    mutationFn: async ({ boardId, userId }) => {
      // 🔥 Bước 1: Lấy danh sách thẻ và checklist item mà user tham gia
      const { cards, items } = await fetchMemberCardsAndItems(boardId, userId);
      
      // 🔥 Bước 2: Xoá user khỏi board
      const response = await removeMemberFromBoard(boardId, userId);
      
      if (response.success) {
        return { success: true, message: response.message, cards, items };
      } else {
        throw new Error("Xóa thành viên không thành công!");
      }
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // console.log("Thành viên đã được xóa khỏi bảng:", data.message);
        // console.log("DEBUG - Giá trị của data.cards:", data.cards);
  
        // 🔥 Bước 3: Cập nhật lại cache của các thẻ và checklist items mà user bị xoá
        queryClient.invalidateQueries({ queryKey: ["boardMembers", variables.boardId] });
  
        // const cards = Array.isArray(data.cards) ? data.cards : [];

        data.cards.data.forEach((card) => {
          queryClient.invalidateQueries({ queryKey: ["membersInCard", card.id] });
          // console.log("card:", card.id);
        });
  
        data.items.data.forEach((item) => {
          queryClient.invalidateQueries({ queryKey: ["checklist-item-members", item.id] });
          // console.log("Item:", item.id);
        });
      }
    },
    onError: (error) => {
      console.error("Lỗi khi xóa thành viên:", error.message);
    },
  });
  

  // Lắng nghe event realtime cho người dùng hiện tại
  useEffect(() => {
    if (!currentUserId) return;
  
    // Subscribe vào private channel của user hiện tại
    const channel = echoInstance.private(`App.Models.User.${currentUserId}`);
  
    channel.listen("MemberRemovedFromBoard", (data) => {
      // console.log("MemberRemovedFromBoard", data);
  
      // Lấy thông tin bảng từ cache
      const boardData = queryClient.getQueryData(["boards", data.board_id]);
      console.log("Board data:", boardData);
      const isCreator = boardData?.created_by === currentUserId;
      const isSelfRemoved = data.user_id === currentUserId;

      if(data.board_id === boardId) {
       
        // Chỉ điều hướng nếu là người rời bảng
        if (isSelfRemoved && !isCreator) {
          // toast.info(`${data.user_name} đã rời khỏi bảng.`);
          navigate(`/request-join/${data.board_id}`);
        } else if (isSelfRemoved && isCreator) {
          toast.info("Bạn đã rời khỏi bảng, có thể tham gia lại bất cứ lúc nào.");
        } else {
          // Thông báo cho các thành viên khác (bao gồm creator) mà không điều hướng
          toast.info(`${data.user_name} đã rời khỏi bảng.`);
        }

        console.log("Thông báo đúng bảng ");
        
    
      }else{
        console.log("Thông báo không đúng bảng ");
      };
  
     
      // Cập nhật cache cho tất cả user
      queryClient.setQueryData(["boardMembers", data.board_id], (oldData) => {
        if (!oldData || !oldData.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.filter((member) => member.id !== data.user_id),
        };
      });
  
      // Invalidate các query liên quan
      queryClient.invalidateQueries({ queryKey: ["boardMembers", data.board_id], exact: true });
      queryClient.invalidateQueries({ queryKey: ["membersInCard", data.board_id], exact: true });
      queryClient.invalidateQueries({ queryKey: ["checklist-item-members", data.board_id], exact: true });
      queryClient.invalidateQueries({ queryKey: ["guestBoards"], exact: true });
    });
  
    // Cleanup khi unmount
    return () => {
      channel.stopListening("MemberRemovedFromBoard");
      echoInstance.leave(`App.Models.User.${currentUserId}`);
    };
  }, [currentUserId, navigate, queryClient]);

  return mutation;
};


export const useMemberJoinedListener = (currentUserId,boardId) => {
  const queryClient = useQueryClient();

  useEffect(() => {

    if (!currentUserId || !boardId) return;
    const channel = echoInstance.private(`user.${currentUserId}`);

    channel.listen('MemberJoinedBoard', (data) => {
      // Hiển thị toast
      if (data.board_id === boardId) {
        console.log("Thông báo đúng bảng ");
        
        toast.success(data.message);
      }else{
        console.log("Thông báo không đúng bảng ");
      }
    
      console.log("MemberJoinedBoard", data.message); // Hiển thị thông báo
      
      // console.log('helloo')
      // Làm mới danh sách BoardMember
      queryClient.invalidateQueries({ queryKey: ['boardMembers', data.board_id], exact: true });
      queryClient.invalidateQueries({ queryKey: ["guestBoards"], exact: true });
    });

    return () => {
      channel.stopListening('MemberJoinedBoard');
      echoInstance.leave(`user.${currentUserId}`);
    };
  }, [currentUserId,boardId, queryClient]);
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


export const useRequestJoinBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, userId }) => requestJoinBoard({ boardId, userId }),
    onSuccess: (data, variables) => {
      // console.log(data);
      // console.log(variables);
      
      if (data.is_member) {
        queryClient.invalidateQueries({ queryKey: ['boardMembers', variables.boardId], exact: true });
      }
    },
    onError: (error) => {
      console.error("Lỗi khi yêu cầu tham gia bảng:", error);
    },
  });
};




export const useGetRequestBoard = (boardId, options = {}) => {
  return useQuery({
    queryKey: ["request-board", boardId],
    queryFn: () => getRequestJoinBoard(boardId),
    enabled: !!boardId, // Chỉ gọi nếu boardId và enabled được bật
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    // ...options, // Gộp các options được truyền vào sau cùng
  });
};


export const useAcceptRequestJoinBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ( requestId ) => acceptRequestJoinBoard(requestId),
    onSuccess: (data, variables) => {
      toast.success("Chấp nhận yêu cầu tham gia bảng thành công!")
      console.log(data);
      useEffect(() => {
        // if (!data.user_id || !echoInstance) return;
      
        const channel = echoInstance.private(`user.${data.user_id}`);
        
        // channel.notification((notification) => {
        //   // if (notification.type === "App\\Notifications\\MemberRemovedNotification") {
        //   //   navigate("/home");
        //   // }
    
        //   // queryClient.invalidateQueries({ queryKey: ['notifications', userId] ,exact:true});
        //   // queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
        // });
      
        return () => {
          echoInstance.leave(`user.${data.user_id}`);
        };
      }, [data.user_id, queryClient]);
    
      // console.log(variables);
      
     
      queryClient.invalidateQueries({ queryKey: ['boardMembers', data.board_id], exact: true });
      queryClient.invalidateQueries({ queryKey: ['request-board', data.board_id], exact: true });
      queryClient.invalidateQueries({ queryKey: ["guestBoards"], exact: true });
      
    },
    onError: (error) => {
      console.error("Lỗi khi yêu cầu tham gia bảng:", error);
      // Kiểm tra nếu lỗi do yêu cầu đã được xử lý
      const errorMessage = error.response?.data?.message || "Lỗi không xác định";
      if (errorMessage.includes("Yêu cầu không tồn tại.") || errorMessage.includes("không tồn tại")) {
        toast.info("Yêu cầu này đã được xử lý bởi quản trị viên khác.");
      } else {
        toast.error("Lỗi khi chấp nhận yêu cầu: " + errorMessage);
      }
    },
  });

  

};

export const useJoinBoardRequestListener = (userId ,boardId) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !boardId) return;

    const channel = echoInstance.private(`App.Models.User.${userId}`);

    channel.listen("RequestJoinBoard", (data) => {
      console.log("New join request:", data);
      if (data.board_id === boardId) {
        console.log("Thông báo đúng bảng ");
        
        toast.info(data.message); // Hiển thị thông báo giống Trello
        
      }else{
        console.log("Thông báo không đúng bảng ");
      }
      // toast.info(data.message); // Hiển thị thông báo giống Trello

     // Invalidate cache để gọi lại API lấy danh sách mới
     queryClient.invalidateQueries({ queryKey: ["request-board", data.board_id], exact: true });
    });

    return () => {
      channel.stopListening("RequestJoinBoard");
      echoInstance.leave(`App.Models.User.${userId}`);
    };
  }, [userId, queryClient]);
};


export const useRejectRequestJoinBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ( requestId ) => rejectRequestJoinBoard(requestId),
    onSuccess: (data, variables) => {
      toast.success("Xóa yêu cầu tham gia bảng thành công!")
      console.log(data);
      // console.log(variables);
      
     
      queryClient.invalidateQueries({ queryKey: ['boardMembers', data.board_id], exact: true });
      queryClient.invalidateQueries({ queryKey: ['request-board', data.board_id], exact: true });
      
    },
    onError: (error) => {
      console.error("Lỗi khi xóa yêu cầu tham gia bảng:", error);
    },
  });
};

export const useCreatorComeBackBoard = (currentUserId, boardId) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentUserId || !boardId) return;

    const channel = echoInstance.private(`App.Models.User.${currentUserId}`);

    channel.listen("CreatorComeBackBoard", (data) => {
      console.log("CreatorComeBackBoard", data);
      // toast.info(data.message); // Hiển thị thông báo giống Trello

      // Invalidate cache để gọi lại API lấy danh sách mới
      queryClient.invalidateQueries({ queryKey: ["boardMembers",data.board_id], exact: true });
    });

    return () => {
      channel.stopListening("CreatorComeBackBoard");
      echoInstance.leave(`App.Models.User.${currentUserId}`);
    };
  }, [currentUserId,boardId, queryClient]);
}





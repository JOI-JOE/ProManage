import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generateInviteLink, getBoardMembers, getGuestBoards, removeInviteLink, removeMemberFromBoard, updateRoleMemberInBoards } from "../api/models/inviteBoardApi";
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
      // console.log('Realtime archive changed: ', boardId);

      queryClient.invalidateQueries(["boardMembers"]);

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
      
        queryClient.invalidateQueries({ queryKey: ["boardMembers", boardId], exact: false });
        
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
    const channel = echoInstance.private(`user.${currentUserId}`);

    channel.listen("MemberRemovedFromBoard", (data) => {

      // toast.info(data.message); // Hiển thị thông báo

      // Cập nhật cache boardMembers
     
      // Làm mới dữ liệu từ server
      // queryClient.invalidateQueries({ queryKey: ["boardMembers", variables.boardId], exact: true });
      // queryClient.invalidateQueries({ queryKey: ["membersInCard", variables.boardId], exact: true });
      // queryClient.invalidateQueries({ queryKey: ["checklist-item-members", variables.boardId], exact: true });

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
      // console.log('helloo')
      // Làm mới danh sách BoardMember
      queryClient.invalidateQueries({ queryKey: ['boardMembers', data.board_id], exact: true });
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


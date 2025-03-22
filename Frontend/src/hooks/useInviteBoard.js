import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {generateInviteLink, getBoardMembers, removeMemberFromBoard, updateRoleMemberInBoards } from "../api/models/inviteBoardApi";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import echoInstance from "./realtime/useRealtime";
import { toast } from "react-toastify";


export const useGetBoardMembers = (boardId) => {
    return useQuery({
        queryKey: ["boardMembers", boardId], // Cache theo boardId
        queryFn: () => getBoardMembers(boardId),
        enabled: !!boardId, // Chỉ fetch khi có boardId
        staleTime: 60 * 1000, // Cache 1 phút (60000 ms)
        cacheTime: 5 * 60 * 1000, // Lưu cache 5 phút để tối ưu
        retry: 2, // Tự động thử lại 2 lần nếu lỗi
        refetchOnWindowFocus: false, // Không fetch lại khi chuyển tab
    });
};


export const useGenerateInviteLink = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: generateInviteLink, // Gọi API tạo link
        onSuccess: (data) => {
            const inviteLink = data.invite_link; // Lấy link từ response API

            if (inviteLink) {
                navigator.clipboard.writeText(inviteLink) // Lưu vào clipboard
                    .then(() => console.log("Đã sao chép link mời:", inviteLink))
                    .catch(err => console.error("Lỗi khi sao chép:", err));

                     // Lưu vào localStorage để sử dụng lại
                localStorage.setItem("InviteLink", inviteLink);
            }

            // queryClient.invalidateQueries(["workspaces"]); // Cập nhật dữ liệu nếu cần
        },
        onError: (error) => {
            console.error("Lỗi khi tạo link mời:", error);
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
                queryClient.invalidateQueries(['boardMembers']); // Thay 'boardMembers' bằng key thực tế
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
        onSuccess: (data) => {
            if (data.success) {
                console.log("Thành viên đã được xóa khỏi bảng:", data.message);
                queryClient.invalidateQueries(['boardMembers']); // Làm mới danh sách thành viên
            }
        },
        onError: (error) => {
            const errorMessage = error.message || 'Lỗi không xác định';
            console.error("Lỗi khi xóa thành viên:", errorMessage);
        },
    });

    // Lắng nghe event realtime cho người dùng hiện tại
    useEffect(() => {
        // Subscribe vào private channel của user hiện tại
        const channel = echoInstance.private(`user.${currentUserId}`);

        channel.listen('MemberRemovedFromBoard', (data) => {
            toast.info(data.message); // Hiển thị thông báo
            navigate('/home'); // Điều hướng ngay
            queryClient.invalidateQueries(['boardMembers']);
        });

        // Cleanup khi unmount
        return () => {
            channel.stopListening('MemberRemovedFromBoard');
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
            queryClient.invalidateQueries(['boardMembers', data.board_id]);
        });

        return () => {
            channel.stopListening('MemberJoinedBoard');
            echoInstance.leave(`user.${currentUserId}`);
        };
    }, [currentUserId, queryClient]);
};




import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {generateInviteLink, getBoardMembers } from "../api/models/inviteBoardApi";


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



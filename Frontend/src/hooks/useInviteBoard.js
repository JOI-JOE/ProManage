import { useMutation, useQueryClient } from "@tanstack/react-query";
import {generateInviteLink } from "../api/models/inviteBoardApi";


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



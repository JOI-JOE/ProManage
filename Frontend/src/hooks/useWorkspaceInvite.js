import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getInviteWorkspaceById,
  createInviteWorkspace,
  cancelInviteWorkspace,
  getSearchMembers,
  // confirmWorkspaceMembers,
  getInvitationSecretByReferrer,
  addMemberToWorkspaceDirection,
  sendInviteWorkspace,
  joinWorkspace,
  sendJoinRequest,
  addNewMemberToWorkspace,
} from "../api/models/inviteWorkspaceApi";
import { useEffect, useRef } from "react";
import echoInstance from "./realtime/useRealtime";

// Hook mutation
export const useAddMemberToWorkspaceDirection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workspaceId, memberId }) => {
      if (!workspaceId || !memberId) {
        throw new Error("workspaceId hoặc memberId không hợp lệ");
      }
      return await addMemberToWorkspaceDirection({ workspaceId, memberId });
    },
    onSuccess: (data, { workspaceId }) => {
      // Cập nhật lại danh sách thành viên của workspace
      queryClient.invalidateQueries({
        queryKey: ["workspaceMembers", workspaceId],
      });
    },
    onError: (error) => {
      console.error(
        "Lỗi khi thêm thành viên vào workspace:",
        error.response?.data?.message || error.message
      );
    },
  });
};

export const useGetInviteWorkspace = (workspaceId) => {
  return useQuery({
    queryKey: ["inviteWorkspace", workspaceId], // Unique key cho query
    queryFn: () => getInviteWorkspaceById(workspaceId), // Hàm fetch dữ liệu
    enabled: !!workspaceId, // Chỉ fetch khi workspaceId tồn tại
    onError: (error) => {
      console.error("Lỗi khi lấy thông tin invite workspace:", error);
    },
    staleTime: 1000 * 60 * 5, // Dữ liệu được coi là "cũ" sau 5 phút
    cacheTime: 1000 * 60 * 10, // Dữ liệu được lưu trong cache 10 phút
  });
};

export const useCreateInviteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId }) => createInviteWorkspace(workspaceId),
    onSuccess: (data, variables) => {
      // Cập nhật cache với dữ liệu mới
      queryClient.setQueryData(
        ["inviteWorkspace", variables.workspaceId],
        data
      );
    },
    onError: (error) => {
      console.error("Lỗi khi tạo lời mời vào workspace:", error);
    },
  });
};

export const useCancelInvitationWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId }) => cancelInviteWorkspace(workspaceId),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ["inviteWorkspace", variables.workspaceId],
        data
      );
    },
    onError: (error) => {
      console.error("Lỗi khi xóa lời mời vào workspace:", error);
    },
  });
};

export const useGetInvitationSecretByReferrer = (workspaceId, inviteToken) => {
  const queryClient = useQueryClient();
  const channelRef = useRef(null);

  const handleInvitationCanceled = (event) => {
    if (event?.workspaceId === workspaceId) {
      console.warn("📣 Lời mời đã bị huỷ:", event);
      queryClient.invalidateQueries(["linkInviteWorkspace"]);
    }
  };

  useEffect(() => {
    if (!workspaceId) return;

    const channelName = `workspace.invite.${workspaceId}`;
    const channel = echoInstance.channel(channelName);
    channelRef.current = channel;

    channel.listen(".invitation.canceled", handleInvitationCanceled);

    return () => {
      if (channelRef.current) {
        channelRef.current.stopListening(".invitation.canceled");
        echoInstance.leave(channelName);
      }
    };
  }, [workspaceId]);

  return useQuery({
    queryKey: ["linkInviteWorkspace"],
    queryFn: () => getInvitationSecretByReferrer(workspaceId, inviteToken),
    onError: (error) => {
      console.error("Lỗi khi lấy dữ liệu của workspace:", error);
    },
    enabled: !!workspaceId && !!inviteToken,
    retry: false,
  });
};

// function tìm người dùng
export const useSearchMembers = (query, idWorkspace) => {
  return useQuery({
    queryKey: ["searchMembers", query, idWorkspace],
    queryFn: () => getSearchMembers({ query, idWorkspace }),
    enabled: !!query && !!idWorkspace, // Chỉ gọi API nếu có đủ tham số
  });
};

// function sau khi bấm gửi lời mời thêm vào trong trang thành viên
export const useSendInviteWorkspace = () => {
  return useMutation({
    mutationFn: ({ workspaceId, email, memberId, message }) => {
      return sendInviteWorkspace(workspaceId, { email, memberId, message });
    },
    onSuccess: (data) => {},
    onError: (error) => {
      console.error("❌ Lỗi khi gửi lời mời:", error);
    },
  });
};

export const useJoinWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, token }) =>
      joinWorkspace({ workspaceId, token }),

    onSuccess: (data) => {
      // Invalidate danh sách workspace chung và workspace cụ thể
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({
        queryKey: ["workspace", data.workspace_id],
      });
    },

    onError: (error) => {
      const errorMessage = error?.message || "Đã xảy ra lỗi không xác định";
    },
  });
};

// Function mà muốn gửi yêu cầu để tham gia workspace
export const useSendJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId }) => sendJoinRequest({ workspaceId }), // Sửa lại để chỉ gửi workspaceId

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["user_main"] });
    },

    onError: (error) => {
      const errorMessage = error?.message || "Đã xảy ra lỗi không xác định";
      console.error("❌ Lỗi khi tham gia workspace:", errorMessage);
    },
  });
};

// function mà quản trị viên của workspace có thể thêm guest hoặc request vào trong workspace
export const useAddNewMemberToWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, memberId }) =>
      addNewMemberToWorkspace({ workspaceId, memberId }), // Sửa lại để chỉ gửi workspaceId

    onSuccess: (_data, variables) => {
      const { workspaceId } = variables;
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId],
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Đã xảy ra lỗi không xác định";
    },
  });
};

// // function khi chọn một người dùng vào hàng chờ
// export const useAddMemberToWorkspace = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ workspaceId, userIds }) =>
//       addMemberToWorkspace(workspaceId, userIds),
//     onSuccess: (data, variables) => {
//       console.log("✅ Thành viên đã được thêm:", data);
//     },
//     onError: (error) => {
//       console.error("❌ Lỗi khi thêm thành viên vào workspace:", error);
//     },
//   });
// };

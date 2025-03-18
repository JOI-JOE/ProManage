import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getInviteWorkspaceById,
  createInviteWorkspace,
  acceptInvitation,
  cancelInviteWorkspace,
  getValidateMemberInWorkspace,
  getSearchMembers,
  addMemberToWorkspace,
  confirmWorkspaceMembers,
  getInvitationSecretByReferrer,
} from "../api/models/inviteWorkspaceApi";

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, inviteToken }) =>
      acceptInvitation(workspaceId, inviteToken),
    onSuccess: (data, variables) => {
      // Cập nhật cache với dữ liệu mới
      queryClient.setQueryData(
        ["inviteWorkspace", variables.workspaceId],
        data
      );
      console.log("Tham gia workspace thành công:", data);
    },
    onError: (error) => {
      console.error("Lỗi khi chấp nhận lời mời:", error);
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

export const useGetValidateMember = (workspaceId, memberId) => {
  return useQuery({
    queryKey: ["workspaces", "members", workspaceId, memberId],
    queryFn: () => getValidateMemberInWorkspace(workspaceId, memberId),
    enabled: !!memberId && !!workspaceId, // Check both memberId and workspaceId
    onError: (error) => {
      console.error(
        "Lỗi khi lấy thông tin member trong không gian làm việc",
        error
      );
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
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
  return useQuery({
    queryKey: ["workspaces", workspaceId, "invitationSecret", inviteToken], // Add inviteToken to the queryKey
    queryFn: () => getInvitationSecretByReferrer(workspaceId, inviteToken),
    onError: (error) => {
      console.error("Lỗi khi lấy dữ liệu của workspace");
    },
    enabled: !!workspaceId && !!inviteToken,
    retry: false,
  });
};

// function tìm người dùng
export const useSearchMembers = (query, idWorkspace) => {
  return useQuery({
    queryKey: ["searchMembers", query, idWorkspace], // 🔥 Cache dựa trên params
    queryFn: () => getSearchMembers({ query, idWorkspace }),
    enabled: !!query && !!idWorkspace, // Chỉ gọi API nếu có đủ tham số
  });
};

// function khi chọn một người dùng vào hàng chờ
export const useAddMemberToWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, userIds }) =>
      addMemberToWorkspace(workspaceId, userIds),
    onSuccess: (data, variables) => {
      console.log("✅ Thành viên đã được thêm:", data);
    },
    onError: (error) => {
      console.error("❌ Lỗi khi thêm thành viên vào workspace:", error);
    },
  });
};

// function sau khi bấm gửi lời mời
export const useConfirmWorkspaceMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, memberId, invitationMessage }) =>
      confirmWorkspaceMembers(workspaceId, memberId, invitationMessage),
    onSuccess: (data, variables) => {
      console.log("✅ Thành viên đã được xác nhận:", data);
      // Cập nhật lại dữ liệu nếu cần
      queryClient.invalidateQueries([
        "workspaceMembers",
        variables.workspaceId,
      ]);
    },
    onError: (error) => {
      console.error("❌ Lỗi khi xác nhận thành viên vào workspace:", error);
    },
  });
};

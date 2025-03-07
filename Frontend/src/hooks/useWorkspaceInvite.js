import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getInviteWorkspaceById,
  createInviteWorkspace,
  acceptInvitation,
  cancelInviteWorkspace,
  getValidateInvitation,
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

export const useGetValidateInvitation = (workspaceId, inviteToken) => {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "invitationSecret", inviteToken], // Add inviteToken to the queryKey
    queryFn: () => getValidateInvitation(workspaceId, inviteToken),
    onError: (error) => {
      console.error("Lỗi khi lấy dữ liệu của workspace");
    },
    enabled: !!workspaceId && !!inviteToken, 
    retry: false,
  });
};

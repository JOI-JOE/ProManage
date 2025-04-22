import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWorkspacesAll,
  createWorkspace,
  updateWorkspaceInfo,
  getWorkspaceByName,
  getWorkspaceById,
  getBoardMarkedByWorkspace,
  getGuestWorkspace,
  getUserWorkspaces,
  getUserWorkspaces2,
  fetchWorkspacesAll,
  changeType,
  removeMemberWorkspace,
  // checkMemberInWorkspace,
} from "../api/models/workspacesApi";

/**
 * Custom hook để lấy danh sách workspaces mà user tham gia.
 * @returns {object} - Kết quả từ useQuery (data, isLoading, isError, ...)
 */
export const usefetchWorkspaces = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspacesAll,
    staleTime: 5 * 60 * 1000, // 5 phút: dữ liệu "tươi" trong 5 phút
    cacheTime: 10 * 60 * 1000, // 10 phút: giữ cache 10 phút sau khi không dùng
    refetchOnWindowFocus: false, // Không refetch khi focus lại tab
  });
};

export const useGetWorkspaces = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: getWorkspacesAll,
    staleTime: 5 * 60 * 1000, // 5 phút: dữ liệu "tươi" trong 5 phút
    cacheTime: 10 * 60 * 1000, // 10 phút: giữ cache 10 phút sau khi không dùng
    refetchOnWindowFocus: false, // Không refetch khi focus lại tab
    retry: 2, // Thử lại 2 lần nếu lỗi
    onSuccess: (data) => {
      console.log("Danh sách workspaces:", data); // Log dữ liệu thực tế
    },
    onError: (error) => {
      console.error("Lỗi khi lấy danh sách workspaces:", error);
    },
  });
};

export const useGetWorkspaceById = (workspaceId) => {
  return useQuery({
    queryKey: ["workspace", workspaceId], // Key để cache dữ liệu
    queryFn: () => getWorkspaceById(workspaceId),
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });
};

export const useGetGuestWorkspaces = () => {
  return useQuery({
    queryKey: ["guestWorkspaces"],
    queryFn: getGuestWorkspace,
    staleTime: 5 * 60 * 1000, // 5 phút
    cacheTime: 10 * 60 * 1000, // 10 phút
    refetchOnWindowFocus: false, // Không refetch khi focus lại tab
    retry: 2, // Thử lại 2 lần nếu lỗi
    onError: (error) => {
      console.error("Lỗi khi lấy danh sách workspaces khách:", error);
    },
  });
};

export const useGetWorkspaceByName = (workspaceName) => {
  return useQuery({
    queryKey: ["workspace", workspaceName], // Key để cache dữ liệu
    queryFn: () => getWorkspaceByName(workspaceName),
    enabled: !!workspaceName, // Chỉ gọi API nếu name tồn tại
    staleTime: 1000 * 60 * 5, // Dữ liệu cache sẽ được giữ 5 phút trước khi bị xem là cũ
    cacheTime: 1000 * 60 * 30, // Giữ dữ liệu cache trong 30 phút ngay cả khi không sử dụng
    retry: 2, // Thử lại tối đa 2 lần nếu request thất bại
  });
};

export const useGetBoardMarkedByWorkspace = (workspaceName) => {
  return useQuery({
    queryKey: ["BoardMarked", workspaceName], // Key để cache dữ liệu
    queryFn: () => getBoardMarkedByWorkspace(workspaceName),
    enabled: !!workspaceName, // Chỉ gọi API nếu name tồn tại
    staleTime: 1000 * 60 * 5, // Dữ liệu cache sẽ được giữ 5 phút trước khi bị xem là cũ
    cacheTime: 1000 * 60 * 30, // Giữ dữ liệu cache trong 30 phút ngay cả khi không sử dụng
    retry: 2, // Thử lại tối đa 2 lần nếu request thất bại
  });
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries(["workspaces"]);
    },
    onError: (error) => {
      console.error("Lỗi khi tạo workspace:", error);
    },
  });
};

export const useUpdateInforWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateWorkspaceInfo(id, data),
    onSuccess: (updatedWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"], exact: true });
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật workspace:", error);
    },
  });
};

export const useGetUserWorkspaces = () => {
  return useQuery({
    queryKey: ["userWorkspaces"], // Key để cache dữ liệu
    queryFn: getUserWorkspaces,
    staleTime: 1000 * 60 * 5, // Dữ liệu sẽ hết hạn sau 5 phút
    cacheTime: 1000 * 60 * 30, // Dữ liệu sẽ được cache trong 30 phút
    retry: 2, // Thử lại 2 lần nếu có lỗi
  });
};

export const useUserWorkspaces = () => {
  return useQuery({
    queryKey: ["userWorkspaces2"],
    queryFn: getUserWorkspaces2,
  });
};

// Hook to change a member's type in a workspace
export const useChangeMemberType = (workspaceId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, userId, memberType }) =>
      changeType(workspaceId, userId, memberType),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId],
        exact: true,
      });
    },
    onError: (error) => {
      console.error("Error when changing member type:", error);
    },
  });
};

// Hook to remove a member from a workspace
export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, userId }) =>
      removeMemberWorkspace(workspaceId, userId),
    onSuccess: (response, variables) => {
      // Invalidate the workspace query to refresh workspace data
      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId],
        exact: true,
      });
    },
    onError: (error) => {
      console.error("Error when removing member:", error);
    },
  });
};

// export const useCheckMemberInWorkspace = (workspaceId, userId) => {
//   return useQuery({
//     queryKey: ["workspace-member-check", workspaceId, userId], // Unique key theo cả 2 giá trị
//     queryFn: () => useCheckMemberInWorkspace(workspaceId, userId),
//     enabled: !!workspaceId && !!userId, // Gọi API khi cả 2 đều tồn tại
//     staleTime: 1000 * 60 * 5, // 5 phút
//     cacheTime: 1000 * 60 * 30, // 30 phút
//     retry: 2,
//   });
// };

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWorkspacesAll,
  createWorkspace,
  updateWorkspaceInfo,
  getWorkspaceByName,
  getWorkspaceById,
  getBoardMarkedByWorkspace,
  getGuestWorkspace,
} from "../api/models/workspacesApi";

/**
 * Custom hook để lấy danh sách workspaces mà user tham gia.
 * @returns {object} - Kết quả từ useQuery (data, isLoading, isError, ...)
 */
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

export const useGetWorkspaceById = (workspaceId) => {
  return useQuery({
    queryKey: ["workspace", workspaceId], // Key để cache dữ liệu
    queryFn: () => getWorkspaceById(workspaceId),
    enabled: !!workspaceId, // Chỉ gọi API nếu workspaceId tồn tại
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    retry: 2,
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
      queryClient.setQueryData(
        ["workspace", updatedWorkspace.id],
        updatedWorkspace
      );
      // Invalidate query để refetch nếu dữ liệu cũ không còn hợp lệ
      queryClient.invalidateQueries(["workspace", updatedWorkspace.id]);
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật workspace:", error);
    },
  });
};

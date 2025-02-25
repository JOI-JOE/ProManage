import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import {
//   getWorkspacesAll,
//   getWorkspaceByDisplayName,
//   createWorkspace,
// } from "../api/workspacesApi"; // Import các hàm API
import {
  getWorkspacesAll,
  createWorkspace,
  updateWorkspaceInfo,
  getWorkspaceByName,
  getWorkspaceById,
} from "../api/models/workspacesApi";

/**
 * Custom hook để lấy danh sách workspaces mà user tham gia.
 * @returns {object} - Kết quả từ useQuery (data, isLoading, isError, ...)
 */
export const useWorkspaces = () => {
  return useQuery({
    queryKey: ["workspaces"], // Key để cache dữ liệu
    queryFn: getWorkspacesAll,
    onError: (error) => {
      console.error("Lỗi khi lấy danh sách workspaces:", error);
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
      // Invalidate cache để làm mới danh sách workspaces
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
      console.log("Workspace đã được cập nhật:", updatedWorkspace);

      // Cập nhật dữ liệu cache ngay lập tức thay vì chờ refetch
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

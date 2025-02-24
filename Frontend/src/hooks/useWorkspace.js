import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import {
//   getWorkspacesAll,
//   getWorkspaceByDisplayName,
//   createWorkspace,
// } from "../api/workspacesApi"; // Import các hàm API
import {
  getWorkspacesAll,
  getWorkspaceByDisplayName,
  createWorkspace,
  updateWorkspaceInfo,
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

export const useGetWorkspaceByDisplayName = (displayName) => {
  return useQuery({
    queryKey: ["workspace", displayName], // Key để cache dữ liệu
    queryFn: () => getWorkspaceByDisplayName(displayName),
    enabled: !!displayName, // Chỉ gọi API nếu displayName tồn tại
    onError: (error) => {
      console.error("Lỗi khi lấy chi tiết workspace:", error);
    },
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
    mutationFn: async ({ id, data }) => {
      const updatedWorkspace = await updateWorkspaceInfo(id, data);
      return updatedWorkspace; // Đảm bảo return dữ liệu mới từ server
    },
    onSuccess: (data) => {
      console.log("Workspace đã được cập nhật:", data);
      // Invalidate query để làm mới dữ liệu
      queryClient.invalidateQueries(["workspaces", data.id]);
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật workspace:", error);
    },
  });
};

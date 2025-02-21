import { useMutation, useQuery } from "@tanstack/react-query";
import { createWorkspace, getWorkspacesAll } from "../api/models/workspacesApi";

/**
 * Custom hook để lấy danh sách workspaces mà user tham gia.
 * @returns {object} - Kết quả từ useQuery (data, isLoading, isError, ...)
 */
export const useWorkspaces = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: getWorkspacesAll,
  });
};

export const useCreateWorkspace = () => {
  return useMutation({
    mutationFn: createWorkspace,
  });
};

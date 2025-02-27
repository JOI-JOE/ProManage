import authClient from "../authClient";

export const getInviteWorkspaceById = async (workspaceId) => {
  try {
    const response = await authClient.get(
      `/workspaces/${workspaceId}/invitationSecret`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy invite workspace của người dùng:", error);
    throw error;
  }
};

export const createInviteWorkspace = async (workspaceId) => {
  try {
    const response = await authClient.post(
      `/workspaces/${workspaceId}/invitationSecret`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo lời mời vào workspace:", error);
    throw error;
  }
};

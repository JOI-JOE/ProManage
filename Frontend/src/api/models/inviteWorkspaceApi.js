import authClient from "../authClient";

export const addMemberToWorkspaceDirection = async ({
  workspaceId,
  memberId,
}) => {
  try {
    const response = await authClient.post(
      `/workspace/${workspaceId}/member/${memberId}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Lỗi khi thêm thành viên vào workspace:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getInvitationSecretByReferrer = async (
  workspaceId,
  inviteToken
) => {
  try {
    const response = await authClient.get(
      `/workspaces/${workspaceId}/invitationSecret/${inviteToken}`
    );
    return response.data; // Trả về dữ liệu từ API
  } catch (error) {
    console.error("Lỗi khi chấp nhận lời mời:", error);
  }
};

export const getInviteWorkspaceById = async (workspaceId) => {
  try {
    const response = await authClient.get(
      `/workspaces/${workspaceId}/invitationSecret`
    );
    return response.data;
  } catch {
    return null; // Trả về null nếu có lỗi (không log lỗi)
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

export const cancelInviteWorkspace = async (workspaceId) => {
  try {
    const response = await authClient.delete(
      `workspaces/${workspaceId}/invitationSecret`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo lời mời vào workspace:", error);
    throw error;
  }
};

export const getSearchMembers = async ({ query, idWorkspace }) => {
  try {
    const response = await authClient.get("search/members", {
      params: { idWorkspace, query }, // 🔥 Truyền tham số vào URL
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tìm member mới:", error);
    throw error;
  }
};
export const sendInviteWorkspace = async (
  workspaceId,
  { email, memberId, message }
) => {
  try {
    const response = await authClient.post(
      `/workspace/${workspaceId}/members`,
      {
        email,
        memberId,
        message,
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error confirming workspace member:", error);
    throw error;
  }
};

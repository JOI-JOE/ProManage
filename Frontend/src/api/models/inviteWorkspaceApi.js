import axios from "axios";
import authClient from "../authClient";

export const acceptInvitation = async (workspaceId, inviteToken) => {
  try {
    const response = await authClient.post(
      `/workspaces/${workspaceId}/invitationSecret/${inviteToken}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi chấp nhận lời mời:", error);
    throw error;
  }
};

export const getValidateInvitation = async (workspaceId, inviteToken) => {
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

export const getValidateMemberInWorkspace = async ($memberId) => {
  try{
    const response = await authClient.get(
      ``
    )
  } catch (error) {
    console.error("Lỗi khi tìm kiếm member:", error);
  }
}
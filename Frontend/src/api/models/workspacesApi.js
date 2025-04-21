import authClient from "../authClient";

export const fetchWorkspacesAll = async () => {
  try {
    const response = await authClient.get("/workspaces/user/all");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy workspace của người dùng:", error);
    throw error;
  }
};

export const getWorkspacesAll = async () => {
  try {
    const response = await authClient.get("/workspaces");
    // console.log(response.data);

    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy workspace của người dùng:", error);
    throw error;
  }
};

export const getGuestWorkspace = async () => {
  try {
    const response = await authClient.get("/guestWorkspace");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy workspace của người dùng:", error);
    throw error;
  }
};

export const getWorkspaceByName = async (workspaceName) => {
  const response = await authClient.get(`/workspaces/name/${workspaceName}`);
  return response.data;
};
export const getBoardMarkedByWorkspace = async (workspaceName) => {
  const response = await authClient.get(
    `/workspaces/boardMarked/${workspaceName}`
  );
  return response.data;
};

export const getWorkspaceById = async (workspaceId) => {
  const response = await authClient.get(`/workspaces/${workspaceId}`);
  return response.data;
};

export const createWorkspace = async (data) => {
  return authClient
    .post("/workspaces", data)
    .then((response) => response.data)
    .catch((error) => {
      console.error(
        "Lỗi khi tạo workspace:",
        error?.response?.data || error.message
      );
      return Promise.reject(error);
    });
};

export const updateWorkspaceInfo = async (id, data) => {
  return authClient
    .put(`/workspaces/${id}`, data)
    .then((response) => response.data)
    .catch((error) => {
      console.error(
        "Lỗi khi cập nhật workspace:",
        error?.response?.data || error.message
      );
      return Promise.reject(error);
    });
};

export const getUserWorkspaces = async () => {
  const response = await authClient.get("/workspaces/all");
  return response.data;
};

export const getUserWorkspaces2 = async () => {
  try {
    const response = await authClient.get("user/workspaces");

    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy workspace của người dùng:", error);
    throw error;
  }
};

export const changeType = async (workspaceId, userId, memberType) => {
  try {
    const response = await authClient.put(
      `/workspace/${workspaceId}/members/${userId}/type`,
      { member_type: memberType }
    );
    return response.data;
  } catch (error) {
    console.error("Error changing member type:", error);
    throw error;
  }
};

// Remove member
export const removeMemberWorkspace = async (workspaceId, userId) => {
  try {
    const response = await authClient.delete(
      `/workspace/${workspaceId}/members/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error removing member:", error);
    throw error;
  }
};
////// Viết luôn vào đây luôn cho tiện (quoc)
export const checkMemberInWorkspace = async (workspaceId, userId) => {
  try {
    const response = await authClient.get(
      `workspace/${workspaceId}/check-member/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("False get board closed:", error);
    throw error;
  }
};

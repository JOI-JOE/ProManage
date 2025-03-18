import authClient from "../authClient";

export const getWorkspacesAll = async () => {
  try {
    const response = await authClient.get("/workspaces");
    console.log(response.data);
    
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

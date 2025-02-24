import authClient from "../authClient";

export const getWorkspacesAll = async () => {
  try {
    const response = await authClient.get("/workspaces");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy workspace của người dùng:", error);
    throw error;
  }
};

// Lấy chi tiết workspace theo display_name
export const getWorkspaceByName = async (name) => {
  try {
    const response = await authClient.get(`/workspaces/${name}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy workspace của người dùng:", error);
    throw error;
  }
};

export const createWorkspace = async (data) => {
  try {
    const response = await authClient.post("/workspaces", data);
    return response.data;
  } catch (error) {
    console.error(
      "Lỗi khi tạo workspace:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateWorkspaceInfo = async (id, data) => {
  try {
    const response = await authClient.put(`/workspaces/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(
      "Lỗi khi cập nhật workspace:",
      error.response?.data || error.message
    );
    throw error;
  }
};

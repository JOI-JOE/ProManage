import authClient from "../authClient";

export const getWorkspace = async () => {
  try {
    const response = await authClient.get("workspaces");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy workspace của người dùng:", error);
    throw error;
  }
};

export const getWorkspaceById = async () => {
  try {
    const response = await authClient.get("workspaces/id");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy workspace của người dùng:", error);
    throw error;
  }
};

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

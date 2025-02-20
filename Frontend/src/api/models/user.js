import authClient from "../authClient ";

export const getUser = async () => {
  try {
    const response = await authClient.get("user/me"); // Or /api/users/me, adjust as needed.
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

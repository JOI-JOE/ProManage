import authClient from "../authClient";

export const getUser = async () => {
  try {
    const response = await authClient.get("/users/me");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu người dùng:", error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await authClient.post("/login", credentials);
    return response.data; // Trả về dữ liệu từ server
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await authClient.post("/logout");
    localStorage.removeItem("token"); // Xóa token khỏi localStorage
    return response.data; // Trả về dữ liệu phản hồi từ server
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    throw error;
  }
};

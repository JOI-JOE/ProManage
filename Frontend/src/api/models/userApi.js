import authClient from "../authClient";

/**
 * File này giúp tương tác trực tiếp với dữ liệu
 * viết như này để độc lập với UI
 *
 * Tóm lại
 * File useUser.js (Hooks) sử dụng các hàm trong file userApi.js (Modules).
 * File userApi.js (Modules) cung cấp dữ liệu và logic cho file useUser.js (Hooks).
 */

/**
 * Hàm này chịu trách nhiệm lấy thông tin người dùng từ API.
 * @returns {Promise<object>} - Promise chứa dữ liệu người dùng.
 */
export const getUser = async () => {
  try {
    const response = await authClient.get("/users/me");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu người dùng:", error);
    throw error;
  }
};

/**
 * Hàm này chịu trách nhiệm đăng nhập người dùng.
 * @param {object} credentials - Thông tin đăng nhập (username, password).
 * @returns {Promise<object>} - Promise chứa dữ liệu người dùng sau khi đăng nhập thành công.
 */
export const loginUser = async (credentials) => {
  try {
    const response = await authClient.post("/login", credentials);
    return response.data; // Trả về dữ liệu từ server
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    throw error;
  }
};

/**
 * Hàm này chịu trách nhiệm đăng xuất người dùng.
 * @returns {Promise<object>} - Promise xác nhận đăng xuất thành công.
 */
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

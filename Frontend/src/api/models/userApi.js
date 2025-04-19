import authClient from "../authClient";

// Phần để tối ưu gọi api
export const fetchUserData = async () => {
  try {
    const response = await authClient.get(`/member/me`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu người dùng:", error);
    throw error;
  }
};
// END

/**
 * Hàm này chịu trách nhiệm đăng nhập người dùng.
 * @param {object} credentials - Thông tin đăng nhập (email, password).
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

/**
 * Hàm này chịu trách nhiệm gửi yêu cầu quên mật khẩu.
 * @param {string} email - Email của người dùng cần đặt lại mật khẩu.
 * @returns {Promise<object>} - Promise chứa phản hồi từ server.
 */
export const forgotPassword = async (email) => {
  try {
    const response = await authClient.post("/forgot-password", { email });
    return response.data; // Trả về dữ liệu từ server
  } catch (error) {
    console.error("Lỗi khi yêu cầu quên mật khẩu:", error);
    throw error;
  }
};

/**
 * Hàm này chịu trách nhiệm đăng ký người dùng mới.
 * @param {object} userData - Dữ liệu người dùng (name, email, password).
 * @returns {Promise<object>} - Promise chứa phản hồi từ server.
 */
export const userRegister = async (userData) => {
  try {
    const response = await authClient.post("/register", userData);
    return response.data; // Trả về dữ liệu từ server
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    throw error;
  }
};

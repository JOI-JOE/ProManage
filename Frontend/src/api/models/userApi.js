import authClient from "../authClient";

// Phần để tối ưu gọi api

// dữ liệu chính
const fetchUserDataWithParams = async (params, userId = "me") => {
  try {
    const queryParams = new URLSearchParams(params);
    const response = await authClient.get(
      `/member/${userId}?${queryParams.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu người dùng:", error);
    throw error;
  }
};

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

// Để làm gì -> Lấy danh sách Boards và nhóm theo Workspaces
// Nơi dùng  -> Hiển thị danh sách bảng trong từng Workspace để so sách
export const fetchUserBoardsWithWorkspaces = async (userId) => {
  return fetchUserDataWithParams(
    {
      fields: "id",
      boards: "open,starred",
      board_fields: "id,name,closed,workspace_id",
      board_workspace: "true",
      board_workspace_fields: "id,name,display_name",
      workspaces: "all",
      workspace_fields: "id,display_name,name",
    },
    userId
  );
};

// Để làm gì -> Lấy danh sách Workspaces của người dùng
// Nơi dùng ->	Sidebar và mục "Các Không Gian Làm Việc Của Bạn"
export const fetchUserWorkspaces = async () => {
  try {
    const params = {
      workspaces: "all",
      workspace_fields: "id,name,display_name",
    };
    const response = await authClient.get("/member/me", { params });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách Workspaces:", error);
    throw error;
  }
};

// Để làm gì -> Lấy danh sách Boards không nhóm theo Workspaces
// Nơi dùng -> Hiển thị các bảng đã đánh dấu sao hoặc đã xem gần đây
export const fetchUserBoards = async () => {
  try {
    const params = {
      fields: "id",
      boards: "open,starred",
      board_fields: "id,name,closed,is_marked",
      boardStars: "true",
      board_memberships: "me",
    };
    const response = await authClient.get("/member/me", { params });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách Boards:", error);
    throw error;
  }
};

// END

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
    const response = await authClient.post("password/email", { email });
    return response.data; // Trả về dữ liệu từ server
  } catch (error) {
    console.error("Lỗi khi yêu cầu quên mật khẩu:", error);
    throw error;
  }
};
/**
 * Hàm này chịu trách nhiệm gửi yêu cầu quên mật khẩu.
 * @param {string} email - Email của người dùng cần đặt lại mật khẩu.
 * @returns {Promise<object>} - Promise chứa phản hồi từ server.
 */

export const checkCode = async (email, code) => {
  // console.log(email);
  // console.log(code);
  try {
    const response = await authClient.post("password/code", { email, code });
    return response.data; // Trả về dữ liệu từ server
  } catch (error) {
    console.error("Lỗi khi check code", error);
    throw error;
  }
};
/**
 * Hàm này chịu trách nhiệm gửi yêu cầu quên mật khẩu.
 * @param {string} email - Email của người dùng cần đặt lại mật khẩu.
 * @returns {Promise<object>} - Promise chứa phản hồi từ server.
 */
export const updatePass = async (email, password) => {
  try {
    const response = await authClient.put("password/update", {
      email,
      password,
    });
    return response.data; // Trả về dữ liệu từ server
  } catch (error) {
    console.error("Lỗi khi cập nhật mật khẩu", error);
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

export const getUserById = async () => {
  try {
    const response = await authClient.get(`/user`);
    return response.data.user; // do API trả về { user: ... }
  } catch (error) {
    console.error("Lỗi khi lấy người dùng theo ID:", error);
    throw error;
  }
};

export const updateUserProfile = async (data) => {
  try {
    const response = await authClient.put(`/user/update-profile`, data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật hồ sơ người dùng:", error);
    throw error;
  }
};

/**
 * - interceptor - xử lý lỗi
 * - File này chứa logic để xử lý lỗi 401 (Unauthorized) từ server. Lỗi 401 thường xảy ra khi token xác thực hết hạn hoặc không hợp lệ.
 * 
 * - Refresh token (nếu có): Thử refresh token nếu ứng dụng sử dụng cơ chế refresh token.
 * - Đăng xuất người dùng: Nếu không thể refresh token hoặc không có refresh token, người dùng sẽ bị đăng xuất.
 * - Chuyển hướng người dùng: Chuyển hướng người dùng đến trang đăng nhập hoặc hiển thị thông báo lỗi.
 */

export const handle401Error = (error, navigate) => {
  if (error.response && error.response.status === 401) {
    console.error("Lỗi 401: Token hết hạn hoặc không hợp lệ");
    localStorage.removeItem("token");

    if (typeof navigate === "function") {
      navigate("/login"); // ✅ Chuyển hướng đúng cách
    } else {
      console.error("navigate is not a function, sử dụng window.location.href");
      window.location.href = "/login"; // 🔥 Dùng dự phòng nếu navigate lỗi
    }
  }
  return Promise.reject(error);
};

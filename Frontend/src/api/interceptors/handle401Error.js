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

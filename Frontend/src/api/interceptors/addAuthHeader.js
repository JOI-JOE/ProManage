/**
 * - interceptor - chặn yêu cầu 
 * - mục đích là: file này chứa logic đẻ thêm vào header xác thực Authentication
 * và mỗi yêu cầu HTTP được gửi đi từ ứng dụng. Header này thường chứa token hoặc xác định người dùng
 */

export const addAuthHeader = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

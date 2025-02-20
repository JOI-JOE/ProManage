export const handle401Error = async (error) => {
  const navigate = useNavigate();

  if (error.response && error.response.status === 401) {
    console.error("Lỗi 401: Token hết hạn hoặc không hợp lệ");
    localStorage.removeItem("token");
    navigate("/login");
    return Promise.reject(error);
  }
  return Promise.reject(error);
};

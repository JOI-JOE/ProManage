import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import {
  fetchUserBoards,
  fetchUserBoardsWithWorkspaces,
  fetchUserWorkspaces,
  forgotPassword,
  getUser,
  userRegister,
} from "../api/models/userApi";
import { loginUser } from "../api/models/userApi";
import { logoutUser } from "../api/models/userApi";

// Hook dùng để lấy danh sách Boards không nhóm theo Workspaces
export const useUserBoards = () => {
  return useQuery({
    queryKey: ["userBoards"],
    queryFn: fetchUserBoards,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

// Hook dùng để lấy danh sách Workspaces
export const useUserWorkspaces = () => {
  return useQuery({
    queryKey: ["userWorkspaces"],
    queryFn: fetchUserWorkspaces,
    staleTime: 1000 * 60 * 5, // Giữ cache 5 phút
    retry: 1, // Số lần thử lại khi gặp lỗi
  });
};

// Hook dùng để lấy danh sách Boards nhóm theo Workspaces
export const useUserBoardsWithWorkspaces = () => {
  return useQuery({
    queryKey: ["userBoardsWithWorkspaces"],
    queryFn: fetchUserBoardsWithWorkspaces,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => await getUser(),
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });
};

/**
 * Hook useLogin để đăng nhập.
 * @returns {object} - Object chứa hàm mutate để gọi API đăng nhập và các trạng thái liên quan.
 *
 * useMutation -> được dùng cho các thao tác thay đổi dữ liệu trên serve
 * ví dụ : tạo mới, xóa, cập nhật dữ liệu.\
 * Thao tác thay đổi trạng thái của người dùng (từ chưa đăng nhập sang đăng nhập)
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser, // Gọi API login
    onSuccess: (data) => {
      // Lưu token vào localStorage
      localStorage.setItem("token", data.token);
      // Invalidate cache của user để làm mới dữ liệu người dùng
      queryClient.invalidateQueries(["user"]);
    },
    onError: (error) => {
      console.error("Lỗi khi đăng nhập:", error);
      throw error; // Ném lỗi để xử lý ở phía component
    },
  });
};

/**
 * Hook useLogin để đăng nhập.
 * @returns {object} - Object chứa hàm mutate để gọi API đăng nhập và các trạng thái liên quan.
 *
 * useMutation -> được dùng cho các thao tác thay đổi dữ liệu trên serve
 * ví dụ : tạo mới, xóa, cập nhật dữ liệu.\
 * Thao tác thay đổi trạng thái của người dùng (từ chưa đăng nhập sang đăng nhập)
 */
export const useRegister = () => {
  return useMutation({
    mutationFn: userRegister, // Gọi API login
  });
};

/**
 * Hook useLogout để đăng xuất.
 * @returns {object} - Object chứa hàm mutate để gọi API đăng xuất và các trạng thái liên quan.
 */
export const useLogout = () => {
  return useMutation({
    mutationFn: logoutUser,
  });
};

/**
 * Hook useForgotPassword để xử lý quên mật khẩu.
 * @returns {object} - Object chứa hàm mutate để gọi API quên mật khẩu và các trạng thái liên quan.
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword, // Gọi API quên mật khẩu
  });
};

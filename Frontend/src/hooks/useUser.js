import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import {
  checkCode,
  fetchUserBoardsWithWorkspaces,
  forgotPassword,
  getUser,
  updatePass,
  getUserById,
  updateUserProfile,
  userRegister,
  fetchUserData,
} from "../api/models/userApi";
import { loginUser } from "../api/models/userApi";
import { logoutUser } from "../api/models/userApi";

export const useUserData = () => {
  return useQuery({
    queryKey: ["userInfo"],
    queryFn: fetchUserData,
    staleTime: 10 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useFetchUserBoardsWithWorkspaces = (userId) => {
  return useQuery({
    queryKey: ["userBoardsWithWorkspaces", userId], // Cache theo từng userId
    queryFn: () => fetchUserBoardsWithWorkspaces(userId), // Gọi API
    enabled: !!userId, // Chỉ fetch khi có userId hợp lệ
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
    mutationFn: ({ email }) => forgotPassword(email), // Gọi API quên mật khẩu
  });
};

export const useCheckCode = () => {
  return useMutation({
    mutationFn: ({ email, code }) => checkCode(email, code),
  });
};
export const useUpdatePass = () => {
  return useMutation({
    mutationFn: ({ email, password }) => updatePass(email, password),
  });
};

export const useUserById = () => {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: () => getUserById(),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"], exact: true });
    },
  });
};

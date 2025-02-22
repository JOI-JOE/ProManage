/**
 * FIle này sử dụng các hàm được import từ userApi để thực hiện
 * các thao tác liên quan đến người dùng
 *
 * Tóm lại
 * File useUser.js (Hooks) sử dụng các hàm trong file userApi.js (Modules).
 * File userApi.js (Modules) cung cấp dữ liệu và logic cho file useUser.js (Hooks).
 *
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { getUser } from "../api/models/userApi";
import { loginUser } from "../api/models/userApi";
import { logoutUser } from "../api/models/userApi";

/**
 * Hook useUser để lấy thông tin người dùng.
 * @returns {object} - Object chứa dữ liệu người dùng, trạng thái loading và error.
 *
 * useQuery -> được dùng để lấy dữ liệu không thay đổi từ serve
 * trong trường hợp này thì thông tin người dùng không thay đổi thường xuyên
 *
 * - Nó sẽ cache dữ liệu này để sử dụng lại khi cần, giúp tăng hiệu suất ứng dụng
 * - Nó cũng tự động quảng lý loading và error, giúp bạn dễ dàng thay đổi thường xuyên
 *
 */
export const useUser = () => {
  return useQuery({
    queryKey: ["user"], // Key duy nhất để xác định và cache dữ liệu người dùng.
    queryFn: getUser, // Hàm gọi API để lấy dữ liệu người dùng.
    staleTime: 1000 * 60 * 5, // Dữ liệu được coi là "stale" sau 5 phút (ms * s * m).
    cacheTime: 1000 * 60 * 30, // Dữ liệu được giữ trong cache tối đa 30 phút.
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
 * Hook useLogout để đăng xuất.
 * @returns {object} - Object chứa hàm mutate để gọi API đăng xuất và các trạng thái liên quan.
 */
export const useLogout = () => {
  return useMutation({
    mutationFn: logoutUser,
  });
};

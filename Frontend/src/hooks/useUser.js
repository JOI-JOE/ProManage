import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import {
  // fetchUserBoardsWithWorkspaces,
  fetchUserDashboardOverview,
  fetchUserInfoWithWorkspaces,
  fetUserBoardStar,
  forgotPassword,
  getUser,
  userRegister,
} from "../api/models/userApi";
import { loginUser } from "../api/models/userApi";
import { logoutUser } from "../api/models/userApi";

export const useUserOverviewData = () => {
  const {
    data: userInfo,
    isLoading: isLoadingUserInfo,
    error: errorUserInfo,
  } = useQuery({
    queryKey: ["userInfo"], // Tạo query key để lưu cache
    queryFn: fetchUserInfoWithWorkspaces, // API call để lấy thông tin user
    onError: (error) => {
      console.error("Error loading user data:", error); // In lỗi nếu có
    },
  });

  const {
    data: userDashboard,
    isLoading: isLoadingDashboard,
    error: errorDashboard,
  } = useQuery({
    queryKey: ["userDashboard"], // Tạo query key để lưu cache cho dashboard
    queryFn: fetchUserDashboardOverview, // API call để lấy thông tin user dashboard
    onError: (error) => {
      console.error("Error loading user dashboard data:", error); // In lỗi nếu có
    },
  });

  // Tính toán trạng thái loading tổng thể
  const isLoading = isLoadingUserInfo || isLoadingDashboard;

  return {
    userInfo,
    userDashboard,
    isLoading,
    error: errorUserInfo || errorDashboard, // Lỗi từ userInfo hoặc dashboard
  };
};

export const useUserBoardStar = (userId) => {
  const [loading, setLoading] = useState(true); // Trạng thái loading
  const [error, setError] = useState(null); // Trạng thái lỗi
  const [boardStars, setBoardStars] = useState([]); // Lưu trữ kết quả trả về từ API

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null); // Reset error khi bắt đầu lại gọi API

      try {
        const data = await fetUserBoardStar(userId); // Sử dụng hàm fetUserBoardStar để lấy dữ liệu
        setBoardStars(data); // Lưu kết quả vào state
      } catch (err) {
        setError("Lỗi khi lấy dữ liệu board stars"); // Cập nhật lỗi nếu có
      } finally {
        setLoading(false); // Dừng trạng thái loading khi API đã gọi xong
      }
    };

    fetchData();
  }, [userId]); // Chạy lại nếu userId thay đổi

  return { loading, error, boardStars };
};

// export const useFetchUserBoardsWithWorkspaces = (userId) => {
//   return useQuery({
//     queryKey: ["userBoardsWithWorkspaces", userId], // Cache theo từng userId
//     queryFn: () => fetchUserBoardsWithWorkspaces(userId), // Gọi API
//     enabled: !!userId, // Chỉ fetch khi có userId hợp lệ
//   });
// };

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
    mutationFn: forgotPassword, // Gọi API quên mật khẩu
  });
};

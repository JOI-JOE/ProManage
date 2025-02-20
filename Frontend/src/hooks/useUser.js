import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { getUser } from "../api/models/userApi";
import { loginUser } from "../api/models/userApi";
import { logoutUser } from "../api/models/userApi";

export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser, // Gọi API login
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: logoutUser,
  });
};

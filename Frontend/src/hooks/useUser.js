// import { useQuery } from "react-query";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "../api/models/user";

export const useUsers = () => {
  const {
    isLoading,
    error,
    data: user,
  } = useQuery({
    queryKey: ["user", "me"],
    queryFn: getUser,
  });

  return { isLoading, error, user };
};

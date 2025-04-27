import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWorkspacesAll,
  createWorkspace,
  updateWorkspaceInfo,
  getWorkspaceByName,
  getWorkspaceById,
  getBoardMarkedByWorkspace,
  getGuestWorkspace,
  getUserWorkspaces,
  getUserWorkspaces2,
  fetchWorkspacesAll,
  changeType,
  removeMemberWorkspace,
  updateWorkspacePermission,
  // checkMemberInWorkspace,
} from "../api/models/workspacesApi";
import { useCallback, useEffect, useId, useRef } from "react";
import echoInstance from "./realtime/useRealtime";
import { useMe } from "../contexts/MeContext";

export const usefetchWorkspaces = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspacesAll,
    staleTime: 5 * 60 * 1000, // 5 phút: dữ liệu "tươi" trong 5 phút
    cacheTime: 10 * 60 * 1000, // 10 phút: giữ cache 10 phút sau khi không dùng
    refetchOnWindowFocus: false, // Không refetch khi focus lại tab
  });
};

// Realtime -----------------------------------------------------------------------------------

/// dữ liệu workspace tống
export const useGetWorkspaces = () => {
  const queryClient = useQueryClient();
  const channelRef = useRef(null);
  const { user } = useMe();

  // // Xử lý sự kiện khi có thành viên mới được mời
  const handleMemberInvited = useCallback(
    (event) => {
      if (event?.user?.id === user?.id) {
        console.log("📩 MemberInvitedToWorkspace:", event);
        // Nếu trùng, invalidate lại query workspaces để refetch dữ liệu
        queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        queryClient.invalidateQueries({
          queryKey: ["workspace", event?.user?.workspaceId],
        });
        queryClient.invalidateQueries({
          queryKey: ["user_main"],
        });
      }
    },
    [queryClient, user?.id]
  );

  // Xử lý sự kiện khi có thay đổi thành viên (thêm, xóa, cập nhật quyền)
  const handleWorkspaceMemberUpdated = useCallback(
    (event) => {
      // Nếu sự kiện liên quan đến userId, invalidate lại query workspaces
      if (event?.user?.id === user?.id) {
        queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        queryClient.invalidateQueries({
          queryKey: ["workspace", event?.user?.workspaceId],
        });
        queryClient.invalidateQueries({
          queryKey: ["user_main"],
          exact: true,
        });
      }
    },
    [queryClient, user?.id]
  );

  useEffect(() => {
    if (!user?.id) return;
    const channel = echoInstance.channel(`user.${user?.id}`);
    channelRef.current = channel;

    // Lắng nghe sự kiện MemberInvitedToWorkspace
    channel.listen(".MemberInvitedToWorkspace", handleMemberInvited);
    channel.listen(".WorkspaceMemberUpdated", handleWorkspaceMemberUpdated);

    return () => {
      if (channelRef.current) {
        // Dừng lắng nghe khi component unmount
        channelRef.current.stopListening(".MemberInvitedToWorkspace");
        channelRef.current.stopListening(".WorkspaceMemberUpdated");
        echoInstance.leave(`user.${user?.id}`);
      }
    };
  }, [user?.id, handleWorkspaceMemberUpdated]);

  // Fetch workspaces
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: getWorkspacesAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Không refetch khi focus lại tab
    retry: 2, // Thử lại 2 lần nếu lỗi
    onSuccess: (data) => {
      console.log("✅ Danh sách workspaces:", data);
    },
    onError: (error) => {
      console.error("❌ Lỗi khi lấy danh sách workspaces:", error);
    },
  });
};

export const useGetWorkspaceById = (workspaceId) => {
  const queryClient = useQueryClient();
  const channelRef = useRef(null);

  const handleWorkspaceMemberUpdated = useCallback(
    (event) => {
      console.log(event);
      if (event?.user?.workspaceId === workspaceId) {
        queryClient.invalidateQueries({
          queryKey: ["workspace", workspaceId],
          exact: true,
        });
        queryClient.invalidateQueries({
          queryKey: ["workspaces"],
          exact: true,
        });
        queryClient.invalidateQueries({
          queryKey: ["user_main"],
          exact: true,
        });
      }
    },
    [queryClient, workspaceId]
  );

  const handleJoinRequestSent = useCallback(
    (event) => {
      console.log(event);
      if (event?.workspace?.id === workspaceId) {
        queryClient.invalidateQueries({
          queryKey: ["workspace", workspaceId],
          exact: true,
        });

        queryClient.invalidateQueries({
          queryKey: ["workspaces"],
          exact: true,
        });
      }
    },
    [queryClient, workspaceId]
  );

  useEffect(() => {
    // if (!userId || !workspaceId) return;
    if (!workspaceId) return;
    const channel = echoInstance.channel(`workspace.${workspaceId}`);
    channelRef.current = channel;

    channel.listen(".WorkspaceMemberUpdated", handleWorkspaceMemberUpdated);
    channel.listen(".JoinRequestSent", handleJoinRequestSent);

    return () => {
      if (channelRef.current) {
        channelRef.current.stopListening(".WorkspaceMemberUpdated");
        channelRef.current.stopListening(".JoinRequestSent");
        echoInstance.leave(`workspace.${workspaceId}`);
      }
    };
  }, [workspaceId, handleWorkspaceMemberUpdated, handleJoinRequestSent]);

  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspaceById(workspaceId),
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    onError: (error) => {
      console.error("❌ Lỗi khi lấy dữ liệu workspace:", error);
    },
  });
};

// -----------------------------------------------------------------------------------

export const useGetGuestWorkspaces = () => {
  return useQuery({
    queryKey: ["guestWorkspaces"],
    queryFn: getGuestWorkspace,
    staleTime: 5 * 60 * 1000, // 5 phút
    cacheTime: 10 * 60 * 1000, // 10 phút
    refetchOnWindowFocus: false, // Không refetch khi focus lại tab
    retry: 2, // Thử lại 2 lần nếu lỗi
    onError: (error) => {
      console.error("Lỗi khi lấy danh sách workspaces khách:", error);
    },
  });
};

export const useGetWorkspaceByName = (workspaceName) => {
  return useQuery({
    queryKey: ["workspace", workspaceName], // Key để cache dữ liệu
    queryFn: () => getWorkspaceByName(workspaceName),
    enabled: !!workspaceName, // Chỉ gọi API nếu name tồn tại
    staleTime: 1000 * 60 * 5, // Dữ liệu cache sẽ được giữ 5 phút trước khi bị xem là cũ
    cacheTime: 1000 * 60 * 30, // Giữ dữ liệu cache trong 30 phút ngay cả khi không sử dụng
    retry: 2, // Thử lại tối đa 2 lần nếu request thất bại
  });
};

export const useGetBoardMarkedByWorkspace = (workspaceName) => {
  return useQuery({
    queryKey: ["BoardMarked", workspaceName], // Key để cache dữ liệu
    queryFn: () => getBoardMarkedByWorkspace(workspaceName),
    enabled: !!workspaceName, // Chỉ gọi API nếu name tồn tại
    staleTime: 1000 * 60 * 5, // Dữ liệu cache sẽ được giữ 5 phút trước khi bị xem là cũ
    cacheTime: 1000 * 60 * 30, // Giữ dữ liệu cache trong 30 phút ngay cả khi không sử dụng
    retry: 2, // Thử lại tối đa 2 lần nếu request thất bại
  });
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
    },
    onError: (error) => {
      console.error("Lỗi khi tạo workspace:", error);
    },
  });
};

export const useGetUserWorkspaces = () => {
  return useQuery({
    queryKey: ["userWorkspaces"], // Key để cache dữ liệu
    queryFn: getUserWorkspaces,
    staleTime: 1000 * 60 * 5, // Dữ liệu sẽ hết hạn sau 5 phút
    cacheTime: 1000 * 60 * 30, // Dữ liệu sẽ được cache trong 30 phút
    retry: 2, // Thử lại 2 lần nếu có lỗi
  });
};

export const useUserWorkspaces = () => {
  return useQuery({
    queryKey: ["userWorkspaces2"],
    queryFn: getUserWorkspaces2,
  });
};
// Function chính

// Hook to change a member's type in a workspace
export const useChangeMemberType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, userId, memberType }) =>
      changeType(workspaceId, userId, memberType),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId],
        exact: true,
      });
    },
    onError: (error) => {
      console.error("Error when changing member type:", error);
    },
  });
};

export const useUpdateInforWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateWorkspaceInfo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"], exact: true });
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật workspace:", error);
    },
  });
};

export const useUpdateWorkspacePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, permissionLevel }) =>
      updateWorkspacePermission(workspaceId, permissionLevel),
    onSuccess: (response, variables) => {},
    onError: (error) => {
      console.error("Error when updating workspace permission:", error);
    },
  });
};

// Hook to remove a member from a workspace
export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, userId, moveType }) =>
      removeMemberWorkspace(workspaceId, userId, moveType),
    onSuccess: (response, variables) => {
      // queryClient.invalidateQueries({
      //   queryKey: ["workspace", variables.workspaceId],
      //   exact: true,
      // });
    },
    onError: (error) => {
      console.error("Error when removing member:", error);
    },
  });
};
// export const useCheckMemberInWorkspace = (workspaceId, userId) => {
//   return useQuery({
//     queryKey: ["workspace-member-check", workspaceId, userId], // Unique key theo cả 2 giá trị
//     queryFn: () => useCheckMemberInWorkspace(workspaceId, userId),
//     enabled: !!workspaceId && !!userId, // Gọi API khi cả 2 đều tồn tại
//     staleTime: 1000 * 60 * 5, // 5 phút
//     cacheTime: 1000 * 60 * 30, // 30 phút
//     retry: 2,
//   });
// };

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getListByBoardId, updateListPositions } from "../api/models/listsApi";
import { usePusher } from "../contexts/PusherContext";
import { useEffect, useCallback, useMemo } from "react";

export const useLists = (boardId) => {
  const queryClient = useQueryClient();
  const echoInstance = usePusher(); // Lấy echoInstance từ context

  // Query lấy danh sách các list theo boardId
  const listsQuery = useQuery({
    queryKey: ["boardLists", boardId],
    queryFn: () => getListByBoardId(boardId),
    enabled: !!boardId, // Chỉ kích hoạt query khi có boardId
    staleTime: 1000 * 60 * 5, // Cache trong 5 phút
    cacheTime: 1000 * 60 * 30, // Giữ dữ liệu trong 30 phút ngay cả khi query bị hủy
  });

  // Mutation để cập nhật vị trí list
  const reorderMutation = useMutation({
    mutationFn: updateListPositions,
    onMutate: async ({ boardId, updatedPositions }) => {
      await queryClient.cancelQueries(["boardLists", boardId]); // Hủy query cũ

      const previousLists = queryClient.getQueryData(["boardLists", boardId]); // Lấy dữ liệu cũ

      // Cập nhật cache ngay lập tức (Optimistic Update)
      queryClient.setQueryData(["boardLists", boardId], (oldLists) => {
        if (!oldLists) return [];
        return oldLists
          .map((list) => {
            const updatedList = updatedPositions.find(
              (pos) => pos.id === list.id
            );
            return updatedList
              ? { ...list, position: updatedList.position }
              : list;
          })
          .sort((a, b) => a.position - b.position);
      });

      return { previousLists }; // Lưu để rollback nếu lỗi
    },
    onError: (error, _, context) => {
      if (context?.previousLists) {
        queryClient.setQueryData(
          ["boardLists", boardId],
          context.previousLists
        );
      }
      console.error("❌ Lỗi khi cập nhật vị trí:", error);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["boardLists", boardId]); // Làm mới dữ liệu từ server
    },
  });

  // Hàm xử lý sự kiện từ Pusher
  const handleListReordered = useCallback(
    (event) => {
      console.log("📡 Nhận dữ liệu từ Pusher:", event);

      if (!event?.positions) {
        console.warn("⚠️ Không có dữ liệu vị trí trong sự kiện Pusher.");
        return;
      }

      // Cập nhật cache ngay lập tức (Optimistic UI)
      queryClient.setQueryData(["boardLists", boardId], (oldLists) => {
        if (!oldLists) return [];

        const updatedLists = oldLists.map((list) => {
          const updatedList = event.positions.find((pos) => pos.id === list.id);
          return updatedList
            ? { ...list, position: updatedList.position }
            : list;
        });

        return updatedLists.sort((a, b) => a.position - b.position);
      });
    },
    [boardId, queryClient]
  );

  // Lắng nghe sự kiện từ Pusher
  useEffect(() => {
    if (!boardId || !echoInstance) {
      console.warn("⚠️ Không có boardId hoặc echoInstance chưa khởi tạo.");
      return;
    }

    console.log(`📡 Đăng ký kênh board.${boardId}`);
    const channel = echoInstance.channel(`board.${boardId}`); // Dùng .private()

    channel.listen(".list.reordered", handleListReordered);

    return () => {
      console.log(`🛑 Hủy đăng ký kênh board.${boardId}`);
      channel.stopListening(".list.reordered");
      channel.unsubscribe();
    };
  }, [boardId, echoInstance, handleListReordered]);

  // Sử dụng useMemo để tối ưu hóa việc trả về dữ liệu
  const memoizedReturnValue = useMemo(
    () => ({
      ...listsQuery,
      reorderLists: reorderMutation.mutateAsync,
    }),
    [listsQuery, reorderMutation.mutateAsync]
  );

  return memoizedReturnValue;
};

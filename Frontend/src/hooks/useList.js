import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePusher } from "../contexts/PusherContext";
import { useEffect, useCallback, useMemo } from "react";
import {
    getListDetail,
    getListByBoardId,
    updateListPositions,
    createList,
    updateListName,
    updateClosed,
} from "../api/models/listsApi";

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

    // Mutation để tạo list mới
    const createListMutation = useMutation({
        mutationFn: (listName) => createList(boardId, listName),
        onSuccess: (data) => {
            console.log("Danh sách mới đã được tạo:", data);
            queryClient.invalidateQueries(["boardLists", boardId]);
        },
        onError: (error) => {
            console.error("Lỗi khi tạo danh sách:", error);
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


    // Lắng nghe sự kiện list.created
    const handleListCreated = useCallback(
        (event) => {
            console.log("📡 Nhận sự kiện từ Pusher về danh sách mới:", event);

            // Cập nhật UI khi danh sách mới được tạo
            queryClient.setQueryData(["boardLists", boardId], (oldLists) => {
                if (!oldLists) return [];
                return [...oldLists, event.newList].sort((a, b) => a.position - b.position); // Thêm list mới vào và sắp xếp lại
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

        console.log("📡 echoInstance:", echoInstance); // Kiểm tra echoInstance

        // Kiểm tra xem echoInstance có phải là instance của Echo không
        if (!echoInstance.channel) {
            console.error("❌ echoInstance không phải là một instance của Echo.");
            return;
        }

        console.log(`📡 Đăng ký kênh board.${boardId}`);
        const channel = echoInstance.channel(`board.${boardId}`); // Sử dụng .channel()

        if (!channel) {
            console.error("❌ Không thể đăng ký kênh.");
            return;
        }

        console.log("📡 Kênh đã đăng ký:", channel); // Kiểm tra kênh

        channel.listen(".list.created", handleListCreated);
        channel.listen(".list.reordered", handleListReordered);

        return () => {
            console.log(`🛑 Hủy đăng ký kênh board.${boardId}`);
            channel.stopListening(".list.created");
            channel.stopListening(".list.reordered");
            echoInstance.leave(`board.${boardId}`);
        };
    }, [boardId, echoInstance, handleListCreated, handleListReordered]);





    // Sử dụng useMemo để tối ưu hóa việc trả về dữ liệu
    const memoizedReturnValue = useMemo(
        () => ({
            ...listsQuery,
            reorderLists: reorderMutation.mutate,
            createList: createListMutation.mutate,
        }),
        [listsQuery, reorderMutation.mutate, createListMutation.mutate]
    );

    return memoizedReturnValue;
};



export const useListById = (listId) => {
        // console.log('useListById called with listId:', listId); // Log kiểm tra listId
    const queryClient = useQueryClient();
    const echoInstance = usePusher();
    
    const listsDetail = useQuery({
        queryKey: ["list", listId],
        queryFn: () => getListDetail(listId),
        enabled: !!listId, // Chỉ kích hoạt query khi có boardId
        staleTime: 1000 * 60 * 5, // Cache trong 5 phút
        cacheTime: 1000 * 60 * 30, // Giữ dữ liệu trong 30 phút ngay cả khi query bị hủy
        onSuccess: (data) => {
            console.log('Query data:', data); // Log dữ liệu trả về từ query
        }
    });

    

    // Mutation để cập nhật tên list
    const updateListNameMutation = useMutation({
        mutationFn: (newName) => updateListName(listId, newName),
        onSuccess: (data) => {
            console.log("Danh sách đã được cập nhật:", data);
            queryClient.invalidateQueries(["list", listId]);
        },
        onError: (error) => {
            console.error("Lỗi khi cập nhật tên danh sách:", error);
        },
    });

    // Mutation để cập nhật trạng thái đóng/mở list
    const updateClosedMutation = useMutation({
        mutationFn: (closed) => updateClosed(listId, closed),
        onSuccess: (data) => {
            console.log("Trạng thái lưu trữ đã được cập nhật:", data);
            queryClient.invalidateQueries(["list", listId]);
        },
        onError: (error) => {
            console.error("Lỗi khi cập nhật trạng thái lưu trữ:", error);
        },
    });

    const handleListUpdateName = useCallback((event) => {
        console.log('📡 Nhận sự kiện từ Pusher:', event);
    
        if (event?.list?.id === listId) {
            queryClient.setQueryData(['list', listId], (oldData) => {
                console.log("Old Data:", oldData);
                if (oldData) {
                    console.log("Updating name:", event.list.name);
                    const newData = { ...oldData, name: event.list.name };
                    console.log("New Data:", newData);
                    queryClient.invalidateQueries(['list', listId]);
                    return newData;
                    // return newData;
                } else {
                    console.warn('⚠️ Không tìm thấy dữ liệu cũ để cập nhật. Đang làm mới dữ liệu...');
                    queryClient.invalidateQueries(['list', listId]);
                    return oldData;
                }
            });
        }
    }, [listId, queryClient]);
    
    
    const handleListArchived = useCallback((event) => {
        console.log("📡 Nhận dữ liệu từ Pusher:", event);
        if (event?.list?.id === listId) {
            queryClient.setQueryData(["list", listId], (oldData) => {
                console.log("Old Data:", oldData);
                if (oldData) {
                    
                    const newData = { ...oldData, closed: event.list.closed };
                    console.log("New Data:", newData);
                    queryClient.invalidateQueries(['list', listId]);
                    return newData;
                 
                } else {
                    queryClient.invalidateQueries(["list", listId]);
                    return oldData;
                }
            });
        }
    }, [listId, queryClient]);
    
    useEffect(() => {
        if (!listId || !echoInstance) {
            console.warn("⚠️ Không có listId hoặc echoInstance chưa khởi tạo.");
            return;
        }
    
        const channel = echoInstance.channel(`list.${listId}`);
    
        channel.listen('.list.nameUpdated', handleListUpdateName);
        channel.listen('.list.archived', handleListArchived);
    
        return () => {
            channel.stopListening('.list.nameUpdated');
            channel.stopListening('.list.archived');
        };
    }, [listId, echoInstance, handleListUpdateName, handleListArchived]);
    
    // return {
    //     ...listsDetail,
    //     updateListName: updateListNameMutation.mutate,
    //     updateClosed: updateClosedMutation.mutate,
    //     // listData, isLoading, isError,
    // };

    const memoizedReturnValue = useMemo(
        () => ({
            ...listsDetail,
            updateListName: updateListNameMutation.mutate,
            updateClosed: updateClosedMutation.mutate,
        }),
        [listsDetail, updateListNameMutation.mutate, updateClosedMutation.mutate]
    );

    return memoizedReturnValue;

    
};

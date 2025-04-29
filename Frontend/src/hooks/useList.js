import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  // getListDetail,
  updateListName,
  updateClosed,
  createListAPI,
  getListByBoardId,
  // updateColPosition,
  deleteList,
  getListClosedByBoard,
  updatePositionList,
  duplicateList,
  checkBoardAccess,
} from "../api/models/listsApi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import echoInstance from "./realtime/useRealtime";
import { optimisticIdManager } from "./optimistic/optimisticIdManager";

// export const useLists = (boardId) => {
//   const queryClient = useQueryClient();

//   const query = useQuery({
//     queryKey: ["lists", boardId],
//     queryFn: () => getListByBoardId(boardId),
//     enabled: !!boardId,
//     staleTime: 0, // Luôn lấy dữ liệu mới từ API
//     cacheTime: 1000 * 60 * 30, // Cache 30 phút
//   });

//   useEffect(() => {
//     if (!boardId) return;

//     // Sử dụng Public Channel để mọi người đều có thể nhận được sự kiện
//     const channel = echoInstance.channel(`board.${boardId}`);

//     // Lắng nghe sự kiện "list.updated"
//     channel.listen(".list.updated", (event) => {
//       console.log("Received list.updated event:", event);
//       console.log("Updated List Data:", event.updatedList);

//       // Cập nhật cache của query "lists" dựa trên dữ liệu mới
//       queryClient.setQueryData(["lists", boardId], (oldData) => {
//         console.log("Old Data:", oldData);

//         if (!oldData || !oldData.columns || !Array.isArray(oldData.columns)) {
//           console.warn(
//             "Old data does not have a valid 'columns' array, returning unchanged."
//           );
//           return oldData;
//         }

//         const newColumns = oldData.columns.map((list) =>
//           list.id === event.updatedList.id
//             ? { ...list, ...event.updatedList }
//             : list
//         );
//         const newData = { ...oldData, columns: newColumns };
//         console.log("New Data after update:", newData.columns);
//         return newData;
//       });
//     });

//     return () => {
//       channel.stopListening(".list.updated");
//     };
//   }, [boardId, queryClient]);

//   return query;
// };

export const useLists = (boardId) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [errorState, setErrorState] = useState(null);
  const isAuthenticated = !!localStorage.getItem('token');

  const query = useQuery({
    queryKey: ["lists", boardId],
    queryFn: async () => {
      // const { data, error } = await getListByBoardId(boardId);

      const access = await checkBoardAccess(boardId);
      if (access.error) {
        setErrorState({ code: access.error, message: access.message, boardId });
        return [];
      }
      // console.log(`checkBoardAccess: Response ${access.error} -`, {
      //   error: access.message,});
      

      const response = await getListByBoardId(boardId);
      if (response.error) {
        setErrorState({ code: response.error, message: response.message, boardId });
        return [];
      }
      return response.data;
    },
    enabled: !!boardId,
    staleTime: 0,
    cacheTime: 1000 * 60 * 30,
  });

  // Xử lý lỗi: nếu không có quyền hoặc không tìm thấy board
  useEffect(() => {
    if (errorState) {
      console.log(`useLists: Xử lý lỗi - ${errorState.code}, boardId: ${errorState.boardId}`);
      switch (errorState.code) {
        case "unauthenticated":
          console.log(`useLists: Chưa đăng nhập, điều hướng đến /login với boardId: ${errorState.boardId}`);
          // return 111;
          // console.warn(`useLists: Chưa đăng nhập, điều hướng đến /login với boardId: ${errorState.boardId}`);
          // navigate(`login?boardId=${errorState.boardId}`, {
          //   state: {
          //     from: window.location.pathname,
          //     boardId: errorState.boardId,
          //   },
          // });
          break;
        case "no_access":
          console.warn(`useLists: Không có quyền truy cập, điều hướng đến /request-join/${errorState.boardId}`);
          navigate(`/request-join/${errorState.boardId}`, {
            state: { from: window.location.pathname },
          });
          break;
        case "not_found":
          console.warn(`useLists: Không tìm thấy board: ${errorState.message}`);
          navigate("/404");
          break;
        case "unknown_error":
          console.error(`useLists: Lỗi không xác định: ${errorState.message}`);
          break;
        default:
          console.error("useLists: Lỗi không được xử lý:", errorState);
      }
    }
  }, [errorState, navigate]);

  useEffect(() => {
    if (!boardId) return;

    const channel = echoInstance.channel(`board.${boardId}`);

    // 📡 Nhận event khi tạo mới list
    channel.listen(".list.created", (data) => {
      console.log("📡 Nhận event từ Pusher: list.created", data);

      queryClient.invalidateQueries({ queryKey: ["lists", boardId] });
    });

    // 📡 Nhận event khi cập nhật list
    channel.listen(".list.updated", (data) => {
      console.log("📡 Nhận event từ Pusher: list.updated", data);

      queryClient.invalidateQueries({ queryKey: ["lists", boardId] });
      queryClient.invalidateQueries({ queryKey: ["listClosed", boardId] });

    });

    // 📡 Nhận event khi tạo mới card
    channel.listen(".card.created", (data) => {
      console.log("📡 Nhận event từ Pusher: card.created", data);

      queryClient.invalidateQueries({ queryKey: ["lists", boardId] });

    });

    // 📡 Nhận event khi card được cập nhật
    channel.listen(".card.updated", (data) => {
      console.log("📡 Nhận event từ Pusher: card.updated", data);

      queryClient.setQueryData(["lists", boardId], (oldBoard) => {
        if (!oldBoard) return oldBoard;

        const listsArray = Array.isArray(oldBoard.columns)
          ? [...oldBoard.columns]
          : [];

        return {
          ...oldBoard,
          columns: listsArray.map((list) =>
            list.id === data.columnId
              ? {
                ...list,
                cards: (list.cards || []).map((card) =>
                  card.id === data.id ? { ...card, ...data } : card
                ),
              }
              : list
          ),
        };
      });
    });

    return () => {
      channel.stopListening(".list.created");
      channel.stopListening(".list.updated");
      channel.stopListening(".card.created");
      channel.stopListening(".card.updated");     
    };
  }, [boardId, queryClient]);

  return query;
};

export const useUpdatePositionList = () => {
  return useMutation({
    mutationFn: async ({ listId, position }) => {
      return await updatePositionList({ listId, position });
    },
    retry: 3,
    retryDelay: 1000,
  });
};

export const useCreateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createListAPI, // Hàm gọi POST API

    onSuccess: (data, listId) => {
      // console.log(data);
      queryClient.invalidateQueries({ queryKey: ["lists"] });

      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            queryKey[0] === 'table-view-list' &&
            Array.isArray(queryKey[1]) &&
            queryKey[1].includes(data.board_id)
          );
        },
      });

    },
    onError: (error) => {
      console.error("❌ Lỗi khi tạo danh sách:", error);
    },
  });
};

export const useUpdateListName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, newName }) => updateListName(listId, newName),
    // onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: ["lists", boardId] });
    // },
    onError: (error) => {
      console.error("❌ Lỗi khi update list name:", error);
    },
  });
};




// Hook lấy danh sách list đã đóng (archived)
export const useListsClosed = (boardId) => {
  const queryClient = useQueryClient();
  const {
    data: listsClosed,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["listClosed", boardId],
    queryFn: () => getListClosedByBoard(boardId),
    enabled: !!boardId,
  });

  // Mutation để xóa list
  const deleteMutation = useMutation({
    mutationFn: deleteList,
    onMutate: async (id) => {
      await queryClient.cancelQueries(["listClosed"]);
      const previousLists = queryClient.getQueryData(["listClosed"]);

      queryClient.setQueryData(["listClosed"], (oldLists) =>
        oldLists?.data ? oldLists.data.filter((list) => list.id !== id) : []
      );

      return { previousLists };
    },
    onError: (error, _, context) => {
      console.error("Xóa thất bại:", error);
      queryClient.setQueryData(["listClosed"], context.previousLists);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["listClosed", boardId] });
      queryClient.invalidateQueries({ queryKey: ["lists", boardId] });

      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            queryKey[0] === 'table-view-list' &&
            Array.isArray(queryKey[1]) &&
            queryKey[1].includes(boardId)
          );
        },
      });

      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            queryKey[0] === 'table-view' &&
            Array.isArray(queryKey[1]) &&
            queryKey[1].includes(boardId)
          );
        },
      });

    },
  });

  // Mutation để cập nhật trạng thái lưu trữ (bỏ lưu trữ)
  const updateClosedMutation = useMutation({
    mutationFn: (listId) => updateClosed(listId),
    onSuccess: (data, listId) => {
      // console.log(`🔄 Cập nhật trạng thái lưu trữ cho list ${listId}`);



      queryClient.invalidateQueries({ queryKey: ["lists", boardId] });
      queryClient.invalidateQueries({ queryKey: ["listClosed", boardId] });
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            queryKey[0] === 'table-view-list' &&
            Array.isArray(queryKey[1]) &&
            queryKey[1].includes(boardId)
          );
        },
      });

      // Cập nhật danh sách list active (nếu có)
      // queryClient.invalidateQueries(["list", listId]);
    },
    onError: (error) => {
      console.error("❌ Lỗi khi cập nhật trạng thái lưu trữ:", error);
    },
  });



  return {
    listsClosed,
    isLoading,
    error,
    deleteMutation,
    updateClosedMutation,
  };
};

export const useDuplicateList = (boardId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, name }) => duplicateList(listId, name),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists", boardId] });
    },

    onError: (error) => {
      console.error("❌ Lỗi khi sao chép danh sách:", error);
    },
  });
};

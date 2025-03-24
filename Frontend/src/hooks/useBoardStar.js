import { useMutation } from "react-query";
import { starBoard, unstarBoard } from "../api/models/boardStarApi";
import { useDispatch } from "react-redux";
import { toggleStarBoard } from "../redux/slices/starredBoardsSlice";

export const useBoardStar = () => {
  const dispatch = useDispatch();

  const starMutation = useMutation({
    mutationFn: ({ userId, boardId }) => starBoard(userId, boardId),
    onMutate: async ({ boardId }) => {
      dispatch(toggleStarBoard(boardId));
    },
    onError: (error, variables) => {
      console.error("❌ Lỗi khi đánh dấu sao board:", error);
      dispatch(toggleStarBoard(variables.boardId));
    },
  });

  const unstarMutation = useMutation({
    mutationFn: ({ userId, boardStarId }) => unstarBoard(userId, boardStarId),
    onMutate: async ({ boardId }) => {
      dispatch(toggleStarBoard(boardId));
    },
    onError: (error, variables) => {
      console.error("❌ Lỗi khi bỏ đánh dấu sao board:", error);
      dispatch(toggleStarBoard(variables.boardId));
    },
  });

  return {
    starBoard: (variables) => starMutation.mutateAsync(variables),
    unstarBoard: (variables) => unstarMutation.mutateAsync(variables),
    isLoading: starMutation.isLoading || unstarMutation.isLoading,
    error: starMutation.error || unstarMutation.error,
  };
};

import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useUserData } from "../hooks/useUser";
import { useBoardStars } from "../hooks/useBoardStar";
import { useDispatch } from "react-redux";
import { setStarredBoards } from "../redux/slices/starredBoardsSlice";

// Tạo Context với giá trị mặc định
const MeContext = createContext({
    user: null,
    workspaceId: null,
    boardId: null,
    boardStars: null,
    isLoading: true,
    error: null
});

// Hook custom để sử dụng context dễ dàng
export const useMe = () => useContext(MeContext);

export const MeProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { userInfo, isLoading, error } = useUserData();
    const { data: boardStars } = useBoardStars(); // Không lấy `isLoading` và `error` vì không cần dùng trong context

    useEffect(() => {
        if (boardStars) {
            dispatch(setStarredBoards(boardStars));
        }
    }, [boardStars, dispatch]);


    const user = userInfo?.user || null;
    const workspaceId = userInfo?.workspaceId || null;
    const boardId = userInfo?.boardId || null;

    const contextValue = useMemo(() => ({
        user,
        workspaceId,
        boardId,
        boardStars,
        isLoading,
        error,
    }), [user, workspaceId, boardId, boardStars, isLoading, error]);

    return <MeContext.Provider value={contextValue}>{children}</MeContext.Provider>;
};

import { createContext, useContext, useEffect, useMemo } from "react";
import { useBoardStars } from "../hooks/useBoardStar";
import { useDispatch } from "react-redux";
import { setStarredBoards } from "../redux/slices/starredBoardsSlice";
// import { fetchUserData } from "../api/models/userApi";
import { useUserData } from "../hooks/useUser";

const MeContext = createContext({
    user: null,
    workspaceId: null,
    boardId: null,
    boardStars: null,
    isLoading: true,
    isUserLoaded: false, // Thêm trạng thái này
    error: null,
});

export const useMe = () => {
    const context = useContext(MeContext);
    if (context === undefined) {
        throw new Error("useMe must be used within a MeProvider");
    }
    return context;
};

export const MeProvider = ({ children }) => {
    const dispatch = useDispatch();

    const { data: userInfo, userLoading, userError } = useUserData()

    const user = userInfo?.user || null;
    const workspaceId = userInfo?.workspaceId || null;
    const boardId = userInfo?.boardId || null;

    // Fetch board stars, chỉ chạy khi user.id tồn tại
    const { data: boardStars, isLoading: starsLoading } = useBoardStars(); // Sửa lại để truyền user.id trực tiếp

    useEffect(() => {
        if (boardStars) {
            dispatch(setStarredBoards(boardStars));
        }
    }, [boardStars, dispatch]);

    const contextValue = useMemo(
        () => ({
            user,
            workspaceId,
            boardId,
            boardStars,
            userLoading,
            userError,
        }),
        [user, workspaceId, boardId, boardStars, userLoading, userError]
    );

    return <MeContext.Provider value={contextValue}>{children}</MeContext.Provider>;
};
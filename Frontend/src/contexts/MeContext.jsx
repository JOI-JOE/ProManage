import { createContext, useContext, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBoardStars } from "../hooks/useBoardStar";
import { useDispatch } from "react-redux";
import { setStarredBoards } from "../redux/slices/starredBoardsSlice";
import { fetchUserData } from "../api/models/userApi";

const MeContext = createContext({
    user: null,
    workspaceId: null,
    boardId: null,
    boardStars: null,
    isLoading: true,
    error: null
});

// Custom hook for easy context usage
export const useMe = () => {
    const context = useContext(MeContext);
    if (context === undefined) {
        throw new Error('useMe must be used within a MeProvider');
    }
    return context;
};

export const MeProvider = ({ children }) => {
    const dispatch = useDispatch();

    // Using React Query for user data
    const {
        data: userInfo,
        isLoading: userLoading,
        error: userError
    } = useQuery({
        queryKey: ["userInfo"],
        queryFn: fetchUserData,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 15 * 60 * 1000, // 15 minutes
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const user = userInfo?.user || null;
    const workspaceId = userInfo?.workspaceId || null;
    const boardId = userInfo?.boardId || null;

    const { data: boardStars, isLoading: starsLoading } = useBoardStars();

    useEffect(() => {
        if (boardStars) {
            dispatch(setStarredBoards(boardStars));
        }
    }, [boardStars, dispatch]);

    // Combine loading states
    const isLoading = userLoading || starsLoading;
    // Combine errors (userError takes precedence)
    const error = userError || null;

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
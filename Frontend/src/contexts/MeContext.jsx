import { createContext, useContext, useEffect, useMemo } from "react";
// // import { useBoardStars } from "../hooks/useBoardStar";
// import { useDispatch } from "react-redux";
// import { setStarredBoards } from "../redux/slices/starredBoardsSlice";
import { useUserData } from "../hooks/useUser";

const MeContext = createContext({
    user: null,
    workspaceId: null,
    boardId: null,
    userLoading: true,
    isUserLoaded: false, 
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
    // const dispatch = useDispatch();

    const { data, userLoading, userError } = useUserData()

    const user = data?.user || null;
    const workspaceIds = data?.workspaces || null;
    const boardIds = data?.boards || null;
    const pendingIds = data?.pending || null

    const contextValue = useMemo(
        () => ({
            boardIds,
            pendingIds,
            workspaceIds,
            user,
            userLoading,
            userError,
        }),
        [boardIds, pendingIds, workspaceIds, user, userLoading, userError]
    );

    return <MeContext.Provider value={contextValue}>{children}</MeContext.Provider>;
};
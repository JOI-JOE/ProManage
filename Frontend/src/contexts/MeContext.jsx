import { createContext, useContext, useEffect, useMemo } from "react";
// // import { useBoardStars } from "../hooks/useBoardStar";
// import { useDispatch } from "react-redux";
// import { setStarredBoards } from "../redux/slices/starredBoardsSlice";
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
    // const dispatch = useDispatch();

    const { data, userLoading, userError } = useUserData()

    const user = data?.user || null;
    // const workspaceId = =data?.workspaceId || null;
    // const boardId = userInfo?.boardId || null;
    console.log(user)

    const contextValue = useMemo(
        () => ({
            user,
            // boardStars,
            userLoading,
            userError,
        }),
        // [user, workspaceId, boardId, boardStars, userLoading, userError]
        [user, userLoading, userError]
    );

    return <MeContext.Provider value={contextValue}>{children}</MeContext.Provider>;
};
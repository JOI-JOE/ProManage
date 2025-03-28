import { createContext, useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useBoardById } from "../hooks/useBoard";

// Tạo Context với giá trị mặc định
const BoardContext = createContext({
    board: null,
    members: [],
    workspace: null,
    isEditable: false,
    canJoinBoard: false,
    canJoinWorkspace: false,
    message: "",
    admins: [],
    showBoardData: false,
    isLoading: true,
    error: null,
});

// Custom hook để sử dụng BoardContext
export const useBoard = () => {
    const context = useContext(BoardContext);
    if (!context) {
        throw new Error("useBoard must be used within a BoardProvider");
    }
    return context;
};

// BoardProvider component
export const BoardProvider = ({ children }) => {
    const { boardId } = useParams();
    const { data, isLoading, error } = useBoardById(boardId);
    const value = useMemo(
        () => ({
            board: data.board,
            members: data.members,
            memberships: data.memberships,
            workspace: data.workspace,
            isEditable: data.isEditable,
            canJoinBoard: data.canJoinBoard,
            canJoinWorkspace: data.canJoinWorkspace,
            message: data.message,
            admins: data.admins,
            showBoardData: data.showBoardData,
            isLoading,
            error,
        }),
        [data, isLoading, error]
    );

    return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};
import { createContext, useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useBoardById } from "../hooks/useBoard";
import { useListByBoardId } from "../hooks/useList";

const BoardContext = createContext(null);

export const useBoard = () => {
    const context = useContext(BoardContext);
    if (!context) {
        throw new Error("useBoard must be used within a BoardProvider");
    }
    return context;
};

export const BoardProvider = ({ children }) => {
    const { boardId } = useParams();

    const { data: boardData, isLoading: boardLoading, error: boardError } = useBoardById(boardId);

    const { data: listData, isLoading: listLoading, error: listError } = useListByBoardId(boardId, {
        enabled: !!boardData,
    });


    // Gộp trạng thái loading và error
    const isLoading = boardLoading || listLoading;
    const error = boardError || listError;

    // Memo hóa dữ liệu để tránh re-render không cần thiết
    const value = useMemo(
        () => ({
            board: boardData?.board || null,
            members: boardData?.members || [],
            memberships: boardData?.memberships || [],
            workspace: boardData?.workspace || null,
            isEditable: boardData?.isEditable || false,
            canJoinBoard: boardData?.canJoinBoard || false,
            canJoinWorkspace: boardData?.canJoinWorkspace || false,
            message: boardData?.message || "",
            admins: boardData?.admins || [],
            showBoardData: boardData?.showBoardData || false,

            // Thêm danh sách lists & cards từ listData
            lists: listData?.lists || [],
            cards: listData?.cards || [],

            isLoading,
            error,
        }),
        [boardData, listData, isLoading, error]
    );

    return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};

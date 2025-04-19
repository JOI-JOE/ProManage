import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
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

    // if (!boardId) return null; // 🔥 quan trọng: tránh gọi hook khi chưa có boardId

    const { data: boardData, isLoading: boardLoading, error: boardError } = useBoardById(boardId);
    const { data: listData, isLoading: listLoading, error: listError, refetch: refetchListData } = useListByBoardId(boardId);
    const [orderedLists, setOrderedLists] = useState([]);

    const processLists = useCallback(() => {
        if (boardLoading || listLoading || !listData) {
            setOrderedLists([]);
            return;
        }

        const lists = listData?.lists || [];
        const cards = listData?.cards || [];

        if (!lists.length) {
            setOrderedLists([]);
            return;
        }

        const processedLists = lists
            .filter(list => !list.closed)
            .sort((a, b) => a.position - b.position)
            .map(list => ({
                ...list,
                cards: cards
                    .filter(card => card.list_board_id === list.id && !card.is_archived)
                    .sort((a, b) => a.position - b.position),
            }));

        setOrderedLists(processedLists);
    }, [boardLoading, listLoading, listData]);

    useEffect(() => {
        processLists();
    }, [processLists]);

    const updateOrderedLists = useCallback((newLists) => {
        setOrderedLists(newLists);
    }, []);

    const isLoading = boardLoading || listLoading;
    const error = boardError || listError;

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
            isActive: boardData?.action || null,
            orderedLists,
            updateOrderedLists,
            refetchListData,
            isLoading,
            error,
        }),
        [
            boardData,
            orderedLists,
            isLoading,
            error,
            refetchListData,
            updateOrderedLists,
        ]
    );

    return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};
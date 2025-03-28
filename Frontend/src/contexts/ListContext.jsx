import { createContext, useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useListByBoardId } from "../hooks/useList";

const ListContext = createContext(null);

export const useList = () => {
    const context = useContext(ListContext);
    if (!context) {
        throw new Error("useList must be used within a ListProvider");
    }
    return context;
};

export const ListProvider = ({ children }) => {
    const { boardId } = useParams();
    const { data, isLoading, error } = useListByBoardId(boardId);

    const value = useMemo(
        () => ({
            data,
            isLoading,
            error,
        }),
        [data, isLoading, error]
    );

    return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
};

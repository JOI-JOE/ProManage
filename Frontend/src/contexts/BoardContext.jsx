import { createContext, useContext } from "react";

const BoardContext = createContext(null)

export const useBoard = () => {
    const context = useContext(BoardContext);
    if (!context) {
        throw new Error("useList must be used within a ListProvider");
    }
    return context;
};

export default BoardContext
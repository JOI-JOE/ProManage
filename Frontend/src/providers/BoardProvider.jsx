// BoardProvider.js
import React, { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { useLists } from "../hooks/useList";
import BoardContext from "../contexts/BoardContext";

const BoardProvider = ({ children }) => {
    const { boardId } = useParams();
    const { data: board, isLoading, error } = useLists(boardId);

    // Sử dụng useMemo để tránh tạo object mới không cần thiết
    const values = useMemo(() => ({ board }), [board]);

    return <BoardContext.Provider value={values}>{children}</BoardContext.Provider>;
};

export default BoardProvider;
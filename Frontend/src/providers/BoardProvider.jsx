// BoardProvider.js
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useLists } from "../hooks/useList";
import BoardContext from "../contexts/BoardContext";

const BoardProvider = ({ children }) => {
    const { boardId } = useParams();
    const { data: fetchedBoard, isLoading, error } = useLists(boardId);
    const [board, setBoard] = useState(null);

    // Cập nhật board khi fetchedBoard thay đổi
    useEffect(() => {
        if (fetchedBoard) {
            setBoard(fetchedBoard);
        }
    }, [fetchedBoard]);

    // Hàm cập nhật board
    const updateBoard = (newBoard) => {
        setBoard(newBoard);
    };

    const updateColumns = (newColumn, isReplacing = false) => {
        setBoard((prevBoard) => {
            if (!prevBoard || !prevBoard.columns) return prevBoard;

            let updatedColumns;
            if (isReplacing) {
                // 🔄 Nếu `isReplacing = true`, thay thế column cũ bằng column mới
                updatedColumns = prevBoard.columns.map((col) =>
                    col.id === newColumn.id ? newColumn : col
                );
            } else {
                // ➕ Nếu là column mới, kiểm tra xem đã tồn tại chưa
                const isExisting = prevBoard.columns.some((col) => col.id === newColumn.id);
                if (isExisting) return prevBoard;

                updatedColumns = [...prevBoard.columns, newColumn];
            }

            return {
                ...prevBoard,
                columns: updatedColumns,
                columnOrderIds: updatedColumns.map((col) => col.id), // 🔥 Luôn cập nhật `columnOrderIds`
            };
        });
    };
    // Sử dụng useMemo để tối ưu hóa việc truyền giá trị context
    const values = useMemo(
        () => ({ board, updateBoard, updateColumns }),
        [board]
    );

    // Hiển thị loading nếu đang tải dữ liệu
    if (isLoading) {
        return <div>Loading...</div>;
    }

    // Hiển thị lỗi nếu có
    if (error) {
        return <div>Error: {error.message}</div>;
    }

    // Trả về context provider
    return <BoardContext.Provider value={values}>{children}</BoardContext.Provider>;
};

export default BoardProvider;
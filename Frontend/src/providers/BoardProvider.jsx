// BoardProvider.js
import React, {useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { useLists } from "../hooks/useList";
import BoardContext from "../contexts/BoardContext";

const BoardProvider = ({ children }) => {
    const { boardId } = useParams();
    const { data: board } = useLists(boardId);  

    const [lists, setLists] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLists = async () => {
          const { data, error } = await getListByBoardId(boardId);
    
          if (error) setError(error);
          else setLists(data);
        };
    
        fetchLists();
      }, [boardId]);
    
      // Xử lý lỗi chuyển hướng hoặc thông báo
      if (error === "no_access") return <Navigate to="/NotFoundPage" />;
      if (error === "not_found") return <Navigate to="/NotFoundPage" />;
      if (error === "unknown_error") return <div>Lỗi không xác định!</div>;

    // Sử dụng useMemo để tránh tạo object mới không cần thiết
    const values = useMemo(() => ({ board }), [board]);

    return <BoardContext.Provider value={values}>{children}</BoardContext.Provider>;
};

export default BoardProvider;
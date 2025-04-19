import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import WorkspaceContext from "../contexts/WorkspaceContext";
import { useGetWorkspaces } from "../hooks/useWorkspace";
import { useGetBoardByID } from "../hooks/useBoard";

const WorkspaceProvider = ({ children }) => {
    const { workspaceId, boardId } = useParams();
    const { data: workspaces, isLoading: isLoadingWorkspaces, error } = useGetWorkspaces();
    const { data: board, isLoading: isLoadingBoard } = useGetBoardByID(boardId);

    const [currentWorkspace, setCurrentWorkspace] = useState(null);

    useEffect(() => {
        if (isLoadingWorkspaces || isLoadingBoard) return; // Chờ dữ liệu load xong
        if (!workspaces) return;

        let foundWorkspace = null;

        if (workspaceId) {
            foundWorkspace = workspaces.find((ws) => ws.id === workspaceId);
        } else if (boardId && board) {
            foundWorkspace = workspaces.find((ws) => ws.id === board?.workspace_id); // Kiểm tra API đúng key chưa
        }

        setCurrentWorkspace(foundWorkspace || null);
    }, [workspaceId, boardId, workspaces, board, isLoadingWorkspaces, isLoadingBoard]);

    return (
        <WorkspaceContext.Provider value={{ currentWorkspace, isLoading: isLoadingWorkspaces || isLoadingBoard, error }}>
            {children}
        </WorkspaceContext.Provider>
    );
};

export default WorkspaceProvider;

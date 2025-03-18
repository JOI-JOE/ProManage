import React from "react";
import HomeWorkspace from "./home";
import { useParams } from "react-router-dom";
import { useGetWorkspaceByName } from "../../hooks/useWorkspace";
import { useGetWorkspaceByName } from "../../hooks/useWorkspace";

const Workspaces = () => {
    const { workspaceName } = useParams();

    const {
        data: workspace,
        isLoading,
        isError,
        error,
    } = useGetWorkspaceByName(workspaceName);

    console.log("workspace", workspace);

    // Xử lý lỗi
    if (isErrorWorkspace) {
        return <div>Lỗi: {errorWorkspace?.message || errorBoards?.message}</div>;
    }

    // Kiểm tra nếu không tìm thấy workspace
    if (!workspace) {
        return <div>Không tìm thấy workspace.</div>;
    }

    // Render component HomeWorkspace với dữ liệu workspace
    return (
        <>
            <HomeWorkspace workspace={workspace} />
        </>
    );
};

export default Workspaces;
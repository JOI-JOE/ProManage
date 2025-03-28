import React from "react";
import HomeWorkspace from "./home";
import { useParams } from "react-router-dom";
import { useGetWorkspaceByName } from "../../hooks/useWorkspace";

const Workspaces = () => {
    const { workspaceName } = useParams();

    // Lấy thông tin workspace
    const {
        data: workspace,
        isLoading: isLoadingWorkspace,
        isError: isErrorWorkspace,
        error: errorWorkspace,
    } = useGetWorkspaceByName(workspaceName);

    console.log("workspace", workspace);

    // Xử lý lỗi
    if (isErrorWorkspace) {
        return <div>Lỗi: {errorWorkspace?.message || errorBoards?.message}</div>;
    }

    // Kiểm tra nếu không tìm thấy workspace
    if (!workspace) {
        return <div>Đang tải thông tin....</div>;
    }

    // Render HomeWorkspace với dữ liệu workspace và danh sách bảng được đánh dấu
    return (
        <>
            <HomeWorkspace workspace={workspace} markedBoards={workspace.markedBoards} />
        </>
    );
};

export default Workspaces;

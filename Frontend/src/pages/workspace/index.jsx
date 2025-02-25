import React from "react";
import HomeWorkspace from "./home";
import { useParams } from "react-router-dom";
import { useGetWorkspaceByName } from "../../hooks/useWorkspace";

const Workspaces = () => {
    const { workspaceName } = useParams();

    const {
        data: workspace,
        isLoading,
        isError,
        error,
    } = useGetWorkspaceByName(workspaceName);

    console.log(workspace);


    if (isLoading) {
        return <div>Đang tải thông tin workspace...</div>;
    }

    // Hiển thị lỗi nếu có lỗi xảy ra
    if (isError) {
        return <div>Lỗi: {error.message}</div>;
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
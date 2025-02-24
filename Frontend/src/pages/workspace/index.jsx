import React from "react";
import HomeWorkspace from "./home";
import { useParams } from "react-router-dom";
import { useGetWorkspaceByName } from "../../hooks/useWorkspace";

const Workspaces = () => {
    const { name } = useParams(); // Lấy displayName từ URL

    // Sử dụng hook useGetWorkspaceByDisplayName để fetch dữ liệu từ API
    const {
        data: workspace,
        isLoading,
        isError,
        error,
    } = useGetWorkspaceByName(name);

    // Hiển thị loading nếu đang fetch dữ liệu
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
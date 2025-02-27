import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAcceptInvitation } from "../../../hooks/useWorkspaceInvite";

const InviteAccept = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { workspace, inviteToken } = location.state || {};

    // Sử dụng hook useAcceptInvitation
    const { mutate: acceptInvitation, isLoading, isError, error } = useAcceptInvitation();

    useEffect(() => {
        if (!workspace) {
            // Nếu không có state, chuyển hướng về trang chính
            navigate("/");
        }
    }, [workspace, navigate]);

    if (!workspace) {
        return null; // Tránh render UI nếu không có dữ liệu
    }

    // Lấy token từ localStorage
    const token = localStorage.getItem('token');

    // Nếu không có token, hiển thị thông báo yêu cầu đăng nhập
    if (!token) {
        return (
            <div>
                <h1>Chào mừng bạn đến với nhóm {workspace.name}</h1>
                <p>Bạn cần đăng nhập để tham gia vào workspace này.</p>
                <Link
                    to="/login"
                    style={{
                        display: "inline-block",
                        padding: "10px 20px",
                        fontSize: "16px",
                        backgroundColor: "#007bff",
                        color: "#fff",
                        textDecoration: "none",
                        borderRadius: "5px",
                        marginTop: "10px"
                    }}
                >
                    Đăng nhập
                </Link>
            </div>
        );
    }

    // Xử lý khi người dùng nhấn nút "Tham gia"
    const handleJoinWorkspace = () => {
        acceptInvitation(
            { workspaceId: workspace.id, inviteToken: inviteToken },
            {
                onSuccess: () => {
                    // Chuyển hướng đến trang workspace sau khi tham gia thành công
                    navigate(`/w/${workspace.name}`);
                },
                onError: (error) => {
                    console.error("Lỗi khi tham gia workspace:", error);
                },
            }
        );
    };

    return (
        <div>
            <h1>Chào mừng bạn đến với nhóm {workspace.name}</h1>
            <button
                onClick={handleJoinWorkspace}
                disabled={isLoading}
                style={{
                    display: "inline-block",
                    padding: "10px 20px",
                    fontSize: "16px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    textDecoration: "none",
                    borderRadius: "5px",
                    marginTop: "10px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                }}
            >
                {isLoading ? "Đang xử lý..." : "Tham gia"}
            </button>
            {isError && <div style={{ color: "red", marginTop: "10px" }}>Lỗi: {error.message}</div>}
        </div>
    );
};

export default InviteAccept;
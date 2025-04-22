import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";

const InviteHandling = () => {
    const { inviteToken, workspaceId } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        if (inviteToken && workspaceId) {
            // Tạo chuỗi mời và mã hóa dấu `/` thành `%3A`
            const invitationData = encodeURIComponent(`workspace:${workspaceId}:${inviteToken}`);
            // Lưu vào cookie (7 ngày)
            Cookies.set("invitation", invitationData, { expires: 7, path: "/" });
        }

        // Điều hướng đến accept-team
        navigate("/invite/accept-team");
    }, [workspaceId, inviteToken, navigate]);
    

    return null;
};

export default InviteHandling;

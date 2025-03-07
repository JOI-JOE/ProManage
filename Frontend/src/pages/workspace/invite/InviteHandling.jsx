import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const InviteHandling = () => { // Nhận redirectPath làm tham số
    const { inviteToken, workspaceId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        navigate("/invite/accept-team", {
            state: { workspaceId, inviteToken },
        });
    }, [workspaceId, inviteToken, navigate]);

    return null; // Không render gì cả, chỉ chuyển hướng
};

export default InviteHandling;

import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const InviteHandle = () => {
    const { inviteToken, workspaceId } = useParams();
    const navigate = useNavigate();

    const { data: workspace, isLoading, isError } = useQuery({
        queryKey: ["validateInvite", workspaceId, inviteToken],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/workspaces/${workspaceId}/validate-invite/${inviteToken}`
            );
            return response.data;
        },
        enabled: !!workspaceId && !!inviteToken,
        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
        if (!isLoading) {
            if (isError || !workspace) {
                return;
            }
            // Chuyển hướng và truyền cả workspace + inviteToken
            navigate("/invite/accept-team", { state: { workspace, inviteToken } });
        }
    }, [isLoading, isError, workspace, inviteToken, navigate]);

    if (isLoading) return <div>Loading...</div>;

    if (isError || !workspace) {
        return (
            <div>
                <h2>Bạn không thể tham gia Không gian làm việc này</h2>
                <p>
                    Liên kết mời có thể đã bị tắt hoặc Không gian làm việc miễn phí này có thể đã đạt đến giới hạn 10 người cộng tác.
                    Hãy thử liên hệ với người đã gửi liên kết cho bạn để biết thêm thông tin.
                </p>
            </div>
        );
    }

    return null;
};

export default InviteHandle;

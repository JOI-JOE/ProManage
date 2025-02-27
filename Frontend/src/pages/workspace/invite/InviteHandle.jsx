import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import InviteWithToken from "./child/InviteWithToken";
import InviteWithoutToken from "./child/InviteWithoutToken";

const InviteHandle = () => {
    const { inviteToken, workspaceId } = useParams();

    const { data: workspace, isLoading, isError } = useQuery({
        queryKey: ["validateInvite", workspaceId, inviteToken],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/workspaces/${workspaceId}/validate-invite/${inviteToken}`
            );
            return response.data;
        },
        enabled: !!workspaceId && !!inviteToken, // Chỉ fetch nếu có đủ params
        staleTime: 1000 * 60 * 5, // Cache trong 5 phút
    });

    if (isLoading) return <div>Loading...</div>;
    if (isError || !workspace) return <div>Error validating invitation</div>;

    console.log(workspace);

    return (
        <div>
            {inviteToken ? <InviteWithToken data={workspace} /> : <InviteWithoutToken />}
        </div>
    );
};

export default InviteHandle;

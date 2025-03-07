import React from "react";
import { useLocation } from "react-router-dom";

const InviteWithoutToken = () => {
    const location = useLocation();
    const { workspaceId, inviteToken } = location.state || {};
    return (
        <div>
            <h1>Invite Accept Team</h1>
            <p>Workspace ID: {workspaceId}</p>
            <p>Invite Token: {inviteToken}</p>
        </div>
    );
};

export default InviteWithoutToken;
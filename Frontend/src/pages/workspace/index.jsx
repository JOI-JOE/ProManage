import React, { useMemo } from "react";
import HomeWorkspace from "./home";
import { useParams } from "react-router-dom";
import { useWorkspace } from "../../contexts/WorkspaceContext";

const Workspaces = () => {
    const { workspaceName } = useParams();
    const { data } = useWorkspace()
    const selectedWorkspace = useMemo(() => {
        return data?.workspaces?.find((ws) => ws.name === workspaceName) || null;
    }, [data, workspaceName]);

    return (
        <>
            <HomeWorkspace workspace={selectedWorkspace} />
        </>
    );
};

export default Workspaces;

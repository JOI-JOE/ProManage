import React from "react";
import HomeWorkspace from "./home";
import { useParams } from "react-router-dom";
import { useGetWorkspaceById } from "../../hooks/useWorkspace";

const Workspaces = () => {
    const { workspaceId } = useParams();

    const {
        data: workspace,
        isLoading: isLoadingWorkspace,
        isError: isWorkspaceError,
        error: workspaceError,
        refetch: refetchWorkspace,
    } = useGetWorkspaceById(workspaceId, {
        enabled: !!workspaceId,
    });
    return (
        <>
            <HomeWorkspace workspace={workspace} refetchWorkspace={refetchWorkspace} />
        </>
    );
};

export default Workspaces;

import { createContext, useContext, useMemo } from "react";
import { useGetWorkspaces } from "../hooks/useWorkspace";

const WorkspaceContext = createContext({
    workspaces: [],
    guestWorkspaces: [],
    boards: [],
    isLoading: true,
    error: null,
});

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (!context) {
        throw new Error("useWorkspace must be used within a WorkspaceProvider");
    }
    return context;
};

export const WorkspaceProvider = ({ children }) => {
    const { data, isLoading, error } = useGetWorkspaces();

    const workspaces = data?.workspaces || [];
    const guestWorkspaces = data?.guestWorkspaces || [];

    const contextValue = useMemo(() => ({
        workspaces,
        guestWorkspaces,
        isLoading,
        error,
    }), [workspaces, guestWorkspaces, isLoading, error]);

    return (
        <WorkspaceContext.Provider value={contextValue}>
            {children}
        </WorkspaceContext.Provider>
    );
};

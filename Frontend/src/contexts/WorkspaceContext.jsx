import { createContext, useContext, useMemo } from "react";
import { useGetWorkspaces } from "../hooks/useWorkspace";

const WorkspaceContext = createContext({
    workspaces: null,
    boards: null,
    isLoading: true,
    error: null,
});

export const useWorkspace = () => useContext(WorkspaceContext);

export const WorkspaceProvider = ({ children }) => {
    const { data, isLoading, error } = useGetWorkspaces();

    const contextValue = useMemo(() => ({
        data,
        guestWorkspace: data?.guestWorkspaces || null,
        isLoading,
        error,
    }), [data, isLoading, error]);

    return (
        <WorkspaceContext.Provider value={contextValue}>
            {children}
        </WorkspaceContext.Provider>
    );
};

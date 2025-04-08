import { createContext, useContext, useMemo } from "react";
import { useGetWorkspaces } from "../hooks/useWorkspace";
import { useMe } from "./MeContext";

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

    // Chỉ fetch workspaces khi user đã loaded và có workspaceIds
    const { data, isLoading, error } = useGetWorkspaces();

    // Chuẩn hóa dữ liệu với giá trị mặc định là mảng rỗng
    const workspaces = data?.workspaces || [];
    const guestWorkspaces = data?.guestWorkspaces || [];
    const boards = data?.boards || [];

    const contextValue = useMemo(() => ({
        workspaces,
        guestWorkspaces,
        boards,
        isLoading,
        error,
    }), [workspaces, guestWorkspaces, boards, isLoading, error]);

    return (
        <WorkspaceContext.Provider value={contextValue}>
            {children}
        </WorkspaceContext.Provider>
    );
};
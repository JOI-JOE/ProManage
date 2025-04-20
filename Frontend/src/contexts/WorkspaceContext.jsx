import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useGetWorkspaces } from "../hooks/useWorkspace";
import { useParams } from "react-router-dom";

const WorkspaceContext = createContext({
  data: null,
  isLoading: true,
  error: null,
  updateWorkspaceInfo: () => { }, // Add update function in context
});

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};

export const WorkspaceProvider = ({ children }) => {
  const { boardId, workspaceId } = useParams();
  const { data, isLoading, error } = useGetWorkspaces();
  const [workspaces, setWorkspaces] = useState([]); // Initialize as empty array

  // Update workspace data when `workspaceId` changes
  useEffect(() => {
    if (data && data.length > 0) {
      const currentWorkspace = data.find(workspace => workspace?.id === workspaceId);
      if (currentWorkspace) {
        setWorkspaces(prevWorkspaces => {
          // If prevWorkspaces is empty, initialize with the current workspace
          if (!prevWorkspaces.length) {
            return [currentWorkspace];
          }
          // Otherwise, update the matching workspace
          return prevWorkspaces.map(workspace =>
            workspace?.id === currentWorkspace.id ? currentWorkspace : workspace
          );
        });
      }
    }
  }, [workspaceId, data]);


  const contextValue = useMemo(
    () => ({
      data,
      isLoading,
      error,
    }),
    [data, isLoading, error]
  );

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};
import React, { useMemo } from "react";
import { Box, Container } from "@mui/material";
import { Outlet, useParams } from "react-router-dom";
import AppBar from "../../../components/Navigation/AppBar";
import SideBar from "./SideBar";
import { useGetBoardByID } from "../../../hooks/useBoard";
import { useGetWorkspaceById, useGetWorkspaceByName } from "../../../hooks/useWorkspace";

const BoardDetail = () => {
  const { boardId, workspaceName } = useParams();

  // Fetch board data
  const { data: board, isLoading: boardLoading, error: boardError } = useGetBoardByID(boardId);
  const workspaceId = useMemo(() => board?.workspace_id, [board]);

  // Fetch workspace data
  const {
    data: workspace = workspaceName ? undefined : {},
    isLoading: workspaceLoading,
    error: workspaceError
  } = workspaceId
      ? useGetWorkspaceById(workspaceId, { enabled: !!workspaceId })
      : useGetWorkspaceByName(workspaceName, { enabled: !!workspaceName });

  // Handle loading and errors
  if (boardLoading || workspaceLoading) return <p>Loading...</p>;
  if (boardError || workspaceError) return <p>Error: {boardError?.message || workspaceError?.message}</p>;

  return (
    <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
      <AppBar workspace={workspace} />
      <Box sx={{ display: "flex" }}>
        <SideBar workspace={workspace} />
        <Box sx={{ width: "81%" }}>
          <Outlet />
        </Box>
      </Box>
    </Container>
  );
};

export default BoardDetail;

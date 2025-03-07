import React, { useMemo } from "react";
import { Box, Container } from "@mui/material";
import AppBar from "../../../components/Navigation/AppBar";
import SideBar from "./SideBar";
import { Outlet, useParams } from "react-router-dom";
import { useGetBoardByID } from "../../../hooks/useBoard";
import { useGetWorkspaceById, useGetWorkspaceByName } from "../../../hooks/useWorkspace";

const BoardDetail = () => {
  const { boardId, workspaceName } = useParams();

  // Fetch dữ liệu board
  const {
    data: board,
    isLoading: boardLoading,
    error: boardError,
  } = useGetBoardByID(boardId);

  // Lấy workspaceId từ board (nếu có)
  const workspaceId = useMemo(() => board?.workspace_id, [board]);

  // Fetch dữ liệu workspace dựa trên workspaceId hoặc workspaceName
  const {
    data: workspaceById,
    isLoading: workspaceLoadingById,
    error: workspaceErrorById,
  } = useGetWorkspaceById(workspaceId, {
    enabled: !!workspaceId, // Chỉ fetch khi có workspaceId
  });

  const {
    data: workspaceByName,
    isLoading: workspaceLoadingByName,
    error: workspaceErrorByName,
  } = useGetWorkspaceByName(workspaceName, {
    enabled: !workspaceId && !!workspaceName, // Chỉ fetch nếu không có workspaceId
  });

  // Chọn workspace từ kết quả hợp lệ
  const workspace = workspaceById || workspaceByName;
  const workspaceLoading = workspaceLoadingById || workspaceLoadingByName;
  const workspaceError = workspaceErrorById || workspaceErrorByName;

  // Xử lý loading và lỗi
  if (boardLoading || workspaceLoading) {
    return <p>Loading...</p>;
  }
  if (boardError || workspaceError) {
    return <p>Error: {boardError?.message || workspaceError?.message}</p>;
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
      <AppBar workspace={workspace} />
      <Box sx={{ display: "flex" }}>
        <SideBar workspace={workspace || {}} />
        <Box sx={{ width: "81%" }}>
          <Outlet />
        </Box>
      </Box>
    </Container>
  );
};

export default BoardDetail;

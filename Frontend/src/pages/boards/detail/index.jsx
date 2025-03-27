import React, { useEffect, useMemo, useState } from "react";
import { Box, Container } from "@mui/material";
import { Outlet, useLocation, useParams } from "react-router-dom";
import SideBar from "./SideBar";
import BoardProvider from "../../../providers/BoardProvider";
import { useWorkspace } from "../../../contexts/WorkspaceContext";

const BoardDetail = () => {
  const { data } = useWorkspace();
  const location = useLocation();
  const workspaceId = location.state?.workspaceId;

  const foundWorkspace = data.workspaces.find((ws) =>
    ws.id == workspaceId
  )

  return (
    <Container disableGutters maxWidth={false}>
      <Box sx={{ display: "flex" }}>
        {/* Truyền workspace vào SideBar */}
        <SideBar workspace={foundWorkspace} />
        <Box sx={{ width: "81%" }}>
          <BoardProvider>
            <Outlet />
          </BoardProvider>
        </Box>
      </Box>
    </Container>
  );
};

export default BoardDetail;

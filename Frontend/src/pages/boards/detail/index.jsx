import React, { useMemo } from "react";
import { Box, Container } from "@mui/material";
import { Outlet, useParams } from "react-router-dom";
import AppBar from "../../../components/Navigation/AppBar";
import SideBar from "./SideBar";
import WorkspaceProvider from "../../../providers/WorkspaceProvider";
import BoardProvider from "../../../providers/BoardProvider";

const BoardDetail = () => {
  return (
    <WorkspaceProvider>
      <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
        <Box sx={{ display: "flex" }}>
          <SideBar />
          <Box sx={{ width: "81%" }}>
            <BoardProvider>
              <Outlet />
            </BoardProvider>
          </Box>
        </Box>
      </Container>
    </WorkspaceProvider>
  );
};

export default BoardDetail;

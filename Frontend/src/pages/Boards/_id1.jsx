// import React from "react";

import { Box, Container } from "@mui/material";

import WorkspaceConten from "./WorkspaceConten/WorkspaceConten";
import AppBar from "~/components/AppBar/AppBar";
import SideBar from "./SideBar/SideBar";

const Board1 = () => {
  return (
    <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
      <AppBar />
      <Box sx={{ display: "flex" }}>
        <SideBar />
        <Box sx={{ width: "81%" }}>
          <WorkspaceConten />
        </Box>
      </Box>
    </Container>
  );
};

export default Board1;

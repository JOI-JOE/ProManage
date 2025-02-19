// import React from "react";

import { Box, Container } from "@mui/material";

import WorkspaceConten from "./WorkspaceConten/WorkspaceConten";
import AppBar from "~/components/AppBar/AppBar";
import SideBar1 from "./SideBar1/SideBar1";

const Board1 = () => {

  return (
    <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
      <AppBar />
      <Box sx={{ display: "flex" }}>
        <SideBar1 />
        <Box sx={{ width: "81%" }}>
          <WorkspaceConten />
        </Box>
      </Box>
    </Container>
  );
};

export default Board1;

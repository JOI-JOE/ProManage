// import React from "react";

import { Box, Container } from "@mui/material";

import ListWorkspaceConten from "./ListWorkspaceConten/ListWorkspaceConten";
import AppBar from "~/components/AppBar/AppBar";

import FormConten from "./FormConten/FormConten";
import SideBar1 from "./SideBar1/SideBar1";

const Board3 = () => {
  return (
    <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
      <AppBar />
      <Box sx={{ display: "flex" }}>
        <SideBar1 />
        <Box sx={{ width: "81%" }}>
          <FormConten />
        </Box>
      </Box>
    </Container>
  );
};

export default Board3;

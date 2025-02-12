// import React from "react";

import { Box, Container } from "@mui/material";

import ListWorkspaceConten from "./ListWorkspaceConten/ListWorkspaceConten";
import AppBar from "~/components/AppBar/AppBar";
import SideBar from "./SideBar/SideBar";
import FormConten from "./FormConten/FormConten";

const Board3 = () => {
  return (
    <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
      <AppBar />
      <Box sx={{ display: "flex" }}>
        <SideBar />
        <Box sx={{ width: "81%" }}>
          <FormConten />
        </Box>
      </Box>
    </Container>
  );
};

export default Board3;

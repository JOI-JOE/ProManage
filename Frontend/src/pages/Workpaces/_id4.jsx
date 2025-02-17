// import React from "react";

import { Box, Container } from "@mui/material";
import AppBar from "~/components/AppBar/AppBar";
import SideBar1 from "./SideBar1/SideBar1";
import MemberConten from "./MemberConten/MemberConten";
import SideBar2 from "./SideBar2/SideBar2";

const Board4 = () => {
  return (
    <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
      <AppBar />
      <Box sx={{ display: "flex" }}>
        <SideBar2 />
        <Box sx={{ width: "81%" }}>
          <MemberConten />
        </Box>
      </Box>
    </Container>
  );
};

export default Board4;

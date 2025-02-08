// import React from "react";

import { Box, Container } from "@mui/material";
import BoardBar from "./BoardBar/BoardBar";
import BoardContent from "./BoardConten/BoardContent";
import AppBar from "~/components/AppBar/AppBar";
import SideBar from "./SideBar/SideBar";

const Board = () => {
  return (
    <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
      <AppBar />
      <Box sx={{ display: "flex" }}>
        <SideBar />
        <Box sx={{ width: "81%" }}>
          <BoardBar />
          <BoardContent />
        </Box>
      </Box>
    </Container>
  );
};

export default Board;

// import React from "react";

import { Box, Container } from "@mui/material";
import BoardBar from "./BoardBar/BoardBar";
import BoardContent from "./BoardConten/BoardContent";
import AppBar from "~/components/AppBar/AppBar";
import SideBar from "./SideBar/SideBar";
import { mockData } from "../../Apis/Api_fake";

const Board = () => {
  return (
    <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
      <AppBar />
      <Box sx={{ display: "flex" }}>
        <SideBar />
        <Box sx={{ width: "81%" }}>
          <BoardBar board={mockData?.board} />
          <BoardContent board={mockData?.board} />
        </Box>
      </Box>
    </Container>
  );
};

export default Board;

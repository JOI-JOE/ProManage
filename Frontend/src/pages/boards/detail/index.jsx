import React from "react";
import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import { BoardProvider } from "../../../contexts/BoardContext";

const BoardDetail = () => {

  return (
    <Container disableGutters maxWidth={false}>
      <Box sx={{ display: "flex" }}>
        <BoardProvider>
          <SideBar />
          <Box sx={{ width: "81%" }}>
            <Outlet />
          </Box>
        </BoardProvider>
      </Box>
    </Container >
  );
};

export default BoardDetail;

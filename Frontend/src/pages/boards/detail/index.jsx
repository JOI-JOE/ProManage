import React from "react";
import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import { BoardProvider } from "../../../contexts/BoardContext";
import { ListProvider } from "../../../contexts/ListContext";

const BoardDetail = () => {

  return (
    <Container disableGutters maxWidth={false}>
      <Box sx={{ display: "flex" }}>
        <BoardProvider>
          <SideBar />
          <ListProvider>
            <Box sx={{ width: "81%" }}>
              <Outlet />
            </Box>
          </ListProvider>
        </BoardProvider>
      </Box>
    </Container >
  );
};

export default BoardDetail;

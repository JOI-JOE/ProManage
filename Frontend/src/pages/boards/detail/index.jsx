import React, { useMemo } from "react";
import { Box, Container } from "@mui/material";
import { Outlet, useParams } from "react-router-dom";
import SideBar from "./SideBar";
import BoardProvider from "../../../providers/BoardProvider";

const BoardDetail = () => {
  return (
    <Container disableGutters maxWidth={false}>
      <Box sx={{ display: "flex" }}>
        <SideBar />
        <Box sx={{ width: "81%" }}>
          <BoardProvider>
            <Outlet />
          </BoardProvider>
        </Box>
      </Box>
    </Container>
  );
};

export default BoardDetail;
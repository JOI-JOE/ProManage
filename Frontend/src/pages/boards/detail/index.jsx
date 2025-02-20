import React from "react";
import { Box, Container } from "@mui/material";
import AppBar from "../../../components/Navigation/AppBar";
import SideBar from "./SideBar";
// import { Outlet } from "react-router-dom";
import BoardBar from "./BoardBar";
import BoardContent from "./BoardContent";
import { mockData } from "../../../api/Api_fake";

const BoardDetail = () => {
  return (
    <>
      <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
        <AppBar />
        <Box sx={{ display: "flex" }}>
          <SideBar />
          <Box sx={{ width: "81%" }}>
            <BoardBar />
            <BoardContent board={mockData?.board} />
            {/* <Outlet /> */}
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default BoardDetail;

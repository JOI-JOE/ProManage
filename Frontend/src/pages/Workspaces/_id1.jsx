// import React from "react";

import { Box, Container } from "@mui/material";

import WorkspaceConten from "./WorkspaceConten/WorkspaceConten";
import AppBar from "~/components/AppBar/AppBar";
import SideBar1 from "./SideBar1/SideBar1";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";



const Board1 = () => {

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (token) {
  //     try {
  //       // const decodedToken = jwtDecode(token); // Giải mã token
  //       console.log("Decoded Token:", token); // In ra token đã giải mã
  //       // setUserId(decodedToken.id); // Lấy id từ payload của token và lưu vào state
  //     } catch (error) {
  //       console.error("Lỗi giải mã token:", error);
  //     }
  //   }
  // }, []);


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

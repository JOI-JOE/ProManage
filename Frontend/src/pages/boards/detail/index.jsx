import React, { useEffect } from "react";
import { Box, Container } from "@mui/material";
import { Outlet, useParams } from "react-router-dom";
import SideBar from "./SideBar";
import { BoardProvider, useBoard } from "../../../contexts/BoardContext";

// Component này nằm bên trong BoardProvider
const BoardLayout = () => {
  const { board, setCurrentBoard } = useBoard();
  const { boardId, boardName } = useParams(); // Lấy boardId và boardName từ URL

  useEffect(() => {
    if (boardId && boardName) {
      setCurrentBoard({ id: boardId, name: boardName });
    }
  }, [boardId, boardName, setCurrentBoard]);

  return (
    <Box
      sx={{
        backgroundImage: `url(${board?.logo || "https://images.unsplash.com/photo-1738249034651-1896f689be58?q=80&w=1974&auto=format&fit=crop"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Box sx={{ display: "flex" }}>
        <SideBar />
        <Box sx={{ width: "85%" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

// Bọc toàn bộ layout bằng Provider
const BoardDetail = () => {
  return (
    <Container disableGutters maxWidth={false}>
      <BoardProvider>
        <BoardLayout />
      </BoardProvider>
    </Container>
  );
};

export default BoardDetail;

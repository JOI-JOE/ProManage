import React, { useMemo } from "react";
import { Box, Container } from "@mui/material";
import { Outlet, useParams } from "react-router-dom";
import SideBar from "./SideBar";
import BoardProvider from "../../../providers/BoardProvider";

const BoardDetail = () => {
  const { boardId } = useParams(); // Lấy boardId từ URL
  const { data } = useWorkspace(); // Lấy danh sách workspaces từ API

  // Tìm workspace chứa board hiện tại
  const currentWorkspace = useMemo(() => {
    return data?.workspaces?.find((ws) =>
      ws.boards.some((board) => board.id === boardId)
    );
  }, [boardId, data]);

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
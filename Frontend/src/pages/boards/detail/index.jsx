import React, { useMemo } from "react";
import { Box, Container, Typography, Card, CardContent, Avatar, Stack } from "@mui/material";
import { Outlet, useParams } from "react-router-dom";
import AppBar from "../../../components/Navigation/AppBar";
import SideBar from "./SideBar";
import WorkspaceProvider from "../../../providers/WorkspaceProvider";
import BoardProvider from "../../../providers/BoardProvider";
import { useGetBoardByID, useToggleBoardClosed } from "../../../hooks/useBoard";
import { useGetBoardMembers } from "../../../hooks/useInviteBoard";
import { useUser } from "../../../hooks/useUser";

const BoardDetail = () => {
  const { boardId } = useParams();
  const { data: board, isLoading } = useGetBoardByID(boardId);
  const { mutate: toggleBoardClosed } = useToggleBoardClosed(); // Use hook

  const { data: boardMembers = [] } = useGetBoardMembers(boardId);
  const { data: user } = useUser();



  const currentUserId = user?.id;
  // console.log(boardMembers);

  const isMember = Array.isArray(boardMembers?.data)
    ? boardMembers.data.some(member =>
      member.id === currentUserId && member.pivot.role === "member"
    )
    : false;

  // Lấy danh sách admin
  const adminList = boardMembers?.data?.filter(member => member.pivot.role === "admin");


  const handleReopenBoard = () => {
    toggleBoardClosed(boardId); // Gọi API khi mở lại bảng
  };


  // console.log(board);
  return (
    <WorkspaceProvider>
      <Container disableGutters maxWidth={false}>
        <Box sx={{ display: "flex", position: "relative" }}>
          <SideBar />
          <Box sx={{ width: "81%", position: "relative" }}>
            <BoardProvider>
              {board?.closed == 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#fff",
                    fontSize: "20px",
                    fontWeight: "bold",
                    zIndex: 10,
                    backdropFilter: "blur(4px)",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
                    textAlign: "center",
                    p: 2,
                  }}
                >
                  {isMember ? (
                    <>
                      <Card sx={{ width: "500px", p: 2, borderRadius: 2, textAlign: "center" }}>
                        <CardContent>
                          <Typography variant="h6" fontWeight="bold">
                            Bảng {board?.name} đã được đóng lại.
                          </Typography>
                          <Typography sx={{ mt: 1, mb: 2 }}>
                            Để mở lại bảng này, hãy liên hệ với một trong các quản trị viên sau:
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center", // Căn giữa cả danh sách
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <ul style={{ padding: 0, listStyleType: "none" }}>
                              {adminList.length > 0 ? (
                                adminList.map((admin, index) => (
                                  <li key={index} style={{ marginBottom: "10px" }}>
                                    <Stack
                                      direction="row"
                                      spacing={2}
                                      alignItems="center"
                                      sx={{ justifyContent: "flex-start" }} // Thẳng hàng bên trái nhưng giữ trong khối giữa
                                    >
                                      <Avatar sx={{ bgcolor: "#3182ce" }}>
                                        {admin.full_name.charAt(0).toUpperCase()}
                                      </Avatar>
                                      <Typography sx={{ fontSize: "16px", fontWeight: 500 }}>
                                        {admin.full_name}
                                      </Typography>
                                    </Stack>
                                  </li>
                                ))
                              ) : (
                                <li>
                                  <Typography>Không có quản trị viên nào.</Typography>
                                </li>
                              )}
                            </ul>
                          </Box>



                        </CardContent>
                      </Card>
                    </>
                  ) : (

                    <>
                      {/* <span style={{ fontSize: "24px" }}>🔒</span> */}
                      <Typography>
                      🔒 Bảng thông tin này đã đóng. Mở lại bảng thông tin để thực hiện thay đổi.{" "}
                        <span
                          style={{
                            fontWeight: "bold",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          onClick={handleReopenBoard}
                        >
                          Mở lại bảng
                        </span>
                      </Typography>
                    </>
                  )}
                </Box>
              )}
              <Outlet />
            </BoardProvider>
          </Box>
        </Box>
      </Container>
    </WorkspaceProvider>
  );
};

export default BoardDetail;

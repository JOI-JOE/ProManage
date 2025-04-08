import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  DialogActions,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
} from "@mui/material";
import { Restore, Delete, Archive } from "@mui/icons-material";
import MyWorkspace from "../../../components/MyWorkspace";
import { useClosedBoards, useToggleBoardClosed } from "../../../hooks/useBoard";
import { useSelector } from "react-redux";
import MyStar from "../../../components/MyStar";
import { useWorkspace } from "../../../contexts/WorkspaceContext";
import MyBoard from "../../../components/MyBoard";

const HomeBoard = ({ workspaces }) => {
  const starredBoards = useSelector((state) => state.starredBoards.starred);
  const listStar = starredBoards?.board_stars || [];  // Sử dụng mảng rỗng nếu không có dữ liệu

const { guestWorkspace } = useWorkspace()

  // const { data: closedBoards, isLoading: loadingClosed } = useClosedBoards();
  // const [openClosedBoards, setOpenClosedBoards] = useState(false);
  // const { mutate: toggleBoardClosed } = useToggleBoardClosed();

  // const handleOpenClosedBoards = () => setOpenClosedBoards(true);
  // const handleCloseClosedBoards = () => setOpenClosedBoards(false);

  // Hàm mở lại board
  // const handleReopenBoard = (boardId) => {
  //   toggleBoardClosed(boardId);
  // };

  // // Hàm xóa hoàn toàn board
  // const handleDeleteBoard = async (boardId) => {
  // };
  return (
    <Box
      sx={{
        width: "60%",
        padding: "20px",
        marginLeft: "auto",
        marginTop: "25px",
      }}
    >

      {listStar?.length > 0 ? (
        <Box
          sx={{
            marginBottom: "30px",
          }}
        >
          <Typography
            variant="h7"
            sx={{
              marginTop: "10px",
              marginBottom: "20px",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            BẢNG ĐÁNH DẤU SAO
          </Typography>
          <Box
            key="list_star"
            sx={{
              marginTop: "10px",
              display: "flex",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            {listStar?.map((star) => (
              <ListItem key={`star-${star.id || Math.random()}`} sx={{ width: "auto", padding: 0 }}>
                <MyStar star={star} />
              </ListItem>
            ))}
          </Box>
        </Box>
      ) : null}

      {/* Workspaces của bạn */}
      <Box id="my-workspace">
        <Typography
          variant="h7"
          sx={{
            marginTop: "50px",
            marginBottom: "10px",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        >
          CÁC KHÔNG GIAN LÀM VIỆC CỦA BẠN
        </Typography>
        <div id="myBoardInWorkspace">
          {workspaces?.length > 0 ? (
            workspaces.map((workspace) => (
              <MyWorkspace
                key={workspace.id} // Sử dụng id làm key để đảm bảo tính duy nhất
                workspace={workspace}
                boards={workspace.boards || []} // Đảm bảo boards luôn là mảng, tránh lỗi nếu boards là undefined
              />
            ))
          ) : (
            null
          )}
        </div>
      </Box>

      <Box id="guest-workspace">
        <Typography
          variant="h6" // Sử dụng h6 để tiêu đề nhỏ hơn và phù hợp hơn
          sx={{
            marginTop: "24px", // Giảm marginTop xuống 24px để khoảng cách hợp lý
            marginBottom: "8px", // Giữ marginBottom nhỏ để cách nội dung bên dưới
            fontWeight: "bold",
            textTransform: "uppercase",
            color: "#172B4D", // Màu chữ giống với giao diện trước đó
          }}
        >
          CÁC KHÔNG GIAN LÀM VIỆC KHÁCH
        </Typography>
        <div id="myGuestWorkspace">
          {guestWorkspace?.length > 0 ? (
            guestWorkspace.map((workspace) => (
              <div key={workspace.id} style={{ marginBottom: "20px" }}>
                {/* Hiển thị thông tin workspace */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                  {/* Hiển thị logo nếu có, nếu không thì dùng icon phù hợp */}
                  <img
                    src={workspace.logo}
                    alt="Workspace Logo"
                    style={{ width: 40, height: 40, borderRadius: "50%", marginRight: 10 }}
                  />

                  {/* Hiển thị tên workspace */}
                  <Typography fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
                    {workspace.display_name.length > 20
                      ? workspace.display_name.substring(0, 20) + "..."
                      : workspace.display_name}
                  </Typography>
                </div>

                {/* Hiển thị danh sách boards của workspace */}
                {workspace.boards?.length > 0 ? (
                  workspace.boards.map((board) => (
                    <ListItem sx={{ width: "auto", padding: 0 }} key={board.id}>
                      <MyBoard board={board} id={`guest-board-${board.id}`} />
                    </ListItem>
                  ))
                ) : (
                  null
                )}
              </div>
            ))
          ) : (
            null
          )}
        </div>
      </Box>
    </Box>
  );
};

export default HomeBoard;

{/* Nút xem tất cả bảng đã đóng */ }
//   <Button
//   variant="outlined"
//   sx={{
//     backgroundColor: "#EDEBFC",
//     height: "30px",
//     width: "250px",
//     marginTop: "40px",
//   }}
//   onClick={handleOpenClosedBoards}
//   startIcon={<Archive />}
// >
//   Xem tất cả các bảng đã đóng
// </Button>

{/* Popup hiển thị danh sách bảng đã đóng */ }
{/* <Dialog open={openClosedBoards} onClose={handleCloseClosedBoards} fullWidth>
  <DialogTitle fontWeight="bold">📌 Các bảng đã đóng</DialogTitle>
  <DialogContent>
    {loadingClosed ? (
      <CircularProgress />
    ) : closedBoards?.data?.length > 0 ? (
      <List>
        {closedBoards?.data?.map((board) => (
          <ListItem
            key={board.id}
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "8px 0",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#f4f4f4",
                borderRadius: "8px",
              },
            }}
          >
            <ListItemAvatar>
              <Avatar src={board.thumbnail || "https://via.placeholder.com/150"} />
            </ListItemAvatar>
            <ListItemText
              primary={board.name}
              secondary={`Không gian làm việc: ${board.workspace?.display_name || "Không rõ"}`}
            />
            <IconButton onClick={() => handleReopenBoard(board.id)} color="primary">
              <Restore />
            </IconButton>
            <IconButton onClick={() => handleDeleteBoard(board.id)} color="error">
              <Delete />
            </IconButton>
          </ListItem>
        ))}
      </List>
    ) : (
      <Typography variant="body2" color="textSecondary" >
        Không có bảng nào đã đóng!
      </Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseClosedBoards} color="primary">
      Đóng
    </Button>
  </DialogActions>
</Dialog> */}
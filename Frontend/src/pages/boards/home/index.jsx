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

const HomeBoard = ({ workspaces }) => {
  const starredBoards = useSelector((state) => state.starredBoards.starred);
  const listStar = starredBoards?.board_stars || [];  // Sử dụng mảng rỗng nếu không có dữ liệu
  
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
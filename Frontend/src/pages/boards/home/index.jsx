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
import { useGetWorkspaces } from "../../../hooks/useWorkspace";
import { useClosedBoards, useForceDestroyBoard, useToggleBoardClosed } from "../../../hooks/useBoard";

const HomeBoard = () => {
  const { data: workspaces, isLoading, isError } = useGetWorkspaces();

  const { data: closedBoards, isLoading: loadingClosed } = useClosedBoards();
  
  const [openClosedBoards, setOpenClosedBoards] = useState(false);

  const { mutate: toggleBoardClosed } = useToggleBoardClosed();

  const { mutate: destroyBoard, isPending: isDeleting } = useForceDestroyBoard();

  if (isLoading) return <p>Đang tải workspaces...</p>;
  if (isError) return <p>Lỗi khi tải workspaces!</p>;

  const handleOpenClosedBoards = () => setOpenClosedBoards(true);
  const handleCloseClosedBoards = () => setOpenClosedBoards(false);

  // Hàm mở lại board
  const handleReopenBoard = (boardId) => {
    toggleBoardClosed(boardId);
  };

  // Hàm xóa hoàn toàn board
  const handleDeleteBoard = (boardId) => {
    const confirm = window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn bảng này không?");
    if (!confirm) return;
  
    destroyBoard(boardId, {
      onSuccess: () => {
        alert("✅ Đã xóa bảng thành công!");
        // Gợi ý: bạn có thể gọi refetch hoặc invalidate query ở đây nếu cần cập nhật lại danh sách
      },
      onError: (error) => {
        console.error("❌ Lỗi khi xóa bảng:", error);
        alert("Xảy ra lỗi khi xóa bảng!");
      },
    });
  };

  return (
    <Box
      sx={{
        width: "60%",
        padding: "20px",
        marginLeft: "auto",
        marginTop: "25px",
      }}
    >
      {/* Workspaces của bạn */}
      <Typography
        variant="h6"
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
        {workspaces?.map((workspace) => (
          <MyWorkspace
            key={workspace.display_name}
            workspace={workspace}
            boards={workspace.boards}
          />
        ))}
      </div>

        
      {/* Nút xem tất cả bảng đã đóng */}
      <Button
        variant="outlined"
        sx={{
          backgroundColor: "#EDEBFC",
          height: "30px",
          width: "250px",
          marginTop: "40px",
        }}
        onClick={handleOpenClosedBoards}
        startIcon={<Archive />}
      >
        Xem tất cả các bảng đã đóng
      </Button>

      {/* Popup hiển thị danh sách bảng đã đóng */}
      <Dialog open={openClosedBoards} onClose={handleCloseClosedBoards} fullWidth>
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
                  <IconButton
                    onClick={() => handleDeleteBoard(board.id)}
                    color="error"
                    disabled={isDeleting}
                  >
                    {isDeleting ? <CircularProgress size={20} /> : <Delete />}
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
      </Dialog>
    </Box>
  );
};

export default HomeBoard;

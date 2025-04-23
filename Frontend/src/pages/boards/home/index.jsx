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
import { useClosedBoards, useForceDestroyBoard, useRecentBoardAccess, useRecentBoards, useToggleBoardClosed, useToggleBoardMarked, useUpdateBoardLastAccessed } from "../../../hooks/useBoard";
import { useWorkspace } from "../../../contexts/WorkspaceContext";
import MyBoard from "../../../components/MyBoard";
import WorkspaceAvatar from "../../../components/Common/WorkspaceAvatar";
import { Link } from "react-router-dom";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline"; // Outline
import { StarIcon } from "@heroicons/react/24/solid"; // Solid


const HomeBoard = ({ workspaces }) => {
  // const { data: workspaces, isLoading, isError } = useGetWorkspaces();
  const { guestWorkspaces } = useWorkspace()

  const { data: closedBoards, isLoading: loadingClosed } = useClosedBoards();

  const [openClosedBoards, setOpenClosedBoards] = useState(false);

  const { mutate: toggleBoardClosed } = useToggleBoardClosed();
  const { data: recentBoards, isLoading, error } = useRecentBoards();
  const saveRecentBoard = useRecentBoardAccess();
  const updateAccessTime = useUpdateBoardLastAccessed();
  // console.log(recentBoards);
  const { mutate: destroyBoard, isPending: isDeleting } = useForceDestroyBoard();
  const toggleBoardMarked = useToggleBoardMarked();


  console.log(guestWorkspaces)

  // if (isLoading) return <p>Đang tải workspaces...</p>;
  // if (isError) return <p>Lỗi khi tải workspaces!</p>;

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

  const handleClickBoard = (boardId) => {
    saveRecentBoard.mutate(boardId);
    updateAccessTime.mutate(boardId);
  };

  const handleToggleMarked = (e, boardId) => {
    e.preventDefault();
    e.stopPropagation();

    toggleBoardMarked.mutate(boardId, {
      onError: () => {
        setIsMarked((prev) => !prev);
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
      {/* da xem gan day */}
      <Typography
        variant="h6"
        sx={{
          marginTop: "50px",
          marginBottom: "10px",
          fontWeight: "bold",
          textTransform: "uppercase",
        }}
      >
        Đã xem gần đây
      </Typography>
      <List sx={{ display: "flex", flexDirection: "row", gap: 2, overflowX: "auto", padding: 0 }}>
        {recentBoards?.data?.slice(0, 3)?.map((board) => (
          <ListItem key={board.board_id} sx={{ width: "auto", padding: 0 }}>
            <Link
              to={`/b/${board.board_id}/${board.board_name}`}
              style={{ textDecoration: "none" }}
              onClick={() => handleClickBoard(board.board_id)}
            >
              <Box
                sx={{
                  width: "180px",
                  height: "100px",
                  background: board.thumbnail
                    ? board.thumbnail.startsWith("#")
                      ? board.thumbnail
                      : `url(${board.thumbnail}) center/cover no-repeat`
                    : "#1693E1",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  "&:hover": { opacity: 0.8 },
                  position: "relative",
                }}
              >
                <Typography sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                  {board.board_name}
                </Typography>

                <IconButton
                  sx={{
                    position: "absolute",
                    right: "6px",
                    top: "80%",
                    transform: "translateY(-50%)",
                  }}
                  onClick={(e) => handleToggleMarked(e, board.board_id)}

                >
                  {board.is_marked ? (
                    <StarIcon className="h-4 w-6 text-yellow-500" />
                  ) : (
                    <StarOutlineIcon className="h-4 w-6 text-gray-500" />
                  )}
                </IconButton>
              </Box>
            </Link>
          </ListItem>
        ))}
      </List>

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
          {guestWorkspaces?.length > 0 ? (
            guestWorkspaces.map((workspace) => (
              <div key={workspace.id} style={{ marginBottom: "20px" }}>
                {/* Hiển thị thông tin workspace */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: "10px", gap: 6 }}>
                  <WorkspaceAvatar workspace={workspace} />
                  <Typography fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
                    {workspace.display_name.length > 20
                      ? workspace.display_name.substring(0, 20) + "..."
                      : workspace.display_name}
                  </Typography>
                </div>

                {/* Hiển thị danh sách boards của workspace */}
                {workspace.boards?.filter(board => !board.closed).length > 0 ? (
                  workspace.boards
                    .filter(board => !board.closed)
                    .map((board) => (
                      <ListItem sx={{ width: "auto", padding: 0 }} key={board.id}>
                        <MyBoard board={board} id={`guest-board-${board.id}`} />
                      </ListItem>
                    ))
                ) : null}
              </div>
            ))
          ) : (
            null
          )}
        </div>
      </Box>


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

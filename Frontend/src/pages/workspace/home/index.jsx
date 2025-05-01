import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  Avatar,
  IconButton,
  SvgIcon,
  Button,
  Hidden
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import MyBoard from "../../../components/MyBoard";
import CreateBoard from "../../../components/CreateBoard";
import emptyBoard from "~/assets/emptyBoard.svg?react";
import WorkspaceHeader from "../../boards/detail/Member/Common/WorkspaceHeader";
import LogoLoading from "../../../components/Common/LogoLoading";


const HomeWorkspace = ({ workspace, refetchWorkspace, isLoadingWorkspace }) => {

  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isFormVisible, setFormVisible] = useState(false);

  // Hàm mở/đóng form tạo board
  const handleOpenCreateBoard = (event) => {
    setAnchorEl(event.currentTarget);
    setShowCreateBoard(true);
  };

  const handleCloseCreateBoard = () => {
    setShowCreateBoard(false);
    setAnchorEl(null);
  };

  // Toggle hiển thị form
  const toggleFormVisibility = () => {
    setFormVisible((prev) => !prev);
  };

  const isAdmin = workspace?.isCurrentUserAdmin || false;

  if (isLoadingWorkspace) {
    return (
      <Box sx={{
        width: "60%",
        padding: "20px",
        marginLeft: "auto",
      }}>
        <LogoLoading />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "60%",
        padding: "20px",
        marginLeft: "auto",
      }}
    >
      <WorkspaceHeader
        workspace={workspace}
        isAdmin={isAdmin}
        isFormVisible={isFormVisible}
        toggleFormVisibility={toggleFormVisibility}
        refetchWorkspace={refetchWorkspace}
      />


      {/* Danh sách bảng Trello */}
      <ListItem
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 0 20px",
          gap: "20px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <ListItemIcon>
            <PermIdentityOutlinedIcon sx={{ fontSize: 40, color: "black" }} />
          </ListItemIcon>
          <Typography fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
            Các bảng của bạn
          </Typography>
        </Box>
      </ListItem>

      <List
        sx={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto", // căn giữa
        }}
      >
        {workspace?.boards?.filter((board) => board.is_member).length > 0 ? (
          <>
            {workspace.boards
              .filter((board) => board.is_member) // lọc board mà mình là member
              .map((board) => (
                <ListItem key={board.id} sx={{ width: "auto", padding: 0 }}>
                  <MyBoard board={board} id={`w-board-${board.id}`} />
                </ListItem>
              ))}
            <ListItem sx={{ width: "auto", padding: 0 }}>
              <Box
                onClick={handleOpenCreateBoard}
                sx={{
                  width: "180px",
                  height: "100px",
                  backgroundColor: "#EDEBFC",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#DCDFE4" },
                }}
              >
                Tạo bảng mới
              </Box>
            </ListItem>

            <CreateBoard
              workspaceId={workspace?.id}
              open={showCreateBoard}
              anchorEl={anchorEl}
              onClose={handleCloseCreateBoard}
            />
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              width: "100%",
              height: "100%",
              mt: 4,
            }}
          >
            {/* Hình ảnh minh họa */}
            <SvgIcon
              component={emptyBoard}
              sx={{ width: 411, height: 200, mb: 2 }}
              viewBox="0 0 24 24"
              inheritViewBox
            />

            {/* Tiêu đề */}
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Các bảng là nơi hoàn thành công việc ở Trello.
            </Typography>

            {/* Nội dung mô tả */}
            <Typography variant="body2" sx={{ maxWidth: 500, mt: 1, color: "gray" }}>
              Trên bảng, bạn có thể di chuyển các thẻ giữa các danh sách để giữ cho
              các dự án, nhiệm vụ và hơn thế nữa luôn đi đúng hướng.
            </Typography>

            {/* Button tạo bảng */}
            <Button
              variant="contained"
              sx={{ mt: 3, bgcolor: "#2E71F3", ":hover": { bgcolor: "#1E50C9" } }}
              onClick={handleOpenCreateBoard}
            >
              Tạo bảng đầu tiên
            </Button>

            {/* Component CreateBoard */}
            <CreateBoard
              workspaceId={workspace?.id}
              open={showCreateBoard}
              anchorEl={anchorEl}
              onClose={handleCloseCreateBoard}
            />
          </Box>
        )}
      </List>

    </Box>
  );
};

export default HomeWorkspace;
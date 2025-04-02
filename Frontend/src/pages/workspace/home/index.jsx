import { useState } from "react";
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
import MyStar from "../../../components/MyStar";
import emptyBoard from "~/assets/emptyBoard.svg?react";
import { useSelector } from "react-redux";


const HomeWorkspace = ({ workspace }) => {
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenCreateBoard = (event) => {
    setAnchorEl(event.currentTarget);
    setShowCreateBoard(true);
  };

  const handleCloseCreateBoard = () => {
    setShowCreateBoard(false);
    setAnchorEl(null);
  };

  const [isFormVisible, setFormVisible] = useState(false);
  const starredBoards = useSelector((state) => state.starredBoards.starred.board_stars);

  const listStarIds = workspace?.boards
    ?.filter((board) => board.starred === 1)
    ?.map((board) => board.id) || [];

  const filteredStarredBoards = starredBoards?.filter((board) =>
    listStarIds.includes(board.board_id)
  ) || [];

  const toggleFormVisibility = () => {
    setFormVisible(!isFormVisible);
  };



  return (
    <Box
      sx={{
        width: "60%",
        padding: "20px",
        marginLeft: "auto",
        marginTop: "50px",
      }}
    >
      {!isFormVisible && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            borderBottom: "1px solid #D3D3D3",
            paddingBottom: "40px",
          }}
        >
          <Avatar sx={{ bgcolor: "#5D87FF", width: "80px", height: "80px" }}>
            <span style={{ fontSize: "30px", fontWeight: "bold" }}>
              {workspace?.display_name.charAt(0).toUpperCase()}
            </span>
          </Avatar>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Typography
                fontWeight="bold"
                sx={{ whiteSpace: "nowrap", fontSize: 25 }}
              >
                {workspace?.display_name}
              </Typography>
              <IconButton
                onClick={toggleFormVisibility}
                sx={{
                  color: "gray",
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                }}
              >
                <EditIcon sx={{ fontSize: 24 }} />
              </IconButton>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "gray",
              }}
            >
              <LockIcon sx={{ fontSize: 14 }} />
              <Typography sx={{ fontSize: 14 }}>
                {workspace?.permission_level}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      {/* Form hiển thị khi bấm Edit */}
      {isFormVisible && (
        <WorkspaceDetailForm
          workspaceInfo={workspace}
          onCancel={toggleFormVisibility} // Truyền hàm đóng form
        />
      )}

      {/* Danh sách bảng sao */}
      {filteredStarredBoards.length > 0 && (
        <>
          <ListItem>
            <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <ListItemIcon>
                <PermIdentityOutlinedIcon sx={{ fontSize: 40, color: "black" }} />
              </ListItemIcon>
              <Typography fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
                Bảng đánh dấu sao
              </Typography>
            </Box>
          </ListItem>

          <List sx={{ display: "flex", gap: "20px", flexWrap: "wrap", padding: 0 }}>
            {filteredStarredBoards?.map((star) => (
              <ListItem key={`star-${star.id || Math.random()}`} sx={{ width: "auto", padding: 0 }}>
                <MyStar star={star} />
              </ListItem>
            ))}
          </List>
        </>
      )}

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

      <List sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {workspace?.boards && workspace.boards.length > 0 ? (
          <>
            {workspace.boards.map((board) => (
              <ListItem key={board.id} sx={{ width: "auto", padding: 0 }}>
                <MyBoard key={board.id} board={board} id={`w-board-${board.id}`} />
              </ListItem>
            ))}
            <ListItem sx={{ width: "auto", padding: 0 }}>
              <Box
                onClick={handleOpenCreateBoard} // Mở popover khi nhấn
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
              workspaceId={workspace?.id} // Truyền workspaceId nếu cần
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
              onClick={handleOpenCreateBoard} // Mở popover khi nhấn
            >
              Tạo bảng đầu tiên
            </Button>

            {/* Component CreateBoard */}
            <CreateBoard
              workspaceId={workspace?.id} // Truyền workspaceId nếu cần
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

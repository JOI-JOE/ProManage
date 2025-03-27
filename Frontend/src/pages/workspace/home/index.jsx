import { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  Avatar,
  IconButton,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import MyBoard from "../../../components/MyBoard";
import CreateBoard from "../../../components/CreateBoard";
import MyStar from "../../../components/MyStar";
import { useSelector } from "react-redux";

const HomeWorkspace = ({ workspace }) => {
  const [isFormVisible, setFormVisible] = useState(false); // Quản lý hiển thị form
  const starredBoards = useSelector((state) => state.starredBoards.starred.board_stars);

  const listStarIds = workspace?.boards
    ?.filter((board) => board.starred === 1)
    ?.map((board) => board.id) || [];

  const filteredStarredBoards = starredBoards?.filter((board) =>
    listStarIds.includes(board.board_id)
  ) || [];

  console.log(filteredStarredBoards);


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
          workspace?.boards.map((board) => (
            <ListItem key={board.id} sx={{ width: "auto", padding: 0 }}>
              <MyBoard
                key={board.id}
                board={board}
                id={`recent-board-${board.id}`}
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            Không có bảng nào.
          </Typography>
        )}

        <CreateBoard />
      </List>
    </Box>
  );
};

export default HomeWorkspace;

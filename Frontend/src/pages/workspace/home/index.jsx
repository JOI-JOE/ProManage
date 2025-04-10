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

const HomeWorkspace = ({ workspace, markedBoards }) => {
  const [isFormVisible, setFormVisible] = useState(false); // Quản lý hiển thị form

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
              {workspace.display_name.charAt(0).toUpperCase()}
            </span>
          </Avatar>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Typography
                fontWeight="bold"
                sx={{ whiteSpace: "nowrap", fontSize: 25 }}
              >
                {workspace.display_name}
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
                {workspace.permission_level}
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
            Bảng đánh dấu sao
          </Typography>
        </Box>
      </ListItem>
      <List sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {markedBoards?.length > 0 ? (
          markedBoards?.map((board) => (
            <ListItem key={board.id} sx={{ width: "auto", padding: 0 }}>
              <MyBoard board={board} id={`recent-board-${board.id}`} />
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            Không có bảng nào.
          </Typography>
        )}
      </List>

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
        {/* Bảng Trello của tôi */}
        {workspace.boards && workspace.boards.length > 0 ? (
          workspace.boards
            .filter((board) => board.closed === 0) // Chỉ lấy các bảng chưa đóng
            .map((board) => (
              <ListItem key={board.id} sx={{ width: "auto", padding: 0 }}>
                <MyBoard key={board.id} board={board} id={`recent-board-${board.id}`} />
              </ListItem>
            ))
        ) : null}

        <CreateBoard />
      </List>
    </Box>
  );
};

export default HomeWorkspace;

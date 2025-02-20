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
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import FormConten from "../FormConten/FormConten";

// 🟢 Fetch workspace details
const fetchWorkspace = async (workspaceId) => {
  const token = localStorage.getItem("token");
  const { data } = await axios.get(
    `http://localhost:8000/api/workspaces/${workspaceId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // console.log(data);
  return data.data;
};


// 🟢 Fetch boards list
const fetchBoards = async (workspaceId) => {
  const token = localStorage.getItem("token");
  const { data } = await axios.get(
    `http://localhost:8000/api/workspaces/${workspaceId}/boards`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data.boards;
};

const ListWorkspaceConten = () => {
  const { workspaceId } = useParams();
  const [isFormVisible, setFormVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  // 🟢 Fetch workspace info
  const { data: workspace, isLoading: isWorkspaceLoading, error: workspaceError } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => fetchWorkspace(workspaceId),
  });

  // 🟢 Fetch boards list
  const { data: boards, isLoading: isBoardsLoading, error: boardsError } = useQuery({
    queryKey: ["boards", workspaceId],
    queryFn: () => fetchBoards(workspaceId),
  });

  const toggleFormVisibility = () => {
    setFormVisible(!isFormVisible);
  };

  return (
    <Box sx={{ width: "60%", padding: "20px", marginLeft: "auto", marginTop: "50px" }}>
      {!isFormVisible && (
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #D3D3D3", paddingBottom: "40px" }}>
          <Avatar sx={{ bgcolor: "#5D87FF", width: "80px", height: "80px" }}>
            {workspace ? workspace.name.charAt(0).toUpperCase() : "?"}
          </Avatar>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Typography fontWeight="bold" sx={{ whiteSpace: "nowrap", fontSize: 25 }}>
                {isWorkspaceLoading ? "Đang tải..." : workspace?.name || "Không có tên"}
              </Typography>
              <IconButton onClick={toggleFormVisibility} sx={{ color: "gray", "&:hover": { backgroundColor: "transparent" } }}>
                <EditIcon sx={{ fontSize: 24 }} />
              </IconButton>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "5px", color: "gray" }}>
              <LockIcon sx={{ fontSize: 14 }} />
              <Typography sx={{ fontSize: 14 }}> {isWorkspaceLoading ? "Đang tải..." : workspace?.permission_level || ""}</Typography>
            </Box>
          </Box>
        </Box>
      )}

      {isFormVisible && <FormConten />}

      <ListItem sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0 20px", gap: "20px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <ListItemIcon>
            <PermIdentityOutlinedIcon sx={{ fontSize: 40, color: "black" }} />
          </ListItemIcon>
          <Typography fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
            Các bảng của bạn
          </Typography>
        </Box>
      </ListItem>

      {/* 🟠 Loading & Error Handling */}
      {isBoardsLoading && <Typography>Loading...</Typography>}
      {boardsError && <Typography color="error">Lỗi khi tải danh sách bảng.</Typography>}

      <List sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {boards && Array.isArray(boards) ? (
          boards.map((board) => (
            <ListItem key={board.id} sx={{ width: "auto", padding: 0 }}>
              <Box
                component={Link}
                to={`/board/${board.id}`}
                sx={{
                  width: "180px",
                  height: "100px",
                  backgroundColor: "#9c2750",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  textDecoration: "none",
                  position: "relative",
                  "&:hover": { backgroundColor: "#9A436D" },
                }}
                onMouseEnter={() => setHoveredItem(board.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Typography sx={{ color: "white", fontWeight: "bold" }}>{board.name}</Typography>
              </Box>
            </ListItem>
          ))
        ) : (
          <Typography>Không có bảng nào</Typography>
        )}

        {/* 🟢 Tạo bảng mới */}
        <ListItem sx={{ width: "auto", padding: 0 }}>
          <Box
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
            onClick={() => console.log("Mở form tạo bảng mới")}
          >
            <Typography sx={{ color: "Black", fontWeight: "bold" }}>Tạo bảng mới</Typography>
          </Box>
        </ListItem>
      </List>
    </Box>
  );
};

export default ListWorkspaceConten;

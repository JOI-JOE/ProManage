import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  Avatar,
} from "@mui/material";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import { IconButton } from "@mui/material";
import { Link } from "react-router-dom";

const ListWorkspaceConten = () => {
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <Box
      sx={{
        width: "60%",
        padding: "20px",
        marginLeft: "auto",
        marginTop: "50px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          borderBottom: "1px solid #D3D3D3",
          paddingBottom: "40px",
          top: "50px",
        }}
      >
        <Avatar sx={{ bgcolor: "#5D87FF", width: "80px", height: "80px" }}>
          K
        </Avatar>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Typography
              fontWeight="bold"
              sx={{ whiteSpace: "nowrap", fontSize: 25 }}
            >
              Trello Không gian làm việc
            </Typography>

            {/* IconButton không bị ảnh hưởng hover của Box cha */}
            <IconButton
              component={Link}
              to="/formconten"
              sx={{
                color: "gray",
                "&:hover": {
                  backgroundColor: "transparent", // Không đổi màu nền khi hover
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
            <Typography sx={{ fontSize: 14 }}>Riêng tư</Typography>
          </Box>
        </Box>
      </Box>

      <ListItem
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 0",
          gap: " 20px",
          paddingBottom: "20px",
        }}
      >
        {/* Avatar & Tiêu đề */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <ListItemIcon sx={{ color: "black", fontSize: 40 }}>
            <PermIdentityOutlinedIcon />
          </ListItemIcon>
          <Typography fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
            Các bảng của bạn
          </Typography>
        </Box>
      </ListItem>

      {/* Danh sách bảng Trello */}
      <List sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <ListItem sx={{ width: "auto", padding: 0 }}>
          <Box
            component={Link}
            to="/boardconten"
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
              "&:hover": { backgroundColor: "#9A436D" },
              position: "relative", // Để icon đúng vị trí
            }}
            onMouseEnter={() => setHoveredItem(2)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Typography sx={{ color: "white", fontWeight: "bold" }}>
              Bảng Trello của tôi
            </Typography>
            {hoveredItem === 2 && (
              <StarBorderIcon
                sx={{
                  color: "white",
                  position: "absolute",
                  right: "10px",
                  top: "10px", // Điều chỉnh vị trí icon hợp lý
                }}
              />
            )}
          </Box>
        </ListItem>

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
          >
            <Typography sx={{ color: "Black", fontWeight: "bold" }}>
              Tạo bảng mới
            </Typography>
          </Box>
        </ListItem>
      </List>

      {/* Nút xem tất cả các bảng đã đóng */}
    </Box>
  );
};

export default ListWorkspaceConten;

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
import StarBorderIcon from "@mui/icons-material/StarBorder";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import { Link } from "react-router-dom";
import FormConten from "../FormConten/FormConten";

const ListWorkspaceConten = () => {
  const [hoveredItem, setHoveredItem] = useState(null);
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
              <Typography sx={{ fontSize: 14 }}>Riêng tư</Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Form hiển thị khi bấm Edit */}
      {isFormVisible && <FormConten />}

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
              position: "relative",
              "&:hover": { backgroundColor: "#9A436D" },
            }}
            onMouseEnter={() => setHoveredItem(1)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Typography sx={{ color: "white", fontWeight: "bold" }}>
              Bảng Trello của tôi
            </Typography>
            {hoveredItem === 1 && (
              <StarBorderIcon
                sx={{
                  color: "white",
                  position: "absolute",
                  right: "10px",
                  top: "10px",
                }}
              />
            )}
          </Box>
        </ListItem>

        {/* Tạo bảng mới */}
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
    </Box>
  );
};

export default ListWorkspaceConten;

import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Button,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import PeopleIcon from "@mui/icons-material/People";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ViewStreamIcon from "@mui/icons-material/ViewStream";
import SettingsIcon from "@mui/icons-material/Settings";
import SignalCellularAltOutlinedIcon from "@mui/icons-material/SignalCellularAltOutlined";

const WorkspaceConten = () => {
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <Box
      sx={{
        width: "60%",
        padding: "20px",
        marginLeft: "auto",
        marginTop: "25px",
      }}
    >
      {/* Đã xem gần đây */}
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
        <AccessTimeIcon sx={{ marginRight: "8px" }} />
        <Typography variant="h6">Đã xem gần đây</Typography>
      </Box>

      <List sx={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <ListItem sx={{ width: "auto", padding: 0 }}>
          <Box
            sx={{
              width: "180px",
              height: "100px",
              backgroundColor: "#9c2750",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px",
              position: "relative",
              cursor: "pointer",
              "&:hover": { backgroundColor: "#9A436D" },
            }}
            onMouseEnter={() => setHoveredItem(1)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <PeopleIcon
              sx={{
                color: "white",
                marginRight: "3px",
                marginTop: "70px",
              }}
            />
            <Typography
              sx={{
                color: "white",
                fontWeight: "bold",
                marginBottom: "5px",
                marginRight: "20px",
              }}
            >
              Bảng Trello của tôi
            </Typography>
            {hoveredItem === 1 && (
              <StarBorderIcon
                sx={{
                  color: "white",
                  position: "absolute",
                  right: "10px",
                  top: "70px",
                }}
              />
            )}
          </Box>
        </ListItem>
      </List>

      {/* Các không gian làm việc của bạn */}
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

      <ListItem
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 0",
          gap: " 20px",
        }}
      >
        {/* Avatar & Tiêu đề */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Avatar sx={{ bgcolor: "#5D87FF" }}>K</Avatar>
          <Typography fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
            Trello Không gian làm việc
          </Typography>
        </Box>

        {/* Các nút chức năng */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Button
            variant="outlined"
            sx={{
              backgroundColor: "#F8F9FA",
              height: "36px",
              borderRadius: "8px",
              color: "#172B4D",
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <DashboardIcon fontSize="small" />
            Bảng
          </Button>

          <Button
            variant="outlined"
            sx={{
              backgroundColor: "#F8F9FA",
              height: "36px",
              width: "130px",
              borderRadius: "8px",
              color: "#172B4D",
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <ViewStreamIcon fontSize="small" />
            Dạng xem
          </Button>

          <Button
            variant="outlined"
            sx={{
              backgroundColor: "#F8F9FA",
              height: "36px",
              width: "160px",
              borderRadius: "8px",
              color: "#172B4D",
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <PeopleIcon fontSize="small" />
            Thành viên (1)
          </Button>

          <Button
            variant="outlined"
            sx={{
              backgroundColor: "#F8F9FA",
              height: "36px",
              width: "120px",
              borderRadius: "8px",
              color: "#172B4D",
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <SettingsIcon fontSize="small" />
            Cài đặt
          </Button>

          <Button
            variant="contained"
            sx={{
              backgroundColor: "#EDEBFC",
              height: "36px",
              width: "140px",
              borderRadius: "8px",
              color: "#8250DF",
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <SignalCellularAltOutlinedIcon fontSize="small" />
            Nâng cấp
          </Button>
        </Box>
      </ListItem>

      {/* Danh sách bảng Trello */}
      <List sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <ListItem sx={{ width: "auto", padding: 0 }}>
          <Box
            sx={{
              width: "180px",
              height: "100px",
              backgroundColor: "#9c2750",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              "&:hover": { backgroundColor: "#9A436D" },
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
                  top: "70px",
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
      <Button
        variant="outlined"
        sx={{
          backgroundColor: "#EDEBFC",
          height: "30px",
          width: "250px",
          marginTop: "40px",
        }}
      >
        Xem tất cả các bảng đã đóng
      </Button>
    </Box>
  );
};

export default WorkspaceConten;

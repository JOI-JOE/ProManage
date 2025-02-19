import { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Button,
  Chip,
  Paper,
  Grid,
  IconButton,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";

// Danh sách thành viên mẫu

const MemberConten = () => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isFormVisible, setFormVisible] = useState(false); // Quản lý hiển thị form

  const toggleFormVisibility = () => {
    setFormVisible(!isFormVisible);
  };
  return (
    <Box
      sx={{
        width: "75%", // Tăng width để tránh nội dung bị ép sang phải
        padding: "20px",
        marginLeft: "5%", // Dịch sát trái hơn
        marginTop: "30px", // Giảm top xuống giống Trello
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          borderBottom: "1px solid #D3D3D3",
          width: "75vw",
          paddingBottom: "40px",
          marginLeft: "-60px",
          top: "50px",
        }}
      >
        <Avatar
          sx={{
            bgcolor: "#5D87FF",
            width: "60px",
            height: "60px",
            marginLeft: "90px",
          }}
        >
          K
        </Avatar>
        <Box sx={{ marginLeft: "10px" }}>
          <Typography fontWeight="bold" sx={{ fontSize: 22 }}>
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
        <Button variant="contained" sx={{ ml: 30 }}>
          Mời các thành viên Không gian làm việc
        </Button>
      </Box>

      {/* Nội dung */}
      <Grid container spacing={2} sx={{ marginTop: "20px" }}>
        {/* Cột trái: Người cộng tác */}
        <Grid item xs={12} md={4} sx={{ paddingRight: "10px" }}>
          <Box sx={{ padding: "20px", borderRight: "1px solid #D3D3D3" }}>
            <Typography variant="h6" fontWeight="bold">
              Người cộng tác
            </Typography>
            <Chip
              label="1 / 10"
              size="small"
              sx={{ fontSize: "12px", backgroundColor: "#F4F5F7" }}
            />

            <Paper
              elevation={0}
              sx={{
                backgroundColor: "#E8F0FE",
                padding: 1,
                borderRadius: 2,
                mt: 2,
              }}
            >
              <Typography variant="body2" color="primary" fontWeight="bold">
                Thành viên không gian làm việc (1)
              </Typography>
            </Paper>

            <List sx={{ padding: 0, marginTop: 2 }}>
              <ListItem divider>
                <ListItemText primary="Khách (0)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Yêu cầu tham gia (0)" />
              </ListItem>
            </List>
          </Box>
        </Grid>

        {/* Cột phải: Chi tiết Thành viên */}
        <Grid item xs={12} md={8}>
          <Box sx={{ padding: "20px" }}>
            <Typography variant="h6" fontWeight="bold">
              Thành viên không gian làm việc (1)
            </Typography>
            <Typography variant="body2" sx={{ color: "gray", mb: 2 }}>
              Các thành viên trong Không gian làm việc có thể xem và tham gia
              tất cả các bảng.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MemberConten;

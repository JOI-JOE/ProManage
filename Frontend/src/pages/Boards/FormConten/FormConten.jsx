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

import StarBorderIcon from "@mui/icons-material/StarBorder";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import TextField from "@mui/material/TextField";
import { Link } from "react-router-dom";

const FormConten = () => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    website: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      <Box
        sx={{
          width: "40%",
          borderBottom: "1px solid #D3D3D3",
          paddingBottom: "40px",
          // top: "50px",
          gap: "10px",
        }}
      >
        <TextField
          label="Tên *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          InputLabelProps={{
            sx: { color: "black" }, // Màu label
          }}
          sx={{
            "& .MuiInputBase-input": {
              color: "black", // Màu chữ trong ô nhập
            },
          }}
        />

        <TextField
          label="Tên ngắn gọn *"
          name="shortName"
          value={formData.shortName}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          InputLabelProps={{
            sx: { color: "black" }, // Màu label
          }}
          sx={{
            "& .MuiInputBase-input": {
              color: "black", // Màu chữ trong ô nhập
            },
          }}
        />

        <TextField
          label="Mô tả (tùy chọn)"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
          margin="normal"
          InputLabelProps={{
            sx: { color: "black" }, // Đổi màu chữ của label
          }}
          sx={{
            "& textarea": {
              color: "black",
              resize: "both",
              overflow: "auto",
              minHeight: "30px",
              maxHeight: "300px",
              minWidth: "100%",
              paddingBottom: "20px",
            },
          }}
        />

        <Box sx={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <Button
            variant="contained"
            color="primary"
            disabled={!formData.name || !formData.shortName}
          >
            Lưu
          </Button>
          <Button component={Link} to="/listworkspaceconten" variant="outlined">
            Hủy
          </Button>
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
    </Box>
  );
};

export default FormConten;

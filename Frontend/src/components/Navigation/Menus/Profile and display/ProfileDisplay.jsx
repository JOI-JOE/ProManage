import React from "react";
import { Box, Typography, TextField, Button, Avatar } from "@mui/material";

const ProfileDisplay = () => {
  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: "#ffffff", // Changed to white
        color: "#000000", // Changed to black
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      {/* Left Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          marginRight: 4,
          width: "100%",
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              marginRight: 2,
              backgroundColor: "teal",
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center", // Added to center the text inside the Avatar
            }}
            src="https://via.placeholder.com/56"
            alt="User Avatar"
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#000000", fontSize: "1rem" }} // Changed to black
          >
            Pham Thi Hong Ngat (FPL HN)
          </Typography>
        </Box>

        {/* Navigation Tabs */}
        <Box
          sx={{
            display: "flex",
            marginBottom: 4,
            borderBottom: "1px solid #ccc", // Changed border color to light gray
            width: "100%",
            gap: 2, // Added spacing between Typography components
          }}
        >
          <Typography
            variant="body1"
            sx={{
              mrginRight: 2,
              marginBottom: 2,
              paddingBottom: 1,
              cursor: "pointer",
              borderBottom: "2px solid #00A3BF",
              color: "#000000", // Changed to black
            }}
          >
            Hồ sơ và Hiển thị
          </Typography>
          <Typography
            variant="body1"
            sx={{
              marginBottom: 2,
              paddingBottom: 1,
              cursor: "pointer",
              color: "#888888", // Changed to gray
            }}
          >
            Hoạt động
          </Typography>
          <Typography
            variant="body1"
            sx={{
              marginBottom: 2,
              paddingBottom: 1,
              cursor: "pointer",
              color: "#888888", // Changed to gray
            }}
          >
            Thẻ
          </Typography>
          <Typography
            variant="body1"
            sx={{
              paddingBottom: 1,
              cursor: "pointer",
              color: "#888",
            }}
          >
            Cài đặt
          </Typography>
        </Box>
      </Box>

      {/* Right Section */}
      <Box
        sx={{
          backgroundColor: "#f9f9f9", // Changed to light gray
          padding: 4,
          borderRadius: 2,
          width: "450px",
          alignSelf: "center",
          marginTop: "auto",
          marginBottom: "auto",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, color: "#000000" }}>
          Quản lý thông tin cá nhân của bạn
        </Typography>

        <TextField
          fullWidth
          label="Tên người dùng"
          defaultValue="phamthihongngatfplhn"
          sx={{
            mb: 2,
            "& .MuiInputBase-input": { fontSize: "0.7rem", color: "#000000" }, // Changed font size to 0.6rem
            "& .MuiInputLabel-root": { color: "#555555" }, // Changed to dark gray
            "& .MuiInputBase-root": { color: "#000000" }, // Changed to black
          }}
        />
        <Typography variant="body2" sx={{ mb: 1, color: "#000000" }}>
          Lý lịch
        </Typography>
        <textarea
          rows={2}
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "0.875rem",
            borderRadius: "4px",
            border: "1px solid #ccc", // Changed border color to light gray
            color: "#000000", // Changed to black
            backgroundColor: "#ffffff", // Changed to white
            marginBottom: "24px",
          }}
        ></textarea>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "teal",
            "&:hover": { backgroundColor: "#0088a3" },
          }}
        >
          Lưu
        </Button>
      </Box>
    </Box>
  );
};

export default ProfileDisplay;

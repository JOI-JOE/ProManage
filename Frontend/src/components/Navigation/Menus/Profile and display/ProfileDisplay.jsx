import React from "react";
import { Box, Typography, TextField, Button } from "@mui/material";

const ProfileDisplay = () => {
  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: "#ffffff", // Changed to white
        color: "#000000", // Changed to black
        minHeight: "100vh",
        display: "flex", // Added for centering
        justifyContent: "center", // Added for centering
        alignItems: "center", // Added for centering
      }}
    >
      <Box
        sx={{
          backgroundColor: "#f5f5f5",
          padding: 3,
          borderRadius: 2,
          width: "450px", // Set width to 200px
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Quản lý thông tin cá nhân của bạn
        </Typography>
        <TextField
          fullWidth
          label="Tên người dùng"
          defaultValue="phamthihongngatfplhn"
          sx={{ mb: 2, "& .MuiInputBase-input": { fontSize: "0.7rem" } }} // Adjusted font size
          InputLabelProps={{ style: { color: "#000000" } }} // Changed to black
          InputProps={{ style: { color: "#000000" } }} // Changed to black
        />
        <Typography variant="h6" sx={{ mb: 1, color: "#000000" }}>
          Lý lịch
        </Typography>
        <textarea
          rows={2}
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "0.875rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
            color: "#000000",
            backgroundColor: "#ffffff",
            marginBottom: "24px",
          }}
        ></textarea>
        <Button variant="contained" sx={{ backgroundColor: "#00A3BF" }}>
          Lưu
        </Button>
      </Box>
    </Box>
  );
};

export default ProfileDisplay;

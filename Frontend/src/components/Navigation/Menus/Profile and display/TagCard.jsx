import React, { useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import Avatar from "@mui/material/Avatar";

const TagCard = () => {

  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: "#ffffff",
        color: "#000000",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      {/* Right Section */}
      <Box
        sx={{
          backgroundColor: "#f9f9f9",
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
            "& .MuiInputBase-input": { fontSize: "0.7rem", color: "#000000" },
            "& .MuiInputLabel-root": { color: "#555555" },
            "& .MuiInputBase-root": { color: "#000000" },
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
            border: "1px solid #ccc",
            color: "#000000",
            backgroundColor: "#ffffff",
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

export default TagCard;

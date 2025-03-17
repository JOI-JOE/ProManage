import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  Button,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const colors = [
  "#4CAF50",
  "#FF9800",
  "#9C27B0",
  "#2196F3",
  "#8BC34A",
  "#607D8B",
];
const unsplashImages = [
  "https://i.pinimg.com/736x/d5/22/a7/d522a7f85c56e06f94177565e7e752e7.jpg",
  "https://i.pinimg.com/736x/0e/5d/31/0e5d315fe38f546aa5bc4045f884f061.jpg",
  "https://i.pinimg.com/736x/55/7b/69/557b6992b67c9d663a6e1fb3561cd814.jpg",
  "https://i.pinimg.com/736x/b3/3c/19/b33c194d93de16f5d4a634fb1eb18428.jpg",
  "https://i.pinimg.com/736x/ee/9c/81/ee9c81b97b35264e800be02c37f01455.jpg",
];

const CoverImageDialog = ({
  open,
  handleClose,
  onCoverImageChange,
  onCoverColorChange,
}) => {
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        onCoverImageChange(imageUrl); // Call the handler with the uploaded image
        handleClose(); // Close the dialog after selecting the image
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          padding: "16px 24px 0px 24px",
        }}
      >
        Ảnh bìa
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {/* Màu sắc */}
        <Typography variant="subtitle1" gutterBottom>
          Màu sắc
        </Typography>
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {colors.map((color, index) => (
            <Grid item key={index}>
              <Button
                sx={{
                  backgroundColor: color,
                  width: 30,
                  height: 30,
                  minWidth: 0,
                }}
                onClick={() => {
                  onCoverColorChange(color); // Call the handler
                  handleClose(); // Close the dialog after selecting the color
                }}
              />
            </Grid>
          ))}
        </Grid>

        {/* Tải lên ảnh */}
        <Button variant="contained" fullWidth component="label" sx={{ mb: 2 }}>
          Tải lên ảnh bìa
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageUpload}
          />
        </Button>

        {/* Ảnh từ Unsplash */}
        <Typography variant="subtitle1" gutterBottom>
          Ảnh từ Unsplash
        </Typography>
        <Grid container spacing={1}>
          {unsplashImages.map((img, index) => (
            <Grid item key={index}>
              <Paper
                component="img"
                src={img}
                alt="Unsplash"
                sx={{
                  width: 100,
                  height: 60,
                  borderRadius: 1,
                  cursor: "pointer",
                }}
                onClick={() => {
                  onCoverImageChange(img); // Call the handler with the selected image
                  handleClose(); // Close the dialog after selecting the image
                }}
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default CoverImageDialog;

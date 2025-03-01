import React from "react";
import { Grid, Button } from "@mui/material";

// Danh sách ảnh mẫu (có thể thay thế bằng ảnh của bạn hoặc từ API Unsplash)
const imageList = [
  "https://i.pinimg.com/474x/1f/06/55/1f0655874fe93165b1334d0f11bcbc84.jpg",
  "https://i.pinimg.com/474x/5d/ec/4c/5dec4c4bc00b861df6439700606b53dd.jpg",
  "https://i.pinimg.com/474x/15/d7/2c/15d72c5c5dde00858e4dd0a095529995.jpg",
  "https://i.pinimg.com/474x/3f/91/ca/3f91ca5bb89f9980f7840350224bb393.jpg",
  "https://i.pinimg.com/474x/92/61/24/926124faa400744d1e3f2f7b27cdf1de.jpg",
  "https://i.pinimg.com/736x/35/c6/ff/35c6ff4ff561589a5c508e9a0a1f1214.jpg",

  "https://i.pinimg.com/474x/1f/06/55/1f0655874fe93165b1334d0f11bcbc84.jpg",
  "https://i.pinimg.com/474x/5d/ec/4c/5dec4c4bc00b861df6439700606b53dd.jpg",
  "https://i.pinimg.com/474x/08/94/64/08946480255cd2c14d83346dbcc079fa.jpg",
  "https://i.pinimg.com/474x/3f/91/ca/3f91ca5bb89f9980f7840350224bb393.jpg",
  "https://i.pinimg.com/474x/92/61/24/926124faa400744d1e3f2f7b27cdf1de.jpg",
  "https://i.pinimg.com/736x/35/c6/ff/35c6ff4ff561589a5c508e9a0a1f1214.jpg",

  "https://i.pinimg.com/474x/1f/06/55/1f0655874fe93165b1334d0f11bcbc84.jpg",
  "https://i.pinimg.com/474x/5d/ec/4c/5dec4c4bc00b861df6439700606b53dd.jpg",
  "https://i.pinimg.com/474x/08/94/64/08946480255cd2c14d83346dbcc079fa.jpg",
  "https://i.pinimg.com/474x/3f/91/ca/3f91ca5bb89f9980f7840350224bb393.jpg",
  "https://i.pinimg.com/474x/92/61/24/926124faa400744d1e3f2f7b27cdf1de.jpg",
  "https://i.pinimg.com/736x/35/c6/ff/35c6ff4ff561589a5c508e9a0a1f1214.jpg",
];

const ImageList = ({ onSelectImage }) => {
  return (
    <Grid container spacing={2}>
      {imageList.map((image, index) => (
        <Grid item xs={4} key={index}>
          <Button
            variant="outlined"
            fullWidth
            style={{
              height: "100px",
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onClick={() => onSelectImage(image)} // Gọi hàm onSelectImage khi chọn ảnh
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ImageList;

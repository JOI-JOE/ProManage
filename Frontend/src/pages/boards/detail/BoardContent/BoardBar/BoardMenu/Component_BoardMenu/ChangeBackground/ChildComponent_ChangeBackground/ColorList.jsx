import React from "react";
import { Grid, Button } from "@mui/material";

// Danh sách màu mẫu (có thể thay đổi theo nhu cầu)
const colorList = [
  "#A2C2E5",
  "#A9D3E2",
  "#496EE4",
  "#8541D8",
  "#F9C9E0",
  "#F0A36D", // Các mã màu
  "#F1D2D6",
  "#55CFC0",
  "#B9A6DC",
  "#E1B8A8",
  "#F9C3B9",
  "#C8D8DC",
  "#F3A3D5",
  "#9B7AF4",
  "#4F72A1",
  "#F06B3E",
  "#47A1A6",
  "#3C74B0",
];

const ColorList = ({ onSelectColor }) => {
  return (
    <Grid container spacing={2} sx={{ padding: "16px" }}>
      {colorList.map((color, index) => (
        <Grid item xs={4} key={index}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: color,
              height: "50px",
              borderRadius: "8px",
            }}
            onClick={() => onSelectColor(color)} // Gọi hàm onSelectColor khi chọn màu
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ColorList;

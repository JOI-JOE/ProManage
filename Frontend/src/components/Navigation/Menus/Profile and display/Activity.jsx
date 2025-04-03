import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

const Activity = () => {
  const activities = [
    "Ngat Pham Thi Hong đã tham gia bảng Ngôn Tố thông qua lời mời.",
    "Pham Thi Hong Ngat đã thêm bảng Bảng New vào nhóm Hồng Ngat 1.",
    "Pham Thi Hong Ngat đã tạo bảng Bảng New.",
    "Pham Thi Hong Ngat đã đặt ngày hết hạn cho thẻ Card 01.",
    "TT đã thêm Pham Thi Hong Ngat vào bảng wr.",
  ];

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Typography
        variant="h5"
        sx={{ marginBottom: 3, fontWeight: "bold", color: "#333" }}
      >
        Hoạt động
      </Typography>
      <List>
        {activities.map((activity, index) => (
          <React.Fragment key={index}>
            <ListItem
              sx={{
                padding: 2,
                backgroundColor: "#fff",
                borderRadius: 1,
                boxShadow: 1,
              }}
            >
              <ListItemText
                primary={activity}
                primaryTypographyProps={{ fontSize: "0.9rem", color: "#555" }}
              />
            </ListItem>
            {index < activities.length - 1 && <Divider sx={{ marginY: 1 }} />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default Activity;

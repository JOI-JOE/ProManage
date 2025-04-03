import React from "react";
import { Box, Typography } from "@mui/material";
import Avatar from "@mui/material/Avatar";

const LeftSection = ({ activeTab, handleTabClick }) => {
  return (
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
            justifyContent: "center",
          }}
          src="https://via.placeholder.com/56"
          alt="User Avatar"
        />
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: "#000000", fontSize: "1rem" }}
        >
          Pham Thi Hong Ngat (FPL HN)
        </Typography>
      </Box>

      {/* Navigation Tabs */}
      <Box
        sx={{
          display: "flex",
          marginBottom: 4,
          borderBottom: "1px solid #ccc",
          width: "100%",
          gap: 2,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            marginBottom: 2,
            paddingBottom: 1,
            cursor: "pointer",
            borderBottom:
              activeTab === "profile" ? "2px solid #00A3BF" : "none",
            color: "#000000",
          }}
          onClick={() => handleTabClick("profile")}
        >
          Hồ sơ và Hiển thị
        </Typography>
        <Typography
          variant="body1"
          sx={{
            marginBottom: 2,
            paddingBottom: 1,
            cursor: "pointer",
            borderBottom:
              activeTab === "activity" ? "2px solid #00A3BF" : "none",
            color: "#000000",
          }}
          onClick={() => handleTabClick("activity")}
        >
          Hoạt động
        </Typography>
        <Typography
          variant="body1"
          sx={{
            marginBottom: 2,
            paddingBottom: 1,
            cursor: "pointer",
            borderBottom: activeTab === "cards" ? "2px solid #00A3BF" : "none",
            color: "#000000",
          }}
          onClick={() => handleTabClick("cards")}
        >
          Thẻ
        </Typography>
        <Typography
          variant="body1"
          sx={{
            marginBottom: 2,
            paddingBottom: 1,
            cursor: "pointer",
            borderBottom:
              activeTab === "settings" ? "2px solid #00A3BF" : "none",
            color: "#000000",
          }}
          onClick={() => handleTabClick("settings")}
        >
          Cài đặt
        </Typography>
      </Box>
    </Box>
  );
};

export default LeftSection;

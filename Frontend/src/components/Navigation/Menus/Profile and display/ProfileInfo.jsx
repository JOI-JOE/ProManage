import React, { useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import { Outlet, useNavigate } from "react-router-dom";
// import { useMe } from "../../../../contexts/MeContext";
import { useUserById } from "../../../../hooks/useUser";

const ProfileInfo = () => {
  const navigate = useNavigate();

  // const { user } = useMe();

  const { data: user, isLoading: isUserLoading } = useUserById();
  

  const actualUsername = user?.user_name;

  const [activeTab, setActiveTab] = useState("profile");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // Add navigation logic if needed

    switch (tab) {
  case "profile":
    navigate("profile");
    break;
  case "activity":
    navigate("activity");
    break;
  case "cards":
    navigate("cards");
    break;
  // case "settings":
  //   navigate("settings");
  //   break;
  default:
    break;
  } 
  };
  return (
    <Box
      sx={{
        padding: 6,
        backgroundColor: "#ffffff",
        color: "#000000",
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
          <Avatar sx={{ bgcolor: "#00A3BF", width: 50, height: 50, marginRight:3,}}>
            {user?.email?.charAt(0)?.toUpperCase() || ""}
          </Avatar>
          <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#000000", fontSize: "1.3rem" }} // Changed to black
          >
            {actualUsername}
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: "", color: "#000000", fontSize: "0.8rem" }} // Changed to black
          >
            {user?.email}
          </Typography>
            
          </Box>
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
              marginBottom: 2,
              paddingBottom: 1,
              cursor: "pointer",
              borderBottom:
                activeTab === "profile" ? "2px solid #00A3BF" : "none",
              color: "#000000", // Changed to black
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
              color: "#000000", // Changed to gray
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
              borderBottom:
                activeTab === "cards" ? "2px solid #00A3BF" : "none",
              color: "#000000", // Changed to gray
            }}
            onClick={() => handleTabClick("cards")}
          >
            Thẻ
          </Typography>

          {/* <Typography
            variant="body1"
            sx={{
              marginBottom: 2,
              paddingBottom: 1,
              cursor: "pointer",
              borderBottom:
                activeTab === "settings" ? "2px solid #00A3BF" : "none",
              color: "#000000", // Changed to gray
            }}
            onClick={() => handleTabClick("settings")}
          >
            Cài đặt
          </Typography> */}
        </Box>
      </Box>
      <Outlet /> {/* 👈 nơi render nội dung route con */}

    </Box>
  );
};

export default ProfileInfo;

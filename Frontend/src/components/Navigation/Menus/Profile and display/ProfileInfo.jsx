import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useUserById } from "../../../../hooks/useUser";
import InitialsAvatar from "../../../Common/InitialsAvatar";

const ProfileInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: user } = useUserById();
  const actualUsername = user?.full_name;

  // Xác định tab đang active dựa vào pathname
  const path = location.pathname;
  const activeTab =
    path.includes("activity")
      ? "activity"
      : path.includes("cards")
      ? "cards"
      : "profile"; // mặc định là profile

  const handleTabClick = (tab) => {
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          marginRight: 4,
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginBottom: 4,
            gap: 2,
          }}
        >
            <InitialsAvatar
              name={user?.full_name}
              avatarSrc={user?.image}
              initial={user?.initials}
              size={38}
            />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.3rem" }}>
              {actualUsername}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>

        {/* Tabs */}
        <Box
          sx={{
            display: "flex",
            marginBottom: 4,
            borderBottom: "1px solid #ccc",
            width: "100%",
            gap: 2,
          }}
        >
          {[
            { label: "Hồ sơ và Hiển thị", key: "profile" },
            { label: "Hoạt động", key: "activity" },
            { label: "Thẻ", key: "cards" },
          ].map((tab) => (
            <Typography
              key={tab.key}
              variant="body1"
              sx={{
                marginBottom: 2,
                paddingBottom: 1,
                cursor: "pointer",
                borderBottom:
                  activeTab === tab.key ? "2px solid #00A3BF" : "none",
                color: "#000000",
              }}
              onClick={() => handleTabClick(tab.key)}
            >
              {tab.label}
            </Typography>
          ))}
        </Box>
      </Box>

      <Outlet />
    </Box>
  );
};

export default ProfileInfo;

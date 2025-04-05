import React from "react";
import { Button, Box, Typography, TextField } from "@mui/material";
import trelloLogo from "~/assets/trello.svg?react";
import SvgIcon from "@mui/material/SvgIcon";
import { Link } from "react-router-dom";
import { useMe } from "../contexts/MeContext";

const Home = () => {
  const backgroundStyle = {
    backgroundImage:
      "url('https://i.pinimg.com/736x/b4/03/dd/b403dd07ed859682d122b5862226fd68.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    height: "100vh",
    width: "100%",
    position: "relative",
    color: "#000",
    backgroundColor: "rgba(255, 255, 255, 0.5)", // Thêm lớp mờ
    backgroundBlendMode: "overlay", // Kết hợp màu nền và ảnh
  };
  const { user } = useMe();
  return (
    <div style={backgroundStyle}>
      {/* Header Buttons */}
      <Box
        sx={{
          position: "absolute",
          bottom: "300px",
          right: "360px",
          display: "flex",
          gap: "10px",
          padding: "10px 15px",
          borderRadius: "8px",
        }}
      >
        {user && (
          <Button
            variant="contained"
            href={`u/${user.user_name}/boards`}
            sx={{
              paddingX: 2, // Giảm padding ngang
              paddingY: 0.5, // Giảm padding dọc
              fontWeight: "bold",
              backgroundColor: "teal",
              fontSize: "0.8rem", // Giảm kích thước chữ
            }}
          >
            Đến bảng của bạn
          </Button>
        )}
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "10%",
          transform: "translateY(-50%)",
          textAlign: "left",
          maxWidth: "600px",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "2px",
            backgroundColor: "#000",
            marginBottom: "20px",
          }}
        ></Box>
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{ color: "#000", marginBottom: "20px", fontSize: "1rem" }}
        >
          Promanage - Giải Pháp Quản Lý Công Việc Thông Minh
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{ color: "#333", fontSize: "0.7rem", marginBottom: "15px" }}
        >
          Bạn đang tìm kiếm một công cụ giúp sắp xếp công việc cá nhân và nhóm
          một cách trực quan, khoa học? TaskFlow chính là trợ thủ đắc lực dành
          cho bạn!
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{ color: "#333", fontSize: "0.7rem", marginBottom: "15px" }}
        >
          🌟 Tính Năng Nổi Bật
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{ color: "#333", fontSize: "0.7rem", marginBottom: "10px" }}
        >
          ✔ Tạo và phân loại công việc theo từng cột (To-do, Doing, Done)
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{ color: "#333", fontSize: "0.7rem", marginBottom: "10px" }}
        >
          ✔ Giao việc, đặt deadline và theo dõi tiến độ chi tiết
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{ color: "#333", fontSize: "0.7rem", marginBottom: "10px" }}
        >
          ✔ Làm việc nhóm hiệu quả với tính năng bình luận, đính kèm file
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{ color: "#333", fontSize: "0.7rem", marginBottom: "10px" }}
        >
          ✔ Nhắc nhở thông minh tự động thông báo khi công việc sắp đến hạn
          hoặc có thay đổi quan trọng.
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{ color: "#333", fontSize: "0.7rem", marginBottom: "15px" }}
        >
          🚀 Tại Sao Chọn ProManage?
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{ color: "#333", fontSize: "0.7rem", marginBottom: "15px" }}
        >
          ✔ Dễ sử dụng
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{ color: "#333", fontSize: "0.7rem", marginBottom: "15px" }}
        >
          ✔ Tiết kiệm thời gian
        </Typography>
      </Box>
    </div>
  );
};

export default Home;

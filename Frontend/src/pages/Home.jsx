import React, { useEffect, useState } from "react";
import { Typography, Container, Paper, Button } from "@mui/material";
// import { useUser, loading, error } from "../contexts/userContext";
import { useStateContext } from "../contexts/ContextProvider";

const Home = () => {
  const { user, loading, error } = useStateContext() // Dùng context để lấy user
  const [currentIndex, setCurrentIndex] = useState(0);

  console.log(user)
  const slides = [
    { type: "image", src: "/img/sl1.webp" },
    { type: "image", src: "/img/pro manage.webp" },
    { type: "image", src: "/img/hi.webp" },
  ];

  const token  = localStorage.getItem('token');
  console.log(token);
  

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "white",
        }}
      >
        Đang tải thông tin người dùng...
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "red",
        }}
      >
        Lỗi: {error.message}
      </Container>
    );
  }

  return (
    <Container
      maxWidth={false}
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        background: "linear-gradient(to right, #283048, #859398)",

        color: "white",
        padding: 3,
      }}
    >
      <Typography
        variant="h1"
        fontWeight="bold"
        gutterBottom
        sx={{
          textTransform: "uppercase",
          letterSpacing: 2,
          textAlign: "center",
          fontFamily: "Pacifico, cursive",
          fontSize: "3rem",
          textShadow: "6px 6px 8px rgba(0, 0, 0, 0.3)",
        }}
      >
        Chào mừng bạn đến với PRO MANAGE
      </Typography>
      <Paper
        elevation={6}
        sx={{
          overflow: "hidden",
          width: "90%",
          height: "60vh",
          borderRadius: 2,
          marginBottom: 2,
          position: "relative",
        }}
      >
        {slides[currentIndex].type === "video" ? (
          <video width="100%" height="100%" controls autoPlay loop>
            <source src={slides[currentIndex].src} type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ thẻ video.
          </video>
        ) : (
          <img
            src={slides[currentIndex].src}
            alt={`Slide ${currentIndex + 1}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "opacity 1s ease-in-out",
            }}
          />
        )}
      </Paper>
      {user && (
        <Button
          variant="contained"
          color="primary"
          href={`u/${user.user_name}/boards`}
          sx={{ paddingX: 4, paddingY: 1, fontWeight: "bold" }}
        >
          Xem thông tin người dùng
        </Button>
      )}
    </Container>
  );
};

export default Home;

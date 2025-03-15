import React from "react";
import { Box, Button, Typography } from "@mui/material";
import dogLogo from "~/assets/dog.png?react";

const MissingInvitation = () => {
    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start", // 📌 Đưa nội dung lên trên
                backgroundColor: "#121212",
                color: "white",
                textAlign: "center",
                paddingTop: "15vh", // 📌 Đẩy nội dung lên trên khoảng 15% chiều cao màn hình
            }}
        >
            <Box
                component="img"
                src={dogLogo}
                alt="Error"
                sx={{ width: 140, height: 140, mb: 3 }} // 📌 Logo lớn hơn một chút
            />
            <Typography sx={{ fontSize: "2rem", fontWeight: "bold", mb: 1 }}>
                Chúng tôi gặp sự cố khi tải
            </Typography>
            <Typography sx={{ fontSize: "1rem", color: "gray", mb: 3 }}>
                Kiểm tra kết nối của bạn và thử làm mới trang.
            </Typography>
            <Button
                variant="contained"
                sx={{
                    mt: 3,
                    px: 4,
                    py: 1.5,
                    fontSize: "1rem",
                    backgroundColor: "#1976d2",
                    "&:hover": { backgroundColor: "#1565c0" },
                }}
                onClick={() => window.location.reload()} // 🔄 Reset lại trang
            >
                Thử lại
            </Button>
        </Box>
    );
};

export default MissingInvitation;

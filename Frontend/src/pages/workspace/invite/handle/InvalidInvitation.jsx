import { Box, Button, Typography } from "@mui/material";

const InvalidInvitation = () => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                bgcolor: "#212121",
                color: "white",
                textAlign: "center",
                px: 2,
            }}
        >
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, fontSize: "24px" }}>
                Bạn không thể tham gia Không gian làm việc này
            </Typography>
            <Typography variant="body1" sx={{ color: "gray", maxWidth: "500px", mb: 3, fontSize: "18px" }}>
                Liên kết mời có thể đã bị tắt hoặc Không gian làm việc miễn phí này có thể đã đạt đến giới hạn 10 người cộng tác.
                Bạn có thể yêu cầu tham gia Không gian làm việc hoặc thử liên hệ với người đã gửi liên kết cho bạn.
            </Typography>
            <Button variant="contained" sx={{ bgcolor: "#007bff", ":hover": { bgcolor: "#0056b3" } }}>
                Yêu cầu tham gia Không gian làm việc
            </Button>
        </Box>
    );
};

export default InvalidInvitation;

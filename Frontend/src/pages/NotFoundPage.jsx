import { Box, Typography, Link } from "@mui/material";
import { useStateContext } from "../contexts/ContextProvider";

const NotFoundPage = () => {
    const { user, token } = useStateContext(); // Lấy user và token từ context

    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#212529",
                color: "#fff",
                textAlign: "center",
            }}
        >
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
                Không tìm thấy trang
            </Typography>

            {!token ? (
                <Typography variant="body1" sx={{ maxWidth: "500px", mb: 3 }}>
                    Trang này có thể là riêng tư. Bạn có thể xem nó bằng cách{" "}
                    <Link href="/login" sx={{ color: "#1E90FF", textDecoration: "none" }}>
                        đăng nhập
                    </Link>
                    .
                </Typography>
            ) : (
                <Typography variant="body1" sx={{ maxWidth: "500px", mb: 3 }}>
                    Đây có thể là trang riêng tư. Nếu ai đó đã cung cấp cho bạn liên kết này thì
                    bạn có thể cần phải là thành viên hoặc không gian làm việc để truy cập trang.
                </Typography>
            )}

            <Typography variant="body2">
                Không phải{" "}
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                    {token && user?.full_name ? user.full_name : "Tài khoản của bạn"}
                </Typography>
                ?{" "}
                <Link href="/login" sx={{ color: "#1E90FF", textDecoration: "none" }}>
                    Chuyển Đổi Tài Khoản
                </Link>
            </Typography>
        </Box>
    );
};

export default NotFoundPage;

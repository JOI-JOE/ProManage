import React, { useState } from 'react';
import { Typography, Container, Box, Button } from '@mui/material';
import { useMe } from '../../../../contexts/MeContext';
import { useStateContext } from '../../../../contexts/ContextProvider';
import LogoLoading from '../../../../components/Common/LogoLoading';

const PrivatePage = () => {
    const { user } = useMe();
    const { setUser, setToken } = useStateContext();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = () => {
        setIsLoggingOut(true);

        // Giả lập quá trình đăng xuất trong 3 giây
        setTimeout(() => {
            setUser(null);
            setToken(null);
            // Nếu bạn muốn chuyển hướng sau khi đăng xuất, hãy bỏ comment dòng dưới
            // navigate('/login');
            setIsLoggingOut(false);
        }, 3000);
    };

    return (
        <Box
            sx={{
                bgcolor: '#ffffff',
                color: '#000000',
                display: 'flex',
                margin: "75px 34px",
                justifyContent: 'center'
            }}
        >
            <Container maxWidth="md">
                <Box sx={{ textAlign: 'center', maxWidth: '600px', mx: 'auto', px: 2 }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{
                            color: '#455a64',
                            fontWeight: 'bold',
                            mb: 3,
                            fontSize: '2rem',
                        }}
                    >
                        Không tìm thấy trang
                    </Typography>

                    <Typography
                        variant="body1"
                        paragraph
                        sx={{ lineHeight: 1.6 }}
                    >
                        Đây có thể là trang riêng tư. Nếu ai đó đã cung cấp cho bạn liên kết này thì bạn
                        có thể cần phải là thành viên bảng hoặc Không gian làm việc để truy cập trang.
                    </Typography>

                    <Typography variant="body1" sx={{ mt: 3 }}>
                        {isLoggingOut ? (
                            <Box sx={{ textAlign: 'center' }}>
                                <LogoLoading />
                            </Box>
                        ) : (
                            <>
                                Không phải <strong>{user?.full_name}</strong>?{' '}
                                <Button
                                    onClick={handleLogout}
                                    variant="text"
                                    disabled={isLoggingOut}
                                    sx={{
                                        color: '#3f8cff',
                                        p: 0,
                                        textTransform: 'none',
                                        fontWeight: 'normal',
                                        fontSize: '1rem',
                                        verticalAlign: 'baseline',
                                        minWidth: 'auto',
                                    }}
                                >
                                    Chuyển Đổi Tài Khoản
                                </Button>
                            </>
                        )}
                    </Typography>

                </Box>
            </Container>
        </Box>
    );
};

export default PrivatePage;
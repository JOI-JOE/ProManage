import React from 'react';
import {
    Box,
    Typography,
    Avatar,
    Button,
    SvgIcon,
} from '@mui/material';
import PrivateLeft from "~/assets/private_1.svg?react"
import PrivateRight from "~/assets/private_2.svg?react"
import LockIcon from "~/assets/lock.svg?react"

const SendRequest = () => {
    return (
        <>
            <Box
                sx={{
                    height: 'calc(100vh - 56px)', // Fix syntax height
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #e0f7fa 0%, #ffffff 100%)',
                    padding: '70px 20px',
                    position: 'relative', // Thêm relative để absolute positioning cho các icon
                }}
            >
                <SvgIcon
                    component={PrivateLeft}
                    sx={{
                        position: 'absolute',
                        left: 0,
                        bottom: 0,
                        width: 250,
                        height: 'auto',
                        opacity: 0.9,
                        fontSize: 'inherit',
                    }}
                    inheritViewBox
                />
                <SvgIcon
                    component={PrivateRight}
                    sx={{
                        position: 'absolute',
                        right: 0,
                        bottom: 0,
                        width: 300,
                        height: 'auto',
                        opacity: 0.9,
                        fontSize: 'inherit',
                    }}
                    inheritViewBox
                />

                {/* Card container */}
                <Box
                    sx={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        padding: '32px',
                        maxWidth: '550px',
                        width: '100%',
                        textAlign: 'center',
                    }}
                >
                    <Box display="flex" justifyContent="center" mb={3}>
                        <SvgIcon
                            component={LockIcon}
                            sx={{
                                width: 200,
                                height: 100,
                                transform: 'scale(1)',
                            }}
                            viewBox="0 0 24 24"
                            inheritViewBox
                        />
                    </Box>

                    {/* Title */}
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 'bold',
                            color: '#172b4d',
                            mb: 2,
                            fontSize: '20px'
                        }}
                    >
                        Bảng này là riêng tư.
                    </Typography>

                    {/* Description */}
                    <Typography
                        variant="body1"
                        sx={{
                            color: '#5e6c84',
                            mb: 3,
                            fontSize: '14px',
                            lineHeight: '20px'
                        }}
                    >
                        Gửi yêu cầu tới quản trị viên bảng này để có quyền truy cập. Nếu bạn được chấp thuận tham gia thì bạn sẽ nhận được một email.
                    </Typography>

                    <Box sx={{ borderTop: '1px solid #dfe1e6', my: 3 }} />

                    {/* User Info */}
                    <Box textAlign="left" mb={3}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                color: '#5e6c84',
                                mb: 1,
                                fontSize: '12px'
                            }}
                        >
                            Bạn đã đăng nhập với tư cách
                        </Typography>
                        <Box display="flex" justifyContent="space-between">
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Avatar sx={{
                                    bgcolor: '#0052cc',
                                    mr: 2,
                                    width: 32,
                                    height: 32,
                                    fontSize: '14px'
                                }}>NH</Avatar>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '14px' }}>
                                        Ngo Dang Hau (FPL HN)
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#5e6c84', fontSize: '12px' }}>
                                        haundph45649@fpt.edu.vn
                                    </Typography>
                                </Box>
                            </Box>

                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#0052cc',
                                    mt: 1,
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                Chuyển đổi tài khoản
                            </Typography>
                        </Box>

                    </Box>

                    {/* Additional Info */}
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#5e6c84',
                            mb: 3,
                            fontSize: '12px',
                            lineHeight: '16px',
                            textAlign: 'left'
                        }}
                    >
                        Bằng cách yêu cầu quyền truy cập, bạn đồng ý chia sẻ thông tin tài khoản Atlassian của mình, bao gồm cả địa chỉ email của bạn, với các quản trị viên bảng.
                    </Typography>

                    <Box sx={{ borderTop: '1px solid #dfe1e6', my: 3 }} />

                    {/* Send Request Button */}
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#0052cc',
                            borderRadius: '4px',
                            textTransform: 'none',
                            padding: '8px 16px',
                            fontSize: '14px',
                            fontWeight: '500',
                            width: '100%',
                            '&:hover': { backgroundColor: '#0065ff' }
                        }}
                    >
                        Gửi yêu cầu
                    </Button>
                </Box>
            </Box>
        </>
    );
};

export default SendRequest;

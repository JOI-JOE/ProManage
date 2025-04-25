import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

// Custom styled button for the "Tải Trello miễn phí" button
const DownloadButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#0052CC', // Trello's blue color
    color: '#FFFFFF',
    textTransform: 'none',
    padding: '6px 16px',
    borderRadius: '4px',
    '&:hover': {
        backgroundColor: '#003087', // Darker blue on hover
    },
}));

const Header = () => {
    return (
        <AppBar
            position="static"
            sx={{
                backgroundColor: '#0C1316', // Dark background matching the image
                boxShadow: 'none', // Remove default shadow for a flat look
            }}
        >
            <Toolbar sx={{ minHeight: 48, padding: '0 16px' }}>
                {/* Left side: Logo */}
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 'bold',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '1.25rem',
                        }}
                    >
                        {/* Placeholder for Trello logo (replace with actual icon/image) */}
                        <Box
                            component="span"
                            sx={{
                                width: 24,
                                height: 24,
                                backgroundColor: '#0052CC',
                                borderRadius: '4px',
                                mr: 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography sx={{ color: '#FFFFFF', fontSize: '0.875rem' }}>P</Typography>
                        </Box>
                        Promanage
                    </Typography>
                </Box>

                {/* Navigation links */}
                <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
                    <Typography
                        sx={{
                            color: '#FFFFFF',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' },
                        }}
                    >
                        Giai đoạn
                    </Typography>
                    <Typography
                        sx={{
                            color: '#FFFFFF',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' },
                        }}
                    >
                        Gói
                    </Typography>
                    <Typography
                        sx={{
                            color: '#FFFFFF',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' },
                        }}
                    >
                        Biểu phí
                    </Typography>
                    <Typography
                        sx={{
                            color: '#FFFFFF',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' },
                        }}
                    >
                        Tài liệu
                    </Typography>
                </Box>

                {/* Right side: Download button */}
                <DownloadButton variant="contained">
                    Login
                </DownloadButton>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
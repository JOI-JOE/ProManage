import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Avatar,
    Button,
    Divider
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import InitialsAvatar from '../../../../../components/Common/InitialsAvatar';

const Guest = ({ isAdmin, guests }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    return (
        <Box>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold', mb: 2 }}>
                Khách ({guests.length})
            </Typography>

            <Typography variant="body2" sx={{ mb: 2 }}>
                Khách chỉ có thể xem và chỉnh sửa bảng mà họ được thêm vào.
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold', mb: 2 }}>
                Khách một bảng thông tin ({guests.length})
            </Typography>

            <Typography variant="body2" sx={{ mb: 3 }}>
                Khách một bảng thông tin là thành viên của một bảng thông tin duy nhất trong Không gian làm việc và miễn phí nếu bạn dùng gói Premium.
            </Typography>

            <TextField
                fullWidth
                placeholder="Lọc theo tên"
                size="small"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '4px',
                    }
                }}
            />

            {
                guests.map((guest) => (
                    <Box key={guest.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: "space-between", mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <InitialsAvatar
                                name={guest?.user?.full_name}
                                avatarSrc={guest?.user.image}
                                initials={guest?.user?.initials}
                                size={32}
                            />
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    {guest?.user.full_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {guest?.user.email} • {guest.user.type}
                                </Typography>
                            </Box>
                        </Box>

                        {isAdmin && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        textTransform: 'none',
                                        bgcolor: '#EBEEF0',
                                        color: '#172B4D',
                                        '&:hover': { bgcolor: '#D8DEE4' }
                                    }}
                                >
                                    Thêm vào Không gian làm việc
                                </Button>

                                <Button
                                    variant="text"
                                    sx={{
                                        minWidth: '32px',
                                        borderRadius: '4px',
                                        color: '#57606f'
                                    }}
                                >
                                    <CloseIcon fontSize="small" />
                                </Button>
                            </Box>
                        )}

                    </Box>
                ))
            }
        </Box >
    );
};

export default Guest;
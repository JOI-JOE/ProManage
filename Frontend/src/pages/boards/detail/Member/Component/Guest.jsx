import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Divider
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useAddNewMemberToWorkspace } from '../../../../../hooks/useWorkspaceInvite';
import InitialsAvatar from '../../../../../components/Common/InitialsAvatar';
import LogoLoading from '../../../../../components/Common/LogoLoading';

const Guest = ({ isAdmin, guests: initialGuests, workspaceId }) => {
    const [loadingAdd, setLoadingAdd] = useState(null); // Trạng thái loading cho từng thành viên
    const [guests, setGuests] = useState(initialGuests); // Quản lý danh sách guests cục bộ
    const { mutateAsync: addMemberToWorkspace } = useAddNewMemberToWorkspace();

    const handleAddGuest = async (memberId) => {
        try {
            setLoadingAdd(memberId); // Cập nhật loading cho thành viên hiện tại
            await addMemberToWorkspace({ workspaceId, memberId }); // Gọi API để thêm thành viên

            // Xóa thành viên khỏi danh sách guests sau khi thêm thành công
            setGuests((prevGuests) =>
                prevGuests.filter((guest) => guest.user.id !== memberId)
            );

        } catch (error) {
            console.error("❌ Lỗi khi thêm thành viên:", error);
        } finally {
            setLoadingAdd(null); // Reset loading sau khi hoàn thành
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const safeSearch = typeof searchTerm === 'string' ? searchTerm.toLowerCase() : '';
    const filteredGuests = Array.isArray(guests)
        ? guests.filter(guest =>
            guest?.user?.full_name?.toLowerCase().includes(safeSearch)
        )
        : [];

    return (
        <Box>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold', mb: 2 }}>
                Khách ({guests?.length})
            </Typography>

            <Typography variant="body2" sx={{ mb: 2 }}>
                Khách chỉ có thể xem và chỉnh sửa bảng mà họ được thêm vào.
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold', mb: 2 }}>
                Khách một bảng thông tin ({guests?.length})
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

            {filteredGuests?.map((guest) => (
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
                            {loadingAdd === guest?.user?.id ? (
                                <Box sx={{ px: 2, py: 0.5 }}>
                                    <LogoLoading size={24} />
                                </Box>
                            ) : (
                                <Button
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        textTransform: 'none',
                                        bgcolor: '#EBEEF0',
                                        color: '#172B4D',
                                        '&:hover': { bgcolor: '#D8DEE4' }
                                    }}
                                    onClick={() => handleAddGuest(guest?.user?.id)}
                                >
                                    Thêm vào Không gian làm việc
                                </Button>
                            )}

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
            ))}
        </Box>
    );
};

export default Guest;
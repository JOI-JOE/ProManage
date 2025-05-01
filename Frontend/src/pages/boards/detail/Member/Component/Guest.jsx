import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Divider,
    Snackbar,
    Alert,
    Popover,
    Avatar
} from "@mui/material";
import InitialsAvatar from '../../../../../components/Common/InitialsAvatar';
import LogoLoading from '../../../../../components/Common/LogoLoading';
import { useAddNewMemberToWorkspace } from '../../../../../hooks/useWorkspaceInvite';

const Guest = ({ isAdmin, guests: initialGuests, workspaceId, boards }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingAdd, setLoadingAdd] = useState(null);
    const [guests, setGuests] = useState(initialGuests || []);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedGuest, setSelectedGuest] = useState(null);

    const { mutateAsync: addMemberToWorkspace } = useAddNewMemberToWorkspace();

    // Sync guests state with initialGuests prop
    useEffect(() => {
        setGuests(initialGuests || []);
    }, [initialGuests]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleAddGuest = async (memberId) => {
        if (!isAdmin) {
            setAlert({
                open: true,
                message: 'Bạn không có quyền thực hiện hành động này.',
                severity: 'error'
            });
            return;
        }

        if (!workspaceId || (typeof workspaceId !== 'string' && typeof workspaceId !== 'number')) {
            setAlert({
                open: true,
                message: 'ID Không gian làm việc không hợp lệ.',
                severity: 'error'
            });
            return;
        }

        try {
            setLoadingAdd(memberId);
            const response = await addMemberToWorkspace({ workspaceId, memberId });

            setGuests((prevGuests) =>
                prevGuests.filter((guest) => guest.user.id !== memberId)
            );

            setAlert({
                open: true,
                message: response.message || `Đã thêm thành viên vào Không gian làm việc.`,
                severity: 'success'
            });
        } catch (error) {
            setAlert({
                open: true,
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi thêm thành viên.',
                severity: 'error'
            });
            console.error("❌ Lỗi khi thêm thành viên:", error);
        } finally {
            setLoadingAdd(null);
        }
    };

    const handleCloseAlert = () => {
        setAlert({ ...alert, open: false });
    };

    const handleViewBoardsClick = (event, guest) => {
        setAnchorEl(event.currentTarget);
        setSelectedGuest(guest);
    };

    const handleClosePopover = () => {
        setAnchorEl(null);
        setSelectedGuest(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? "guest-boards-popover" : undefined;

    const safeSearch = typeof searchTerm === 'string' ? searchTerm.toLowerCase() : '';
    const filteredGuests = Array.isArray(guests)
        ? guests.filter(guest =>
            guest?.user?.full_name?.toLowerCase().includes(safeSearch)
        )
        : [];

    // Hàm lấy danh sách bảng mà guest thuộc về dựa trên user_id
    const getGuestBoards = (userId) => {
        if (!Array.isArray(boards)) return [];
        return boards.filter((board) =>
            board.members.some((bm) => bm.user_id === userId)
        );
    };

    return (
        <Box id="guest">
            <Snackbar
                open={alert.open}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
                    {alert.message}
                </Alert>
            </Snackbar>

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
            {filteredGuests?.map((guest) => {
                // Lấy danh sách bảng của guest hiện tại
                const guestBoards = getGuestBoards(guest.user.id);

                return (
                    <Box key={guest.user.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: "space-between", mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <InitialsAvatar
                                name={guest?.user?.full_name}
                                avatarSrc={guest?.user.image}
                                initials={guest?.user?.initials}
                                size={32}
                            />
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    {guest?.user.full_name} ({guest?.user?.initials || ''})
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    @{guest?.user.email.split('@')[0]} •
                                </Typography>
                            </Box>
                        </Box>

                        {isAdmin && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        textTransform: 'none',
                                        borderColor: '#EBEEF0',
                                        color: '#172B4D',
                                        '&:hover': { borderColor: '#D8DEE4' }
                                    }}
                                    onClick={(event) => handleViewBoardsClick(event, guest)}
                                >
                                    Xem bằng thông tin ({guestBoards.length})
                                </Button>
                                {loadingAdd === guest?.user?.id ? (
                                    <Box sx={{ px: 2, py: 0.5 }}>
                                        <LogoLoading scale={0.3} />
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
                            </Box>
                        )}
                    </Box>
                );
            })}

            {/* Popover hiển thị danh sách bảng */}
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClosePopover}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
                <Box sx={{ p: 2, width: 250 }}>
                    <Typography fontWeight="bold">Bảng thông tin</Typography>
                    <Typography variant="body2">
                        {selectedGuest?.user?.full_name || "Không xác định"} là thành viên của:
                    </Typography>
                    {selectedGuest && getGuestBoards(selectedGuest.user.id).length > 0 ? (
                        getGuestBoards(selectedGuest.user.id).map((board) => (
                            <Box
                                key={board.id}
                                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                            >
                                <Avatar src={board.thumbnail} sx={{ width: 30, height: 30 }} />
                                <Typography variant="body2">{board.name}</Typography>
                            </Box>
                        ))
                    ) : (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Chưa tham gia bảng nào
                        </Typography>
                    )}
                </Box>
            </Popover>
        </Box>
    );
};

export default Guest;
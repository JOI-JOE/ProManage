import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Divider,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import InitialsAvatar from '../../../../../components/Common/InitialsAvatar';
import LogoLoading from '../../../../../components/Common/LogoLoading';
import { useRemoveMember } from '../../../../../hooks/useWorkspace';
import { useAddNewMemberToWorkspace } from '../../../../../hooks/useWorkspaceInvite';

const Guest = ({ isAdmin, guests: initialGuests, workspaceId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingAdd, setLoadingAdd] = useState(null);
    const [loadingRemove, setLoadingRemove] = useState(null);
    const [guests, setGuests] = useState(initialGuests || []);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        userId: null,
        userName: ''
    });
    const { mutateAsync: addMemberToWorkspace } = useAddNewMemberToWorkspace();
    const { mutate: removeMember, isLoading: isRemovingMember } = useRemoveMember();

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

    const handleOpenConfirmDialog = (userId, userName) => {
        setConfirmDialog({
            open: true,
            userId: userId,
            userName: userName
        });
    };

    const handleCloseConfirmDialog = () => {
        setConfirmDialog({
            open: false,
            userId: null,
            userName: ''
        });
    };

    const handleRemoveGuest = () => {
        const userId = confirmDialog.userId;
        if (!userId) return;

        setLoadingRemove(userId);
        removeMember(
            {
                workspaceId,
                userId,
                moveType: 'guest' // Specify move_type for guest removal
            },
            {
                onSuccess: () => {
                    setGuests((prevGuests) =>
                        prevGuests.filter((guest) => guest.user.id !== userId)
                    );
                    setAlert({
                        open: true,
                        message: `Đã xóa khách ${confirmDialog.userName} khỏi Không gian làm việc.`,
                        severity: 'success'
                    });
                    handleCloseConfirmDialog();
                },
                onError: (error) => {
                    setAlert({
                        open: true,
                        message: error.response?.data?.message || 'Đã xảy ra lỗi khi xóa khách.',
                        severity: 'error'
                    });
                    console.error("❌ Lỗi khi xóa khách:", error);
                },
                onSettled: () => {
                    setLoadingRemove(null);
                }
            }
        );
    };

    const handleCloseAlert = () => {
        setAlert({ ...alert, open: false });
    };

    const safeSearch = typeof searchTerm === 'string' ? searchTerm.toLowerCase() : '';
    const filteredGuests = Array.isArray(guests)
        ? guests.filter(guest =>
            guest?.user?.full_name?.toLowerCase().includes(safeSearch)
        )
        : [];

    return (
        <Box>
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

            <Dialog
                open={confirmDialog.open}
                onClose={handleCloseConfirmDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Xóa khách"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Đã gỡ khỏi Không gian làm việc.<br />
                        Xóa toàn bộ truy cập tới Không gian làm việc. Họ sẽ nhận được thông báo.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDialog} color="primary">
                        Hủy
                    </Button>
                    <Button
                        onClick={handleRemoveGuest}
                        color="error"
                        variant="contained"
                        autoFocus
                        disabled={loadingRemove === confirmDialog.userId || isRemovingMember}
                    >
                        {loadingRemove === confirmDialog.userId ? (
                            <LogoLoading size={20} />
                        ) : (
                            'Xóa'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

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
                                    <LogoLoading size={20} />
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
                            {/* <Button
                                variant="text"
                                sx={{
                                    minWidth: '32px',
                                    borderRadius: '4px',
                                    color: '#57606f'
                                }}
                                onClick={() => handleOpenConfirmDialog(guest?.user?.id, guest?.user?.full_name)}
                                disabled={loadingRemove === guest?.user?.id}
                            >
                                {loadingRemove === guest?.user?.id ? (
                                    <LogoLoading size={20} />
                                ) : (
                                    <CloseIcon fontSize="small" />
                                )}
                            </Button> */}
                        </Box>
                    )}
                </Box>
            ))}
        </Box>
    );
};

export default Guest;
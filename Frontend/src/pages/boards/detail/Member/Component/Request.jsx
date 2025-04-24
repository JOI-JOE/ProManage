import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Checkbox,
    Button,
    FormControlLabel,
    Snackbar,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import InitialsAvatar from '../../../../../components/Common/InitialsAvatar';
import LogoLoading from '../../../../../components/Common/LogoLoading';
import { useAddNewMemberToWorkspace } from '../../../../../hooks/useWorkspaceInvite';
import { useRemoveMember } from '../../../../../hooks/useWorkspace';

const Request = ({ requests, workspaceId, isAdmin }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [loadingAdd, setLoadingAdd] = useState(null); // Loading state for adding
    const [loadingRemove, setLoadingRemove] = useState(null); // Loading state for removing
    const [pendingRequests, setPendingRequests] = useState(requests || []); // Manage pending requests list
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' }); // Alert state
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        userId: null,
        userName: ''
    }); // Confirm dialog state

    const { mutateAsync: addMemberToWorkspace } = useAddNewMemberToWorkspace();
    const { mutate: removeMember, isLoading: isRemovingMember } = useRemoveMember();

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSelectAll = (event) => {
        const checked = event.target.checked;
        setSelectAll(checked);
        if (checked) {
            setSelectedRequests(pendingRequests.map(req => req.id));
        } else {
            setSelectedRequests([]);
        }
    };

    const handleAddRequest = async (memberId) => {
        if (!isAdmin) {
            setAlert({
                open: true,
                message: 'Bạn không có quyền thực hiện hành động này.',
                severity: 'error'
            });
            return;
        }

        try {
            setLoadingAdd(memberId);
            const response = await addMemberToWorkspace({ workspaceId, memberId });

            // Remove the approved request from the list
            setPendingRequests((prevRequests) =>
                prevRequests.filter((request) => request.user.id !== memberId)
            );

            setAlert({
                open: true,
                message: response.message || 'Đã chấp thuận yêu cầu tham gia thành công.',
                severity: 'success'
            });

        } catch (error) {
            setAlert({
                open: true,
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi xử lý yêu cầu.',
                severity: 'error'
            });
        } finally {
            setLoadingAdd(null);
        }
    };

    // Mở dialog xác nhận trước khi xóa
    const handleOpenConfirmDialog = (userId, userName) => {
        setConfirmDialog({
            open: true,
            userId: userId,
            userName: userName
        });
    };

    // Đóng dialog xác nhận
    const handleCloseConfirmDialog = () => {
        setConfirmDialog({
            open: false,
            userId: null,
            userName: ''
        });
    };

    // Xử lý khi xác nhận xóa
    const handleRemoveRequest = async () => {
        const userId = confirmDialog.userId;
        if (!userId) return;

        try {
            setLoadingRemove(userId);
            await removeMember({ workspaceId, memberId: userId });

            // Cập nhật danh sách yêu cầu
            setPendingRequests((prevRequests) =>
                prevRequests.filter((request) => request.user.id !== userId)
            );

            setAlert({
                open: true,
                message: 'Đã loại bỏ yêu cầu thành công.',
                severity: 'success'
            });
        } catch (error) {
            setAlert({
                open: true,
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi xóa yêu cầu.',
                severity: 'error'
            });
        } finally {
            setLoadingRemove(null);
            handleCloseConfirmDialog();
        }
    };

    const handleCloseAlert = () => {
        setAlert({ ...alert, open: false });
    };

    const safeSearch = typeof searchTerm === 'string' ? searchTerm.toLowerCase() : '';
    const filteredRequests = Array.isArray(pendingRequests)
        ? pendingRequests.filter(request =>
            request?.user?.full_name?.toLowerCase().includes(safeSearch)
        )
        : [];

    return (
        <Box>
            {/* Alert Snackbar */}
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

            {/* Dialog xác nhận xóa */}
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
                        onClick={handleRemoveRequest}
                        color="error"
                        variant="contained"
                        autoFocus
                        disabled={loadingRemove === confirmDialog.userId}
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
                Yêu cầu tham gia ({pendingRequests?.length || 0})
            </Typography>

            <Typography variant="body2" sx={{ mb: 3 }}>
                Những người này đã yêu cầu tham gia Không gian làm việc này. Thêm thành viên Không gian làm việc mới sẽ tự động cập nhật hóa đơn của bạn.
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

            <FormControlLabel
                control={
                    <Checkbox
                        checked={selectAll}
                        onChange={handleSelectAll}
                        size="small"
                    />
                }
                label="Chọn tất cả"
                sx={{ mb: 2 }}
            />

            {filteredRequests?.map((request) => (
                <Box key={request.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Checkbox
                            checked={selectedRequests.includes(request.id)}
                            onChange={(e) => {
                                setSelectedRequests((prev) =>
                                    e.target.checked
                                        ? [...prev, request.id]
                                        : prev.filter((id) => id !== request.id)
                                );
                            }}
                            size="small"
                        />
                        <InitialsAvatar
                            name={request?.user?.full_name}
                            avatarSrc={request?.user.image}
                            initials={request?.user?.initials}
                            size={32}
                        />
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {request.user.full_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {request.user.email} • {request.user.type}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                            Đã gửi yêu cầu {request.requestDate}
                        </Typography>
                        {isAdmin && (
                            <>
                                {loadingAdd === request?.user?.id ? (
                                    <Box sx={{ px: 2, py: 0.5 }}>
                                        <LogoLoading size={24} />
                                    </Box>
                                ) : (
                                    <Button
                                        variant="contained"
                                        size="small"
                                        sx={{
                                            textTransform: 'none',
                                            bgcolor: '#0052CC',
                                            color: 'white',
                                            '&:hover': { bgcolor: '#0747A6' }
                                        }}
                                        onClick={() => handleAddRequest(request?.user?.id)}
                                    >
                                        Chấp thuận yêu cầu
                                    </Button>
                                )}
                            </>
                        )}
                        <Button
                            variant="text"
                            sx={{
                                minWidth: '32px',
                                borderRadius: '4px',
                                color: '#57606f'
                            }}
                            onClick={() => handleOpenConfirmDialog(request?.user?.id, request?.user?.full_name)}
                            disabled={loadingRemove === request?.user?.id}
                        >
                            {loadingRemove === request?.user?.id ? (
                                <LogoLoading scale={20} />
                            ) : (
                                <CloseIcon fontSize="small" />
                            )}
                        </Button>
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export default Request;
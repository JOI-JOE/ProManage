import React, { useState, useEffect } from 'react';
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
    const [loadingAdd, setLoadingAdd] = useState(null);
    const [loadingRemove, setLoadingRemove] = useState(null);
    const [pendingRequests, setPendingRequests] = useState(requests || []);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        userId: null,
        userName: '',
        isBulk: false
    });
    const [bulkProcessing, setBulkProcessing] = useState(false);

    const { mutateAsync: addMemberToWorkspace } = useAddNewMemberToWorkspace();
    const { mutate: removeMember, isLoading: isRemovingMember } = useRemoveMember();

    // Sync pendingRequests with requests prop whenever it changes
    useEffect(() => {
        setPendingRequests(requests || []);
        // Reset selection when requests change to avoid stale IDs
        setSelectedRequests([]);
        setSelectAll(false);
    }, [requests]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSelectAll = (event) => {
        const checked = event.target.checked;
        setSelectAll(checked);
        if (checked) {
            // Select all user IDs from pendingRequests
            const allUserIds = pendingRequests.map(req => req.user.id);
            setSelectedRequests(allUserIds);
        } else {
            setSelectedRequests([]);
        }
    };

    const handleSingleSelect = (userId, checked) => {
        setSelectedRequests((prev) =>
            checked
                ? [...prev, userId]
                : prev.filter((id) => id !== userId)
        );
        // Update selectAll state if selection changes
        setSelectAll(checked && selectedRequests.length + 1 === pendingRequests.length);
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

            // Optimistically remove the approved request
            setPendingRequests((prev) => prev.filter((req) => req.user.id !== memberId));
            setSelectedRequests((prev) => prev.filter((id) => id !== memberId));

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
            console.error("❌ Lỗi khi thêm thành viên:", error);
        } finally {
            setLoadingAdd(null);
        }
    };

    const handleBulkAddRequests = async () => {
        if (!isAdmin || selectedRequests.length === 0) return;

        setBulkProcessing(true);
        let successCount = 0;
        let errorCount = 0;

        for (const userId of selectedRequests) {
            try {
                await addMemberToWorkspace({ workspaceId, memberId: userId });
                successCount++;
            } catch (error) {
                console.error(`❌ Lỗi khi thêm thành viên ID ${userId}:`, error);
                errorCount++;
            }
        }

        // Update state
        setPendingRequests((prev) => prev.filter((req) => !selectedRequests.includes(req.user.id)));
        setSelectedRequests([]);
        setSelectAll(false);

        setAlert({
            open: true,
            message: `Đã thêm ${successCount} thành viên thành công${errorCount > 0 ? `, ${errorCount} yêu cầu thất bại` : ''}.`,
            severity: errorCount > 0 ? 'warning' : 'success'
        });

        setBulkProcessing(false);
    };

    const handleOpenConfirmDialog = (userId, userName, isBulk = false) => {
        setConfirmDialog({
            open: true,
            userId,
            userName,
            isBulk
        });
    };

    const handleCloseConfirmDialog = () => {
        setConfirmDialog({
            open: false,
            userId: null,
            userName: '',
            isBulk: false
        });
    };

    const handleRemoveRequest = () => {
        const { userId, isBulk } = confirmDialog;

        if (isBulk) {
            handleBulkRemoveRequests();
            return;
        }

        if (!userId) return;

        setLoadingRemove(userId);
        removeMember(
            {
                workspaceId,
                userId,
                moveType: 'request'
            },
            {
                onSuccess: () => {
                    setPendingRequests((prev) => prev.filter((req) => req.user.id !== userId));
                    setSelectedRequests((prev) => prev.filter((id) => id !== userId));
                    setAlert({
                        open: true,
                        message: `Đã hủy yêu cầu của ${confirmDialog.userName} khỏi Không gian làm việc.`,
                        severity: 'success'
                    });
                    handleCloseConfirmDialog();
                },
                onError: (error) => {
                    setAlert({
                        open: true,
                        message: error.response?.data?.message || 'Đã xảy ra lỗi khi xóa yêu cầu.',
                        severity: 'error'
                    });
                    console.error("❌ Lỗi khi xóa yêu cầu:", error);
                },
                onSettled: () => {
                    setLoadingRemove(null);
                }
            }
        );
    };

    const handleBulkRemoveRequests = async () => {
        if (!isAdmin || selectedRequests.length === 0) return;

        setBulkProcessing(true);
        let successCount = 0;
        let errorCount = 0;

        // Process all selected requests in parallel
        await Promise.all(
            selectedRequests.map(
                (userId) =>
                    new Promise((resolve) => {
                        removeMember(
                            {
                                workspaceId,
                                userId,
                                moveType: 'request'
                            },
                            {
                                onSuccess: () => {
                                    successCount++;
                                    resolve();
                                },
                                onError: (error) => {
                                    console.error(`❌ Lỗi khi xóa yêu cầu ID ${userId}:`, error);
                                    errorCount++;
                                    resolve();
                                }
                            }
                        );
                    })
            )
        );

        // Update state
        setPendingRequests((prev) => prev.filter((req) => !selectedRequests.includes(req.user.id)));
        setSelectedRequests([]);
        setSelectAll(false);

        setAlert({
            open: true,
            message: `Đã từ chối ${successCount} yêu cầu thành công${errorCount > 0 ? `, ${errorCount} yêu cầu thất bại` : ''}.`,
            severity: errorCount > 0 ? 'warning' : 'success'
        });

        handleCloseConfirmDialog();
        setBulkProcessing(false);
    };

    const handleCloseAlert = () => {
        setAlert({ ...alert, open: false });
    };

    const safeSearch = typeof searchTerm === 'string' ? searchTerm.toLowerCase() : '';
    const filteredRequests = Array.isArray(pendingRequests)
        ? pendingRequests.filter((request) =>
            request?.user?.full_name?.toLowerCase().includes(safeSearch)
        )
        : [];

    const hasSelectedRequests = selectedRequests.length > 0;

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
                    {confirmDialog.isBulk ? 'Xóa nhiều yêu cầu' : 'Xóa yêu cầu'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {confirmDialog.isBulk
                            ? `Bạn có chắc chắn muốn từ chối ${selectedRequests.length} yêu cầu tham gia Không gian làm việc?`
                            : `Từ chối yêu cầu tham gia của ${confirmDialog.userName} vào Không gian làm việc.`}
                        <br />
                        Người dùng sẽ nhận được thông báo về việc từ chối yêu cầu.
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
                        disabled={loadingRemove === confirmDialog.userId || isRemovingMember || bulkProcessing}
                    >
                        {loadingRemove === confirmDialog.userId || bulkProcessing ? (
                            <LogoLoading scale={0.3} />
                        ) : (
                            'Từ chối'
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={selectAll}
                            onChange={handleSelectAll}
                            size="small"
                        />
                    }
                    label={`Chọn tất cả ${selectedRequests.length > 0 ? `(${selectedRequests.length})` : ''}`}
                />

                {isAdmin && hasSelectedRequests && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            size="small"
                            sx={{
                                textTransform: 'none',
                                bgcolor: '#F1F2F6',
                                color: '#202124',
                                boxShadow: 'none',
                                '&:hover': { bgcolor: '#E8EAED' }
                            }}
                            onClick={handleBulkAddRequests}
                            disabled={bulkProcessing}
                        >
                            {bulkProcessing ? <LogoLoading scale={0.3} /> : `Thêm mục đã chọn vào Không gian làm việc`}
                        </Button>
                    </Box>
                )}
            </Box>

            {filteredRequests?.map((request) => (
                <Box key={request.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Checkbox
                            checked={selectedRequests.includes(request.user.id)}
                            onChange={(e) => handleSingleSelect(request.user.id, e.target.checked)}
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
                                        <LogoLoading scale={0.3} />
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
                                        Chấp thuận
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
                                <LogoLoading scale={0.3} />
                            ) : (
                                <CloseIcon fontSize="small" />
                            )}
                        </Button>
                    </Box>
                </Box>
            ))}

            {filteredRequests.length === 0 && (
                <Typography variant="body2" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    Không có yêu cầu tham gia nào{searchTerm ? ' phù hợp với tìm kiếm' : ''}
                </Typography>
            )}
        </Box>
    );
};

export default Request;
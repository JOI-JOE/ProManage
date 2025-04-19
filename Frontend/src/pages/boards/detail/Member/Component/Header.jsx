import React, { useEffect, useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Chip,
    IconButton,
    Typography,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    FormControlLabel,
    Link
} from '@mui/material';
import {
    Edit,
    Public,
    PersonAdd,
    Link as LinkIcon
} from '@mui/icons-material';
import WorkspaceAvatar from '../../../../../components/Common/WorkspaceAvatar';

const Header = ({ workspace }) => {
    const [open, setOpen] = useState(false);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        shortName: '',
        description: ''
    });
    const [emailDelivery, setEmailDelivery] = useState(false);

    useEffect(() => {
        if (workspace) {
            setFormData({
                name: workspace.display_name || '',
                shortName: workspace.name || '',
                description: workspace.description || ''
            });
            setIsPublic(workspace.permission_level === 'public');
        }
    }, [workspace]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleInviteDialogOpen = () => setInviteDialogOpen(true);
    const handleInviteDialogClose = () => setInviteDialogOpen(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEmailDeliveryChange = (e) => {
        setEmailDelivery(e.target.checked);
    };

    const handleSave = () => {
        console.log('Saving:', formData);
        handleClose();
    };

    const handleInvite = () => {
        console.log('Inviting members...');
        handleInviteDialogClose();
    };

    return (
        <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WorkspaceAvatar sx={{ m: 1 }} size={60} workspace={workspace} />
                <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h5" fontWeight="500">
                            {formData.name}
                        </Typography>
                        <IconButton size="small" sx={{ ml: 1 }} onClick={handleOpen}>
                            <Edit fontSize="small" />
                        </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        {isPublic && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Public fontSize="small" sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    Công khai
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        bgcolor: '#1976d2',
                        px: 2
                    }}
                    onClick={handleInviteDialogOpen}
                >
                    Mời các thành viên Không gian làm việc
                </Button>
            </Box>
            {formData.description && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                    {formData.description}
                </Typography>
            )}
            <Box
                sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    mt: 3
                }}
            />

            {/* Edit Form Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Cập nhật thông tin</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Tên *"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                    />
                    <TextField
                        margin="dense"
                        label="Tên ngắn gọn *"
                        name="shortName"
                        value={formData.shortName}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                    />
                    <TextField
                        margin="dense"
                        label="Mô tả (tùy chọn)"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={4}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="outlined">
                        Hủy
                    </Button>
                    <Button onClick={handleSave} variant="contained" color="primary">
                        Lưu
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Invite Members Dialog */}
            <Dialog open={inviteDialogOpen} onClose={handleInviteDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Mời vào Không gian làm việc
                    <IconButton
                        onClick={handleInviteDialogClose}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={emailDelivery}
                                onChange={handleEmailDeliveryChange}
                                color="primary"
                            />
                        }
                        label="Gửi chi tiết qua email hoặc tên"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Lọc theo tên"
                        placeholder="Nhập email hoặc tên để tìm kiếm thành viên..."
                        fullWidth
                        variant="outlined"
                    />
                    <Typography variant="body2" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
                        Mời vào Không gian làm việc này bằng liên kết:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinkIcon sx={{ color: 'text.secondary' }} />
                        <Link
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            sx={{ color: '#1976d2', textDecoration: 'none' }}
                        >
                            Mời bằng liên kết
                        </Link>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default Header;
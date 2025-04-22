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
    Autocomplete
} from '@mui/material';
import {
    Edit,
    Public,
    PersonAdd,
    Link as LinkIcon,
    Lock
} from '@mui/icons-material';
import WorkspaceAvatar from '../../../../../components/Common/WorkspaceAvatar';
import { useDebouncedMemberSearch } from './Search';
import { useConfirmWorkspaceMember, useCreateInviteWorkspace, useCancelInvitationWorkspace } from '../../../../../hooks/useWorkspaceInvite';
import { useUpdateInforWorkspace } from '../../../../../hooks/useWorkspace';
import LogoLoading from '../../../../../components/Common/LogoLoading';

const Header = ({ workspace }) => {
    const [open, setOpen] = useState(false);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        shortName: '',
        description: ''
    });
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [inviteMessage, setInviteMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [inputError, setInputError] = useState('');

    const {
        inputValue,
        handleInputChange,
        options,
        open: autocompleteOpen,
        isLoading,
    } = useDebouncedMemberSearch(workspace?.id);

    const { mutate: confirmMember } = useConfirmWorkspaceMember();


    useEffect(() => {
        if (workspace) {
            setFormData({
                name: workspace.display_name || '',
                shortName: workspace.name || '',
                description: workspace.desc || ''
            });
            setIsPublic(workspace.permission_level === 'public');
        }
    }, [workspace]);

    // Mời người dung ---------------------------------------------------------------------
    const handleInviteDialogOpen = () => setInviteDialogOpen(true);
    const handleInviteDialogClose = () => {
        if (isProcessing) return;
        setInviteDialogOpen(false);
        setSelectedMembers([]);
        setInviteMessage('');
        setInviteLink('');
        setLinkCopied(false);
        setInputError('');
        handleInputChange(null, '', 'reset');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleMemberSelect = (event, newValue) => {
        setInputError('');
        if (typeof newValue === 'string') {
            const trimmedValue = newValue.trim();
            // Check if the email already exists in the options and the user is a member
            const existingMember = options.find(
                (option) => option.email === trimmedValue && option.joined === true
            );
            if (existingMember) {
                setInputError('Email này đã là thành viên của Không gian làm việc.');
                return;
            }
            // Check if the email is valid and not already selected
            if (isValidEmail(trimmedValue) && !selectedMembers.some((member) => member.email === trimmedValue)) {
                setSelectedMembers([...selectedMembers, { email: trimmedValue, isCustom: true }]);
            } else {
                setInputError(
                    isValidEmail(trimmedValue)
                        ? 'Email này đã được chọn.'
                        : 'Vui lòng nhập email hợp lệ.'
                );
            }
        } else if (newValue && !selectedMembers.some((member) => member.id === newValue.id) && !newValue.joined) {
            setSelectedMembers([...selectedMembers, newValue]);
        }
    };

    const handleMemberDelete = (identifier) => {
        setSelectedMembers(selectedMembers.filter((member) =>
            member.id ? member.id !== identifier : member.email !== identifier
        ));
    };

    const handleInviteMessageChange = (e) => {
        setInviteMessage(e.target.value);
    };

    const handleSendInvitations = async () => {
        if (!selectedMembers.length) return;
        setIsProcessing(true);
        try {
            for (const member of selectedMembers) {
                if (member.isCustom) {
                    console.log(`Inviting via email: ${member.email}`);
                } else {
                    await confirmMember({
                        workspaceId: workspace.id,
                        memberId: member.id,
                        invitationMessage: inviteMessage,
                    });
                }
            }
            handleInviteDialogClose();
        } catch (error) {
            console.error("❌ Error sending invitations:", error);
        } finally {
            setIsProcessing(false);
        }
    };
    // Mời người dung ---------------------------------------------------------------------

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
    };

    const { mutateAsync: updateWorkspace } = useUpdateInforWorkspace();
    const [updateLoading, setUpdateLoading] = useState(false);
    const handleSave = async () => {
        setUpdateLoading(true); // 👈 Bắt đầu loading
        try {
            await updateWorkspace({
                id: workspace.id,
                data: {
                    display_name: formData.name,
                    name: formData.shortName,
                    description: formData.description,
                },
            });
            handleClose();
            console.log('✅ Cập nhật thông tin thành công');
        } catch (error) {
            console.error('❌ Lỗi cập nhật thông tin:', error);
        } finally {
            setUpdateLoading(false); // 👈 Kết thúc loading dù thành công hay lỗi
        }
    };

    return (
        <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WorkspaceAvatar size={60} workspace={workspace} />
                <Box sx={{ flexGrow: 1, ml: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h5" fontWeight="500" fontSize={30}>
                            {formData.name.length > 30
                                ? `${formData.name.slice(0, 30)}...`
                                : formData.name}
                        </Typography>
                        <IconButton size="small" sx={{ ml: 1 }} onClick={handleOpen}>
                            <Edit fontSize="small" />
                        </IconButton>

                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        {isPublic ? (
                            <>
                                <Public fontSize="small" sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    Công khai
                                </Typography>
                            </>
                        ) : (
                            <>
                                <Lock fontSize="small" sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    Riêng tư
                                </Typography>
                            </>
                        )}
                    </Box>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#1976d2', px: 2 }}
                    onClick={handleInviteDialogOpen}
                >
                    Mời các thành viên
                </Button>
            </Box>
            {formData.description && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                    {formData.description}
                </Typography>
            )}
            <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mt: 3 }} />

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Cập nhật thông tin</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        placeholder="Tên Không gian làm việc *"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                    />
                    <TextField
                        margin="dense"
                        placeholder="Tên ngắn gọn *"
                        name="shortName"
                        value={formData.shortName}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                    />
                    <TextField
                        margin="dense"
                        placeholder="Mô tả"
                        variant="outlined"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={4}
                    />
                </DialogContent>
                <DialogActions>
                    {updateLoading ? (
                        <LogoLoading />
                    ) : (
                        <>
                            <Button onClick={handleClose} variant="outlined">
                                Hủy
                            </Button>

                            <Button
                                onClick={handleSave}
                                variant="contained"
                                color="primary"
                                disabled={!formData.name.trim() || !formData.shortName.trim()}
                            >
                                Lưu
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            <Dialog open={inviteDialogOpen} onClose={handleInviteDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Mời vào Không gian làm việc
                    <IconButton
                        onClick={handleInviteDialogClose}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                        disabled={isProcessing}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {selectedMembers.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {selectedMembers.map((member) => (
                                <Chip
                                    key={member.id || member.email}
                                    label={member.full_name || member.email}
                                    onDelete={() => handleMemberDelete(member.id || member.email)}
                                    sx={{ bgcolor: '#e0e0e0' }}
                                    disabled={isProcessing}
                                />
                            ))}
                        </Box>
                    )}
                    <Autocomplete
                        open={autocompleteOpen}
                        options={options}
                        loading={isLoading}
                        freeSolo
                        inputValue={inputValue}
                        onInputChange={handleInputChange}
                        onChange={handleMemberSelect}
                        getOptionLabel={(option) => (typeof option === 'string' ? option : option.full_name || option.email || '')}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                margin="dense"
                                // label="Lọc theo tên hoặc email"
                                placeholder="Nhập email hoặc chọn thành viên..."
                                fullWidth
                                variant="outlined"
                                error={!!inputError}
                                helperText={inputError}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar
                                        sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}
                                        src={typeof option === 'string' ? '' : option.image || ''}
                                    >
                                        {typeof option === 'string' ? option.charAt(0) : option.initials || option.full_name?.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body1">
                                            {typeof option === 'string' ? option : option.full_name || option.email}
                                        </Typography>
                                        {typeof option !== 'string' && (
                                            <Typography variant="caption" color="text.secondary">
                                                {option.joined
                                                    ? `${option.memberType === 'admin' ? 'Quản trị viên' : 'Thành viên'} Không gian làm việc`
                                                    : 'Không phải thành viên'}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </li>
                        )}
                        isOptionDisabled={(option) => typeof option !== 'string' && option.joined === true}
                        disabled={isProcessing}
                    />
                    <TextField
                        margin="dense"
                        // label="Thêm một tin nhắn (tùy chọn)"
                        placeholder="Tham gia Không gian làm việc này để cộng tác!"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={2}
                        value={inviteMessage}
                        onChange={handleInviteMessageChange}
                        sx={{ mt: 2 }}
                        disabled={isProcessing}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleInviteDialogClose} variant="outlined" disabled={isProcessing}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSendInvitations}
                        variant="contained"
                        color="primary"
                        disabled={isProcessing || selectedMembers.length === 0}
                    >
                        {isProcessing ? 'Đang gửi...' : 'Gửi lời mời'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Header;
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
    Link,
    Autocomplete
} from '@mui/material';
import {
    Edit,
    Public,
    PersonAdd,
    Link as LinkIcon
} from '@mui/icons-material';
import WorkspaceAvatar from '../../../../../components/Common/WorkspaceAvatar';
import { useDebouncedMemberSearch } from './Search';
import { useConfirmWorkspaceMember, useCreateInviteWorkspace, useCancelInvitationWorkspace } from '../../../../../hooks/useWorkspaceInvite';
import { Box as LogoBox, SvgIcon } from "@mui/material";

const Header = ({ workspace }) => {
    const [open, setOpen] = useState(false);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        shortName: '',
        description: ''
    });
    const [selectedMembers, setSelectedMembers] = useState([]); // State for selected members (can include emails)
    const [inviteMessage, setInviteMessage] = useState(''); // State for invite message
    const [isProcessing, setIsProcessing] = useState(false); // State for loading during invitation
    const [linkCopied, setLinkCopied] = useState(false); // State for invite link copy status
    const [inviteLink, setInviteLink] = useState(''); // State for the generated invite link
    const [inputError, setInputError] = useState(''); // State for input validation error

    // Initialize hooks
    const {
        inputValue,
        handleInputChange,
        options,
        open: autocompleteOpen,
        isLoading,
    } = useDebouncedMemberSearch(workspace?.id);

    const { mutate: confirmMember } = useConfirmWorkspaceMember();
    const { mutate: createInviteLink, isLoading: isCreatingInvite } = useCreateInviteWorkspace();
    const { mutate: cancelInviteLink, isLoading: isCancelingInvite } = useCancelInvitationWorkspace();

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
    const handleClose = () => {
        setOpen(false);
        // Reset formData về giá trị ban đầu của workspace khi đóng dialog
        setFormData({
            name: workspace.display_name || '',
            shortName: workspace.name || '',
            description: workspace.description || ''
        });
    };

    const handleInviteDialogOpen = () => setInviteDialogOpen(true);
    const handleInviteDialogClose = () => {
        if (isProcessing) return; // Prevent closing while processing
        setInviteDialogOpen(false);
        // Reset tất cả các state liên quan khi đóng dialog
        setSelectedMembers([]);
        setInviteMessage('');
        setInviteLink('');
        setLinkCopied(false);
        setInputError('');
        // Reset inputValue của Autocomplete
        handleInputChange(null, '', 'reset');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        console.log('Saving:', formData);
        handleClose();
    };

    // Simple email validation
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleMemberSelect = (event, newValue) => {
        setInputError(''); // Clear any previous error

        // If newValue is a string (custom input), validate it as an email
        if (typeof newValue === 'string') {
            const trimmedValue = newValue.trim();
            if (isValidEmail(trimmedValue) && !selectedMembers.some((member) => member.email === trimmedValue)) {
                setSelectedMembers([...selectedMembers, { email: trimmedValue, isCustom: true }]);
            } else {
                setInputError('Vui lòng nhập email hợp lệ (ví dụ: example@domain.com).');
            }
        }
        // If newValue is an object (selected from search results), check if not already selected and not joined
        else if (newValue && !selectedMembers.some((member) => member.id === newValue.id) && !newValue.joined) {
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

    // Function to send invitations
    const handleSendInvitations = async () => {
        if (!selectedMembers.length) return;

        setIsProcessing(true); // Start loading

        try {
            for (const member of selectedMembers) {
                if (member.isCustom) {
                    console.log(`Inviting via email: ${member.email}`);
                    // Replace with actual API call to invite by email
                    // await inviteByEmail({ workspaceId: workspace.id, email: member.email, invitationMessage: inviteMessage });
                } else {
                    await confirmMember({
                        workspaceId: workspace.id,
                        memberId: member.id,
                        invitationMessage: inviteMessage,
                    });
                }
            }
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
            handleInviteDialogClose(); // Close dialog after success
        } catch (error) {
            console.error("❌ Error sending invitations:", error);
        } finally {
            setIsProcessing(false); // Stop loading
        }
    };

    // Function to copy the invite link to clipboard
    const handleCopyLink = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink);
            setLinkCopied(true);
        }
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
                        disabled={isProcessing}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {/* Selected Members as Chips */}
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

                    {/* Autocomplete for Member Search */}
                    <Autocomplete
                        open={autocompleteOpen}
                        options={options.filter(
                            (option) => !selectedMembers.some((member) => member.id === option.id || member.email === option.email)
                        )} // Exclude already selected members or emails
                        loading={isLoading}
                        freeSolo={true} // Allow custom email input
                        inputValue={inputValue}
                        onInputChange={(event, newValue, reason) => {
                            handleInputChange(event, newValue, reason);
                            setInputError(''); // Clear error on input change
                        }}
                        onChange={handleMemberSelect} // Handle member selection or custom input
                        getOptionLabel={(option) => (typeof option === 'string' ? option : option.full_name || option.email || '')}
                        isOptionDisabled={(option) => typeof option !== 'string' && option.joined === true} // Disable options that are already joined
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                margin="dense"
                                label="Lọc theo tên hoặc email"
                                placeholder="Nhập email hoặc chọn thành viên từ danh sách..."
                                fullWidth
                                variant="outlined"
                                error={!!inputError}
                                helperText={inputError}
                                onKeyDown={(e) => {
                                    if (e.key === ' ') {
                                        e.stopPropagation(); // Ngăn sự kiện lan truyền lên component cha
                                    }
                                }}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {isLoading ? 'Loading' : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar sx={{ width: 24, height: 24 }} src={option.image || ''} />
                                    <Box>
                                        <Typography>
                                            {option.full_name || option.email}
                                        </Typography>
                                        {option.memberType && (
                                            <Typography variant="caption" color="text.secondary">
                                                {option.memberType === 'admin' ? 'Quản trị viên' : 'Thành viên'} Không gian làm việc
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </li>
                        )}
                        disabled={isProcessing}
                    />

                    {/* Invite Message TextField */}
                    <TextField
                        margin="dense"
                        label="Thêm một tin nhắn (tùy chọn)"
                        placeholder="Tham gia Không gian làm việc Trello này để bắt đầu cộng tác vui tói!"
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
                    <Button
                        onClick={handleInviteDialogClose}
                        variant="outlined"
                        disabled={isProcessing}
                    >
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
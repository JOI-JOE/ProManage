import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Grid,
    TextField,
    Container,
    Divider,
    Avatar,
    IconButton,
    Menu,
    Tooltip,
} from "@mui/material";
import { Close, ContentCopy } from '@mui/icons-material';
import { useMe } from '../../../../../../contexts/MeContext';
import { useCancelInvitationWorkspace, useCreateInviteWorkspace, useGetInviteWorkspace } from '../../../../../../hooks/useWorkspaceInvite';
import { toast } from 'react-toastify'; // Đảm bảo đã import toast

const MemberContent = ({ workspace }) => {
    const { user } = useMe();

    // Quản lý trạng thái menu ngữ cảnh
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isCreatingInvite, setIsCreatingInvite] = useState(false);
    const [isCancelingInvite, setIsCancelingInvite] = useState(false);

    const handleOpenMenu = (event, member) => {
        setAnchorEl(event.currentTarget);
        setSelectedMember(member);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setSelectedMember(null);
    };

    const { mutate: createInviteLink } = useCreateInviteWorkspace();
    const { mutate: cancelInviteLink } = useCancelInvitationWorkspace();
    const {
        data: inviteData,
        isLoading: isInviteLoading,
        refetch,
    } = useGetInviteWorkspace(workspace?.id, {
        enabled: !!workspace?.id,
    });

    // Kiểm tra xem đã có invite dữ liệu hay chưa
    const hasInviteData = inviteData && inviteData.invitationSecret;

    // Function để tạo liên kết mời
    const createInvite = async () => {
        if (!workspace?.id) {
            throw new Error("Không tìm thấy ID của workspace");
        }

        // Nếu đã có invite dữ liệu, không tạo mới
        if (hasInviteData) {
            toast.info("Liên kết mời đã tồn tại");
            return;
        }

        setIsCreatingInvite(true);

        try {
            await new Promise((resolve, reject) => {
                createInviteLink(
                    { workspaceId: workspace.id },
                    {
                        onSuccess: (data) => {
                            refetch(); // Refresh invite data
                            toast.success("Đã tạo liên kết mời thành công");
                            resolve(data);
                        },
                        onError: (error) => {
                            console.error("Lỗi khi tạo link mời:", error);
                            reject(error);
                        },
                    }
                );
            });
        } catch (error) {
            toast.error("Không thể tạo liên kết mời. Vui lòng thử lại sau.");
        } finally {
            setIsCreatingInvite(false);
        }
    };

    // Function để sao chép liên kết mời
    const handleCopyInviteLink = () => {
        if (inviteData?.invitationSecret) {
            const fullLink = `http://localhost:5173/invite/${workspace?.id}/${inviteData.invitationSecret}`;
            navigator.clipboard.writeText(fullLink)
                .then(() => toast.success("Đã sao chép liên kết mời"))
                .catch(() => toast.error("Không thể sao chép liên kết"));
        }
    };

    // Function để xóa liên kết mời
    const handleDeleteLink = async () => {
        if (!workspace?.id) {
            throw new Error("Không tìm thấy ID của workspace");
        }

        setIsCancelingInvite(true);

        try {
            await new Promise((resolve, reject) => {
                cancelInviteLink(
                    { workspaceId: workspace.id },
                    {
                        onSuccess: () => {
                            refetch(); // Refresh invite data
                            toast.success("Đã hủy liên kết mời");
                            resolve();
                        },
                        onError: (error) => {
                            console.error("Lỗi khi hủy link mời:", error);
                            reject(error);
                        },
                    }
                );
            });
        } catch (error) {
            toast.error("Không thể hủy liên kết mời. Vui lòng thử lại sau.");
        } finally {
            setIsCancelingInvite(false);
        }
    };

    const isAdmin = workspace && user ? workspace?.members?.some(
        member => member.id === user.id && member.member_type === 'admin'
    ) : false;

    if(isLoading)

    return (
        <Box id="members">
            <Box id="members">
                <Paper
                    sx={{
                        borderRadius: 1,
                        borderLeft: { xs: 1, md: 0 },
                        height: '100%',
                        p: 1,
                        boxShadow: 'none',
                    }}
                >
                    {/* Tiêu đề và menu */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Thành viên không gian làm việc</Typography>
                    </Box>

                    {/* Mô tả */}
                    <Typography variant="body2" color="textSecondary" mb={2}>
                        Các thành viên trong Không gian làm việc có thể xem và tham gia tất cả các bảng Chỉ Hiện Trong Không gian làm việc và tạo các bảng mới trong Không gian làm việc. Thêm thành viên mới sẽ tự động cập nhật trạng thái của bạn.
                    </Typography>

                    {/* Phần mời bằng liên kết */}
                    <Typography variant="subtitle2" mb={1}>
                        Mời các thành viên tham gia cùng bạn
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mb={2}>
                        Bất kỳ ai có liên kết mời đều có thể tham gia Không gian làm việc này. Bạn cũng có thể tắt và tạo liên kết mời mới cho Không gian làm việc này bất kỳ lúc nào.
                    </Typography>
                    <Box display="flex" alignItems="center" mb={3}>
                        {hasInviteData ? (
                            <>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        mr: 2,
                                        flexGrow: 1,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {/* Liên kết: {inviteData.invitationSecret} */}
                                </Typography>
                                <Tooltip title="Sao chép liên kết mời">
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<ContentCopy />}
                                        sx={{
                                            borderRadius: '20px',
                                            textTransform: 'none',
                                            padding: '6px 16px',
                                            fontSize: '14px',
                                            mr: 1
                                        }}
                                        onClick={handleCopyInviteLink}
                                    >
                                        Sao chép
                                    </Button>
                                </Tooltip>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    sx={{
                                        borderRadius: '20px',
                                        textTransform: 'none',
                                        padding: '6px 16px',
                                        fontSize: '14px',
                                    }}
                                    onClick={handleDeleteLink}
                                    disabled={isCancelingInvite}
                                >
                                    Hủy liên kết
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="outlined"
                                sx={{
                                    borderRadius: '20px',
                                    textTransform: 'none',
                                    padding: '6px 16px',
                                    fontSize: '14px',
                                }}
                                onClick={createInvite}
                                disabled={isCreatingInvite || isInviteLoading}
                            >
                                Tạo liên kết mời
                            </Button>
                        )}
                    </Box>

                    {/* TextField lọc */}
                    <Box>
                        <TextField
                            placeholder="Lọc theo tên"
                            variant="outlined"
                            size="small"
                            sx={{ width: '100%', mb: 3 }}
                        />

                        {/* Danh sách thành viên */}
                        {workspace?.members.map((member, index) => {
                            const isCurrentUser = user?.id === member.id;
                            const showRemoveButton = isAdmin && !isCurrentUser && member.member_type !== 'admin';
                            const showLeaveButton = isCurrentUser;

                            return (
                                <Box
                                    key={index}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    mb={2}
                                >
                                    <Box display="flex" alignItems="center">
                                        <Avatar
                                            sx={{
                                                bgcolor: 'purple',
                                                width: 32,
                                                height: 32,
                                                fontSize: '14px',
                                                mr: 1,
                                            }}
                                        >
                                            {member.avatarInitials}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body1">{member.name}</Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {member.full_name} • {member.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box display="flex" alignItems="center">
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            sx={{ mr: 1, textTransform: 'none' }}
                                        >
                                            {member.member_type === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                                        </Button>
                                        {showLeaveButton && (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                sx={{ mr: 1, textTransform: 'none' }}
                                                onClick={(event) => handleOpenMenu(event, member)}
                                            >
                                                Rời khỏi...
                                            </Button>
                                        )}
                                        {showRemoveButton && (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                sx={{ mr: 1, textTransform: 'none' }}
                                                onClick={(event) => handleOpenMenu(event, member)}
                                            >
                                                Loại bỏ...
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            );
                        })}

                        {/* Menu ngữ cảnh */}
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleCloseMenu}
                            PaperProps={{
                                sx: {
                                    minWidth: 300,
                                },
                            }}
                        >
                            <Box sx={{ p: 2 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="subtitle1">
                                        Bằng thông tin Không gian làm việc...
                                    </Typography>
                                    <IconButton size="small" onClick={handleCloseMenu}>
                                        <Close fontSize="small" />
                                    </IconButton>
                                </Box>
                                <Typography variant="body2" mb={2}>
                                    {selectedMember?.name} là thành viên của các bảng Không gian làm việc sau:
                                </Typography>
                                {selectedMember?.boards?.map((board, idx) => (
                                    <Box
                                        key={idx}
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        mb={1}
                                    >
                                        <Box display="flex" alignItems="center">
                                            <Box
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    bgcolor: 'grey.300',
                                                    borderRadius: 1,
                                                    mr: 1,
                                                }}
                                            />
                                            <Typography>{board.name}</Typography>
                                        </Box>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            size="small"
                                            sx={{ textTransform: 'none' }}
                                        >
                                            {board.action}
                                        </Button>
                                    </Box>
                                ))}
                                <Divider sx={{ my: 1 }} />
                                <Button
                                    variant="outlined"
                                    sx={{
                                        borderRadius: '20px',
                                        textTransform: 'none',
                                        padding: '6px 16px',
                                        fontSize: '14px',
                                    }}
                                    onClick={handleCloseMenu}
                                >
                                    Mời bằng liên kết
                                </Button>
                            </Box>
                        </Menu>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default MemberContent;
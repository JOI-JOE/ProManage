import React, { useState } from 'react'
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
} from "@mui/material";
import { Close } from '@mui/icons-material';

const MemberContent = () => {


    // Quản lý trạng thái menu ngữ cảnh
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);

    const handleOpenMenu = (event, member) => {
        setAnchorEl(event.currentTarget);
        setSelectedMember(member);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setSelectedMember(null);
    };

    const members = [
        {
            id: 1,
            name: 'Ngô Hậu',
            email: 'ngohu3',
            avatarInitials: 'NH',
            lastActive: 'April 2025',
            notifications: 3,
            role: 'Quản trị viên',
            actionText: 'Loại bỏ...'
        },
        {
            id: 2,
            name: 'haungodang2003',
            email: 'hau194',
            avatarInitials: 'H',
            lastActive: 'April 2025',
            notifications: 3,
            role: 'Quản trị viên',
            actionText: 'Rời khỏi...'
        }
    ];

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
                        {/* <IconButton size="small"> */}
                        {/* <MoreHoriz /> */}
                        {/* </IconButton> */}
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
                        <Button
                            variant="outlined"
                            // startIcon={<LinkIcon />}
                            sx={{
                                borderRadius: '20px',
                                textTransform: 'none',
                                padding: '6px 16px',
                                fontSize: '14px',
                            }}
                        >
                            Mời bằng liên kết
                        </Button>
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
                        {members.map((member, index) => (
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
                                            {member.email} • {member.lastActive}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box display="flex" alignItems="center">
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        sx={{ mr: 1, textTransform: 'none' }}
                                    >
                                        Xem bảng thông tin ({member.notifications})
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        sx={{ mr: 1, textTransform: 'none' }}
                                    >
                                        {member.role}
                                    </Button>
                                    <IconButton size="small" sx={{ mr: 1 }}>
                                        <Close fontSize="small" />
                                    </IconButton>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        sx={{ textTransform: 'none' }}
                                        onClick={(event) => handleOpenMenu(event, member)}
                                    >
                                        {index === 0 ? 'Loại bỏ...' : 'Rời khỏi...'}
                                    </Button>
                                </Box>
                            </Box>
                        ))}

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
                                {selectedMember?.boards.map((board, idx) => (
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
                                    // startIcon={<LinkIcon />}
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
    )
}

export default MemberContent
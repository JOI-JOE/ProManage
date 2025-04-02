import React, { useState } from "react";
import { Box, Typography, Button, Popover, Avatar, Menu, MenuItem, IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const MemberItem = ({ member }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuEl, setMenuEl] = useState(null);

    const handleMenuClick = (event) => {
        setMenuEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuEl(null);
    };

    return (
        <Box
            key={member?.id}
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px px",
                borderBottom: "1px solid #e0e0e0",
                background: "#ffffff",
                borderRadius: "4px",
                marginBottom: "4px",
                '&:hover': {
                    backgroundColor: '#f5f5f5'
                }
            }}
        >
            {/* Thông tin thành viên */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "#0079BF", width: 32, height: 32 }}>
                    {member?.name?.charAt(0)}
                </Avatar>
                <Box>
                    <Typography fontWeight="bold" sx={{ color: "#172b4d", fontSize: '14px' }}>
                        {member?.name}
                        <Typography component="span" sx={{ color: "#5e6c84", fontSize: '12px', ml: 1 }}>
                            @{member.username} • Lần hoạt động gần nhất {member.last_active}
                        </Typography>
                    </Typography>
                </Box>
            </Box>

            {/* Nút thao tác */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                    variant="text"
                    size="small"
                    sx={{
                        fontSize: '12px',
                        color: '#0052cc',
                        textTransform: 'none',
                        minWidth: 'auto'
                    }}
                >
                    Xem bảng thông tin ({member.board_count})
                </Button>

                {member.is_admin ? (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: '#5e6c84',
                        fontSize: '12px',
                        ml: 1
                    }}>
                        <CheckIcon sx={{ fontSize: '16px', mr: 0.5 }} />
                        Quản trị viên
                    </Box>
                ) : null}

                <IconButton
                    size="small"
                    onClick={handleMenuClick}
                    sx={{ color: '#5e6c84' }}
                >
                    <MoreVertIcon fontSize="small" />
                </IconButton>

                <Menu
                    anchorEl={menuEl}
                    open={Boolean(menuEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <MenuItem onClick={handleMenuClose}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CheckIcon sx={{ mr: 1, color: member.is_admin ? 'inherit' : 'transparent' }} />
                            Quản trị viên
                        </Box>
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose}>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                            <CloseIcon sx={{ mr: 1 }} />
                            Rời khỏi
                        </Box>
                    </MenuItem>
                </Menu>
            </Box>
        </Box>
    );
};

export default MemberItem
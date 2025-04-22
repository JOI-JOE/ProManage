import React from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemText,
    Typography,
    Divider
} from '@mui/material';

const Sidebar = ({ selectedItem = 'members', onSelect }) => {
    // Menu items data
    const menuItems = [
        { id: 'members', label: 'Thành viên không gian làm việc (2)' },
        { id: 'guests', label: 'Khách (0)' },
        { id: 'requests', label: 'Yêu cầu tham gia (0)' }
    ];

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: 250,
                bgcolor: 'background.paper',
            }}
        >
            <List disablePadding>
                {menuItems.map((item) => {
                    const isSelected = selectedItem === item.id;

                    return (
                        <ListItem
                            key={item.id}
                            disablePadding
                            button
                            onClick={() => onSelect && onSelect(item.id)}
                            selected={isSelected}
                            sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 1.5,
                                mx: 1,
                                my: 0.5,
                                bgcolor: isSelected ? '#e6f0fb' : 'transparent', // Màu nền khi chọn (rất giống hình)
                                '&:hover': {
                                    bgcolor: isSelected ? '#d6eaff' : 'rgba(25, 118, 210, 0.04)', // Hover effect
                                },
                            }}
                        >
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                    color: isSelected ? 'primary.main' : 'text.primary',
                                    variant: 'body2',
                                    fontWeight: 600,
                                    sx: {
                                        cursor: 'pointer',
                                        px: 2,
                                        py: 1,
                                        width: '100%',
                                        display: 'block',
                                    },
                                }}
                            />
                        </ListItem>
                    );
                })}
            </List>
            <Divider sx={{ mt: 1 }} />
        </Box>
    );
};

export default Sidebar;
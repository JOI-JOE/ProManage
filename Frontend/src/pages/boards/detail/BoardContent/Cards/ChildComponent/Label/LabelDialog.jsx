import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Checkbox,
    ListItemSecondaryAction,
    IconButton,
    Button,
    Divider,
    Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

function LabelDialog({ open, onClose, onLabelsChange, initialLabels = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [labels, setLabels] = useState([]);

    useEffect(() => {
        const defaultLabels = [
            { id: 1, name: 'Nhãn 1', color: '#198754' },
            { id: 2, name: 'Nhãn 2', color: '#ffc107' },
            { id: 3, name: 'Nhãn 3', color: '#fd7e14' },
            { id: 4, name: 'Nhãn 4', color: '#f8bbd0' },
            { id: 5, name: 'Nhãn 5', color: '#dc3545' },
            { id: 6, name: 'Nhãn 6', color: '#9c27b0' },
            { id: 7, name: 'Nhãn 7', color: '#64b5f6' },
        ];

        const merged = defaultLabels.map((label) => {
            const matched = initialLabels.find((l) => l.id === label.id);
            return {
                ...label,
                ...(matched || {}),
                checked: !!matched,
            };
        });

        setLabels(merged);
    }, [initialLabels]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleCheckboxToggle = (id) => () => {
        setLabels((prevLabels) => {
            const updated = prevLabels.map((label) =>
                label.id === id ? { ...label, checked: !label.checked } : label
            );

            const selected = updated.filter((label) => label.checked);
            onLabelsChange(selected);

            return updated;
        });
    };

    const handleSave = () => {
        const selected = labels.filter((label) => label.checked);
        onLabelsChange(selected); // Gửi nhãn đã chọn về component cha
        onClose(); // Đóng dialog
    };

    const filteredLabels = labels.filter((label) =>
        label.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Nhãn</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    label="Tìm nhãn..."
                    variant="outlined"
                    size="small"
                    margin="dense"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <List sx={{ pt: 0 }}>
                    {filteredLabels.map((label) => (
                        <ListItem key={label.id} disablePadding>
                            <ListItemButton onClick={handleCheckboxToggle(label.id)}>
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={label.checked}
                                        tabIndex={-1}
                                        disableRipple
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    primary={label.name}
                                    sx={{ '& span': { fontWeight: 'bold' } }}
                                />
                                <Box
                                    sx={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 1,
                                        bgcolor: label.color,
                                        mr: 2,
                                    }}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" aria-label="edit">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                <Divider sx={{ my: 2 }} />
                <Button fullWidth variant="contained" color="primary" onClick={handleSave}>
                    Lưu
                </Button>
                <Button fullWidth sx={{ mt: 1 }}>
                    Bật chế độ thân thiện với người mù màu
                </Button>
            </DialogContent>
        </Dialog>
    );
}

export default LabelDialog;

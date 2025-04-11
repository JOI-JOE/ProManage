import React, { useState } from 'react';
import {
    Popover,
    Typography,
    Box,
    InputBase,
    Checkbox,
    IconButton,
    Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import LabelEditDialog from './LabelEditDialog';

// Predefined labels with colors similar to the image
const predefinedLabels = [
    { id: 1, color: '#4caf50', name: '', selected: false }, // Green
    { id: 2, color: '#ffeb3b', name: '', selected: false }, // Yellow
    { id: 3, color: '#ff9800', name: '', selected: false }, // Orange
    { id: 4, color: '#ffcdd2', name: '', selected: false }, // Light red/pink
    { id: 5, color: '#f44336', name: '', selected: false }, // Red
    { id: 6, color: '#9c7df5', name: '', selected: false }, // Purple
    { id: 7, color: '#42a5f5', name: 'alskfllaskfl;a;lfkkkkkkkkkk...', selected: true }, // Blue
];

const LabelsPopover = ({ anchorEl, open, onClose, cardId }) => {
    const [labels, setLabels] = useState(predefinedLabels);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingLabel, setEditingLabel] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const handleLabelSelection = (labelId) => {
        setLabels(labels.map(label =>
            label.id === labelId ? { ...label, selected: !label.selected } : label
        ));
    };

    const handleLabelEdit = (labelId) => {
        const labelToEdit = labels.find(label => label.id === labelId);
        if (labelToEdit) {
            setEditingLabel(labelToEdit);
            setEditDialogOpen(true);
        }
    };

    const handleSaveLabel = (updatedLabel) => {
        setLabels(labels.map(label =>
            label.id === updatedLabel.id ? updatedLabel : label
        ));
        setEditDialogOpen(false);
        setEditingLabel(null);
    };

    const handleDeleteLabel = (labelId) => {
        setLabels(labels.filter(label => label.id !== labelId));
        setEditDialogOpen(false);
        setEditingLabel(null);
    };

    const handleCreateNewLabel = () => {
        const newLabel = {
            id: Date.now(), // Simple unique ID for demo
            color: '#44cc88', // Default color
            name: '',
            selected: false
        };
        setEditingLabel(newLabel);
        setEditDialogOpen(true);
    };

    const handleAccessibilityMode = () => {
        // Implement accessibility mode toggle
        console.log("Toggle accessibility mode");
    };

    // Filter labels based on search term
    const filteredLabels = labels.filter(label =>
        (label.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={onClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: {
                        width: 300,
                        maxHeight: 550,
                        p: 0,
                        borderRadius: '8px',
                        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)'
                    }
                }}
            >
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1,
                    borderBottom: '1px solid #ddd'
                }}>
                    <Typography sx={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: '16px',
                        fontWeight: 500
                    }}>
                        Nhãn
                    </Typography>
                    <IconButton
                        edge="end"
                        onClick={onClose}
                        aria-label="close"
                        size="small"
                        sx={{ '&:hover': { backgroundColor: 'transparent' } }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Box sx={{ p: 2, pb: 1 }}>
                    <InputBase
                        fullWidth
                        placeholder="Tìm nhãn..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{
                            border: '1px solid #ddd',
                            borderRadius: 1,
                            padding: '5px 10px',
                            fontSize: '14px',
                            mb: 1
                        }}
                    />
                </Box>

                <Box sx={{ px: 2 }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            mb: 1,
                            fontSize: '14px',
                            fontWeight: 500
                        }}
                    >
                        Nhãn
                    </Typography>
                </Box>

                <Box sx={{ px: 1, maxHeight: 300, overflow: 'auto' }}>
                    {filteredLabels.map((label) => (
                        <Box
                            key={label.id}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                px: 1,
                                py: 0.5,
                            }}
                        >
                            <Checkbox
                                checked={label.selected}
                                onChange={() => handleLabelSelection(label.id)}
                                size="small"
                                sx={{ p: 0.5, mr: 1 }}
                            />
                            <Box
                                sx={{
                                    backgroundColor: label.color,
                                    borderRadius: '4px',
                                    flex: 1,
                                    height: 34,
                                    display: 'flex',
                                    alignItems: 'center',
                                    px: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    color: ['#ffeb3b', '#ffcdd2'].includes(label.color) ? '#000' : '#fff',
                                    fontWeight: 400,
                                    fontSize: '14px'
                                }}
                            >
                                {label.name || ''}
                            </Box>
                            <IconButton
                                size="small"
                                onClick={() => handleLabelEdit(label.id)}
                                sx={{
                                    ml: 1,
                                    color: '#777',
                                    '&:hover': {
                                        backgroundColor: 'transparent',
                                        color: '#000'
                                    }
                                }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}
                </Box>

                <Box sx={{ p: 1, mt: 1 }}>
                    <Button
                        fullWidth
                        sx={{
                            textTransform: 'none',
                            justifyContent: 'center',
                            backgroundColor: '#f0f0f0',
                            color: '#000',
                            fontWeight: 400,
                            fontSize: '14px',
                            py: 1,
                            borderRadius: '4px',
                            boxShadow: 'none',
                            '&:hover': { backgroundColor: '#e0e0e0', boxShadow: 'none' }
                        }}
                        onClick={handleCreateNewLabel}
                    >
                        Tạo nhãn mới
                    </Button>

                   
                </Box>
            </Popover>

            {/* Label Edit Dialog */}
            <LabelEditDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                label={editingLabel}
                onSave={handleSaveLabel}
                onDelete={handleDeleteLabel}
            />
        </>
    );
};

export default LabelsPopover;
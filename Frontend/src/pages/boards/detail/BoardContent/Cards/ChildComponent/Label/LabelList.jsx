import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Box, Typography, Chip, IconButton } from '@mui/material';
import PlusIcon from '@mui/icons-material/Add';
import LabelsPopover from './LabelsPopover';

// Use forwardRef to allow parent components to call methods
const LabelList = forwardRef(({ cardId }, ref) => {
    const [labelsAnchorEl, setLabelsAnchorEl] = useState(null);
    const [selectedLabels, setSelectedLabels] = useState([]);

    const handleOpenLabelsMenu = (event) => {
        setLabelsAnchorEl(event.currentTarget);
    };

    const handleCloseLabelsMenu = () => {
        setLabelsAnchorEl(null);
    };

    // Handler for when labels change in the popover
    const handleLabelsChange = useCallback((updatedLabels) => {
        const newSelectedLabels = updatedLabels.filter(label => label.selected);
        setSelectedLabels(newSelectedLabels);
    }, []);

    useImperativeHandle(ref, () => ({
        openLabelsPopover(event) {
            setLabelsAnchorEl(event.currentTarget);
        }
    }));

    const labelsToRender = selectedLabels.length > 0 ? selectedLabels : [];

    return (
        <>
            <Box>
                <Typography
                    variant="subtitle2"
                    sx={(theme) => {
                        return {
                            color: theme.palette.text.secondary,
                            fontWeight: 600,
                        }
                    }}
                >
                    Nhãn
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "3px"
                    }}
                >
                    {labelsToRender.map((label) => (
                        <Chip
                            key={label.id}
                            label={label.name || ''}
                            sx={{
                                backgroundColor: label.color,
                                height: "32px",
                                minWidth: "48px",
                                maxWidth: "200px",
                                borderRadius: "4px",
                                color: ['#ffca28', '#ffcdd2', '#ffeb3b'].includes(label.color) ? '#000' : '#fff',
                                fontWeight: 500,
                                '& .MuiChip-label': {
                                    padding: '0 8px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: 'block'
                                }
                            }}
                        />
                    ))}

                    <IconButton
                        sx={(theme) => {
                            return {
                                backgroundColor: "#e0e0e0",
                                width: "32px",
                                height: "32px",
                                borderRadius: 2,
                                backgroundColor: theme.palette.background.paper,
                                boxShadow: theme.shadows[1],
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    boxShadow: theme.shadows[3],
                                    backgroundColor: theme.palette.action.hover,
                                },
                                borderRadius: "4px",
                                "&:hover": {
                                    backgroundColor: "#ccc",
                                },
                            }
                        }}
                        onClick={handleOpenLabelsMenu}
                    >
                        <PlusIcon sx={{ fontSize: "16px", color: "#555" }} />
                    </IconButton>
                </Box>
            </Box >

            <LabelsPopover
                anchorEl={labelsAnchorEl}
                open={Boolean(labelsAnchorEl)}
                onClose={handleCloseLabelsMenu}
                cardId={cardId}
                onLabelsChange={handleLabelsChange}
                initialLabels={selectedLabels}
            />
        </>
    );
});

export default LabelList;
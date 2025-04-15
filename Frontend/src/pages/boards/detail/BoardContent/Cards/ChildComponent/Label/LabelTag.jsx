import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Box, Chip, Typography } from "@mui/material";

const LabelTag = forwardRef(({ cardId, labels }, ref) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [areLabelsExpanded, setAreLabelsExpanded] = useState(false); // Track if all labels are expanded

    const openLabelsPopover = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const closeLabelsPopover = () => {
        setAnchorEl(null);
    };

    useImperativeHandle(ref, () => ({
        openLabelsPopover,
    }));

    const handleLabelClick = () => {
        // Toggle the expanded state for all labels
        setAreLabelsExpanded((prev) => !prev);
    };

    return (
        <Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {labels?.length > 0 ? (
                    labels.map((label) => (
                        <Chip
                            key={label.id}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the click from bubbling up
                                handleLabelClick();
                            }}
                            label={
                                areLabelsExpanded ? (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <span>{label.name}</span>
                                    </Box>
                                ) : null
                            }
                            sx={{
                                minWidth: areLabelsExpanded ? "auto" : "40px", // Small width when not expanded
                                maxWidth: areLabelsExpanded ? "auto" : "40px", // Expand width when clicked
                                height: areLabelsExpanded ? "auto" : "8px", // Small height for the color bar
                                backgroundColor: label.color,
                                color: "#fff",
                                fontWeight: 500,
                                borderRadius: "4px",
                                cursor: "pointer",
                                "& .MuiChip-label": {
                                    display: areLabelsExpanded ? "flex" : "none", // Show/hide label text for all
                                },
                            }}
                        />
                    ))
                ) : (
                    null
                )}
            </Box>
        </Box>
    );
});

export default LabelTag;
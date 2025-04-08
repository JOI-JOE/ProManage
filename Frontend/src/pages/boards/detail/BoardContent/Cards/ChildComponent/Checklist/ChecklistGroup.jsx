import React, { useState } from "react";
import {
    Box,
    Typography,
    Button,
    LinearProgress,
    TextField,
    Menu,
    MenuItem,
    IconButton,
    Avatar
} from "@mui/material";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import ChecklistItem from "./CheckListItem";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const ChecklistGroup = () => {
    const [items, setItems] = useState([
        { id: 1, name: "ksks", is_completed: false },
        { id: 2, name: "ksks", is_completed: false },
    ]);
    const [newItemText, setNewItemText] = useState("");
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedItemId, setSelectedItemId] = useState(null);

    const handleToggle = (id) => {
        const updatedItems = items.map((item) =>
            item.id === id ? { ...item, is_completed: !item.is_completed } : item
        );
        setItems(updatedItems);
    };

    const handleAddItem = () => {
        if (newItemText.trim()) {
            const newItem = {
                id: Date.now(),
                name: newItemText,
                is_completed: false
            };
            setItems([...items, newItem]);
            setNewItemText("");
            setIsAddingItem(false);
        }
    };

    const handleMenuOpen = (event, itemId) => {
        setAnchorEl(event.currentTarget);
        setSelectedItemId(itemId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedItemId(null);
    };

    const completedCount = items.filter((item) => item.is_completed).length;
    const progress = items.length ? (completedCount / items.length) * 100 : 0;

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckBoxIcon sx={{ color: "#42526E" }} />
                    <Typography variant="body1" fontWeight="bold" color="#42526E">
                        Việc cần làm
                    </Typography>
                </Box>
                <Button
                    variant="text"
                    size="small"
                    sx={{
                        color: "#42526E",
                        backgroundColor: "#DFE1E6",
                        "&:hover": {
                            backgroundColor: "#d0d3d8",
                        },
                    }}
                >
                    Xóa
                </Button>
            </Box>

            {/* Progress bar */}
            <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="#6B778C">
                    {Math.round(progress)}%
                </Typography>
                <LinearProgress 
                    variant="determinate"
                    value={progress}
                    sx={(theme) => ({
                        height: 6,
                        borderRadius: 4,
                        backgroundColor: "#DFE1E6",
                        "& .MuiLinearProgress-bar": {
                            backgroundColor:
                                progress === 100 ? theme.palette.success.main : "#5E6C84",
                        },
                    })}
                />
            </Box>

            {/* Items */}
            {items.map((item) => (
                <ChecklistItem
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                    onMenuOpen={handleMenuOpen}
                />
            ))}

            {/* Add item section */}
            {isAddingItem ? (
                <Box>
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Thêm một mục..."
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                        autoFocus
                    />
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleAddItem}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: "bold",
                                    backgroundColor: "#0052CC",
                                    color: "white",
                                    "&:hover": {
                                        backgroundColor: "#0065FF",
                                    },
                                    "&:disabled": {
                                        backgroundColor: "#DFE1E6",
                                        color: "#5E6C84"
                                    }
                                }}
                            >
                                Thêm
                            </Button>
                            <Button
                                variant="text"
                                size="small"
                                onClick={() => setIsAddingItem(false)}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: "bold",
                                    color: "#42526E"
                                }}
                            >
                                Hủy
                            </Button>
                        </Box>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                            <IconButton size="small" sx={{ color: "#42526E" }}>
                                <PersonAddIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" sx={{ color: "#42526E" }}>
                                <AccessTimeIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>
            ) : (
                <Button
                    variant="contained"
                    size="small"
                    onClick={() => setIsAddingItem(true)}
                    sx={{
                        mt: 1,
                        textTransform: "none",
                        fontWeight: "bold",
                        backgroundColor: "#DFE1E6",
                        color: "#253858",
                        "&:hover": {
                            backgroundColor: "#d0d3d8",
                        },
                    }}
                >
                    Thêm một mục
                </Button>
            )}

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => {
                    handleToggle(selectedItemId);
                    handleMenuClose();
                }}>
                    Chuyển đổi trạng thái
                </MenuItem>
                <MenuItem onClick={() => {
                    setItems(items.filter(item => item.id !== selectedItemId));
                    handleMenuClose();
                }}>
                    Xóa
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default ChecklistGroup;
import React from "react";
import { Box, Checkbox, Typography, IconButton } from "@mui/material";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const ChecklistItem = ({ item, onToggle }) => {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#DFE1E6",
                borderRadius: 2,
                px: 1,
                py: 0.5,
                mb: 0.5,
                transition: "background-color 0.2s ease",
                "&:hover .action-icons": {
                    opacity: 1,
                },
            }}
        >
            {/* Bên trái: Checkbox và tên */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                    checked={item.is_completed}
                    onChange={() => onToggle(item.id)}
                    // Icon khi chưa check
                    // Icon khi check
                    checkedIcon={<CheckBoxIcon sx={{ fontSize: 20 }} />}
                    sx={{
                        padding: 0,
                        marginRight: 1,
                        color: "#0052CC",
                        "&.Mui-checked": {
                            color: "#0052CC",
                        },
                    }}
                />
                <Typography
                    variant="body2"
                    sx={{
                        textDecoration: item.is_completed ? "line-through" : "none",
                        color: item.is_completed ? "gray" : "inherit",
                    }}
                >
                    {item.name}
                </Typography>
            </Box>

            {/* Bên phải: Icon chỉ hiển thị khi hover */}
            <Box
                className="action-icons"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    opacity: 0,
                    transition: "opacity 0.2s ease",
                }}
            >
                <IconButton size="small">
                    <AccessTimeIcon fontSize="small" />
                </IconButton>
                <IconButton size="small">
                    <PersonAddIcon fontSize="small" />
                </IconButton>
                <IconButton size="small">
                    <MoreHorizIcon fontSize="small" />
                </IconButton>
            </Box>
        </Box>
    );
};

export default ChecklistItem;

import React, { useState, useRef, useEffect } from "react";
import {
    Menu,
    MenuItem,
    TextField,
    Button,
    Box,
    Typography,
    ClickAwayListener,
    Paper,
} from "@mui/material";

const CheckMenu = ({ anchorEl, open, onClose, onAdd, listOptions = [] }) => {
    const [title, setTitle] = useState("Việc cần làm");
    const [copyFrom, setCopyFrom] = useState("");

    const inputRef = useRef();

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    const handleAdd = () => {
        onAdd({ title, copyFrom });
        setTitle("Việc cần làm");
        setCopyFrom("");
        onClose();
    };

    const handleClose = () => {
        setTitle("Việc cần làm");
        setCopyFrom("");
        onClose();
    };

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    width: 320,
                    padding: 2,
                    mt: "10px",
                    borderRadius: 2,
                },
            }}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "left",
            }}
        >
            <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Thêm danh sách công việc
                </Typography>

                <TextField
                    fullWidth
                    label="Tiêu đề"
                    value={title}
                    inputRef={inputRef}
                    onChange={(e) => setTitle(e.target.value)}
                    size="small"
                    margin="dense"
                    InputLabelProps={{
                        sx: {
                            color: "#5e6c84", // màu label
                            fontWeight: 500,
                            fontSize: "0.875rem",
                        },
                    }}
                />

                <TextField
                    select
                    fullWidth
                    label="Sao chép mục từ ..."
                    value={copyFrom}
                    onChange={(e) => setCopyFrom(e.target.value)}
                    size="small"
                    margin="dense"
                    InputLabelProps={{
                        sx: {
                            color: "#5e6c84",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                        },
                    }}
                >
                    <MenuItem value="">
                        Không có
                    </MenuItem>
                    {listOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>

                <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2 }}>
                    <Button
                        variant="contained"
                        onClick={handleAdd}
                        sx={{
                            backgroundColor: "#0052cc",
                            "&:hover": {
                                backgroundColor: "#003087",
                            },
                            fontSize: "0.875rem",
                            textTransform: "none",
                            minWidth: "60px",
                            height: "32px",
                        }}
                    >
                        Thêm
                    </Button>
                </Box>
            </Box>
        </Menu>
    );
};

export default CheckMenu;

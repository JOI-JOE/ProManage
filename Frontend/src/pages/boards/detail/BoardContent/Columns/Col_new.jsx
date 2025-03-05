import React, { useCallback } from "react";
import { Box, Button, TextField } from "@mui/material";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import CloseIcon from "@mui/icons-material/Close";

const Col_new = ({ open, setOpen, columnName, setColumnName, onAdd }) => {
    const handleAdd = useCallback(() => {
        onAdd(columnName); // Truyền columnName vào onAdd
        setOpen(false);
        setColumnName(""); // Reset columnName sau khi thêm
    }, [onAdd, columnName, setOpen]);

    const handleClose = useCallback(() => {
        setOpen(false);
        setColumnName(""); // Reset columnName khi đóng
    }, [setOpen]);

    const inputStyles = {
        "& label": { color: "white" },
        "& input": { color: "white" },
        "& label.Mui-focused": { color: "white" },
        "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "white" },
            "&:hover fieldset": { borderColor: "white" },
            "&.Mui-focused fieldset": { borderColor: "white" },
        },
    };

    const buttonStyles = {
        boxShadow: "none",
        border: "none",
        bgcolor: "success.main",
        "&:hover": { bgcolor: "success.dark" },
    };

    const closeIconStyles = {
        color: "white",
        cursor: "pointer",
        "&:hover": { color: "error.light" },
    };

    return (
        <>
            {!open ? (
                <Box
                    sx={{
                        minWidth: "200px",
                        maxWidth: "200px",
                        mx: 2,
                        borderRadius: "6px",
                        height: "fit-content",
                        bgcolor: "#ffffff3d",
                    }}
                >
                    <Button
                        startIcon={<NoteAddIcon />}
                        sx={{
                            color: "#ffffff",
                            width: "100%",
                            justifyContent: "flex-start",
                            pl: 2.5,
                            py: 1,
                        }}
                        onClick={() => setOpen(true)}
                    >
                        Add new column
                    </Button>
                </Box>
            ) : (
                <Box
                    sx={{
                        minWidth: "250px",
                        maxWidth: "250px",
                        mx: 2,
                        p: 1,
                        borderRadius: "6px",
                        height: "fit-content",
                        bgcolor: "#ffffff3d",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                    }}
                >
                    <TextField
                        label="Enter column title..."
                        type="text"
                        size="small"
                        variant="outlined"
                        autoFocus
                        value={columnName}
                        onChange={(e) => setColumnName(e.target.value)}
                        sx={inputStyles}
                    />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Button
                            onClick={handleAdd}
                            variant="contained"
                            color="success"
                            size="small"
                            sx={buttonStyles}
                        >
                            Add Column
                        </Button>
                        <CloseIcon
                            fontSize="small"
                            sx={closeIconStyles}
                            onClick={handleClose}
                        />
                    </Box>
                </Box>
            )}
        </>
    );
};

export default Col_new;
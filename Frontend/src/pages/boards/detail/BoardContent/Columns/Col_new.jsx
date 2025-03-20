import { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import CloseIcon from "@mui/icons-material/Close";

const Col_new = ({ open, setOpen, onAdd }) => {
    const [columnName, setColumnName] = useState("");

    const handleAdd = async () => {
        if (!columnName.trim()) return; // Tránh thêm danh sách rỗng
        await onAdd(columnName.trim());
        setColumnName("");
        setOpen(false);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Tránh xuống dòng trong input
            handleAdd();
        }
    };

    const handleClose = () => {
        setOpen(false);
        setColumnName("");
    };

    const inputStyles = {
        "& label": { color: "white" },
        "& input": { color: "white", fontSize: "14px" },
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
        bgcolor: "teal",
    };

    return (
        <>
            {open ? (
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
                        label="Enter..."
                        type="text"
                        size="small"
                        variant="outlined"
                        autoFocus
                        value={columnName}
                        onKeyDown={handleKeyDown}
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
                            sx={{ color: "white", cursor: "pointer" }}
                            onClick={handleClose}
                        />
                    </Box>
                </Box>
            ) : (
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
            )}
        </>
    );
};

export default Col_new;
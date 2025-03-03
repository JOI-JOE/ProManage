import { Box, Button, TextField } from "@mui/material";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import CloseIcon from "@mui/icons-material/Close";

const Col_new = ({ open, setOpen, columnName, setColumnName, onAdd }) => {
    if (!open) {
        return (
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
        );
    }

    return (
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
                sx={{
                    "& label": { color: "white" },
                    "& input": { color: "white" },
                    "& label.Mui-focused": { color: "white" },
                    "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "white" },
                        "&:hover fieldset": { borderColor: "white" },
                        "&.Mui-focused fieldset": { borderColor: "white" },
                    },
                }}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                    onClick={() => {
                        onAdd();
                        setOpen(false);
                    }}
                    variant="contained"
                    color="success"
                    size="small"
                    sx={{
                        boxShadow: "none",
                        border: "none",
                        bgcolor: "success.main",
                        "&:hover": { bgcolor: "success.dark" }
                    }}
                >
                    Add Column
                </Button>
                <CloseIcon
                    fontSize="small"
                    sx={{
                        color: "white",
                        cursor: "pointer",
                        "&:hover": { color: "error.light" }
                    }}
                    onClick={() => setOpen(false)}
                />
            </Box>
        </Box>
    );
};

export default Col_new; 
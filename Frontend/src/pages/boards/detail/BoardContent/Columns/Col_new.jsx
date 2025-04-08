import { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseIcon from "@mui/icons-material/Close";
import CustomButton from "../../../../../components/Common/CustomButton";

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
        fontWeight: '600', // Sử dụng 600 (semi-bold) thay vì 5000
        backgroundColor: '#0C66E4',
        color: '#FFFFFF',
        fontSize: '14px',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        padding: '3px 10px',
        border: 'none',
        borderRadius: '3px',
        '&:hover': {
            backgroundColor: '#0A5BC2', // Điều chỉnh màu hover nếu cần
            opacity: 0.9, // Tăng độ mờ lên 0.9 thay vì giảm xuống 0.8
        },
        '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 2px rgba(12, 102, 228, 0.5)', // Thêm box-shadow để hiển thị focus
        },
    };
    return (
        <>
            {open ? (
                <Box
                    sx={{
                        minWidth: "272px",
                        maxWidth: "272px",
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
                            Thêm danh sách
                        </Button>
                        <CustomButton type="close" onClick={handleClose} size={20} style={{ fontWeight: 'bold' }} />
                    </Box>
                </Box>
            ) : (
                <Box
                    sx={{
                        minWidth: "272px",
                        maxWidth: "272px",
                        width: "245px",
                        mx: 2,
                        borderRadius: "6px",
                        height: "fit-content",
                    }}
                >
                    <Button
                        startIcon={<AddRoundedIcon />}
                        onClick={() => setOpen(true)}
                        sx={{
                            width: "100%",
                            justifyContent: "flex-start",
                            p: "12px",
                            borderRadius: "12px",
                            backgroundColor: "rgba(255, 255, 255, 0.24)",
                            color: "#172B4D",
                            fontSize: "14px",
                            fontWeight: "700",
                            lineHeight: "20px",
                            textTransform: "none", // giữ nguyên chữ thường
                            "&:hover": {
                                backgroundColor: "rgba(0, 0, 0, 0.1)", // hover nhẹ hơn 1 chút
                            },
                        }}
                    >
                        Thêm danh sách
                    </Button>
                </Box>
            )}
        </>
    );
};

export default Col_new;
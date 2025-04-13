import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    IconButton,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const DeleteChecklistButton = ({ checklistId, handleDeleteChecklist }) => {
    const [open, setOpen] = useState(false);

    const handleOpenDialog = () => setOpen(true);
    const handleCloseDialog = () => setOpen(false);

    const confirmDelete = () => {
        handleDeleteChecklist(checklistId);
        handleCloseDialog();
    };

    return (
        <>
            <Button
                size="small"
                onClick={handleOpenDialog}
                sx={{ backgroundColor: "#DFE1E6" }}
            >
                Xóa
            </Button>

            <Dialog open={open} onClose={handleCloseDialog}>
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body1">Xóa Việc cần làm?</Typography>
                    <IconButton onClick={handleCloseDialog}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        Danh sách công việc sẽ bị xóa vĩnh viễn và không thể lấy lại được.
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button
                        onClick={confirmDelete}
                        variant="contained"
                        color="error"
                    >
                        Xóa danh sách công việc
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DeleteChecklistButton;

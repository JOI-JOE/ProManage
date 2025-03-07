import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
} from "@mui/material";

const ArchiveColumnDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Lưu trữ cột</DialogTitle>
      <DialogContent>
        <Typography>Bạn có chắc chắn muốn lưu trữ cột này không?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Hủy
        </Button>
        <Button onClick={onConfirm} color="primary" variant="contained">
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ArchiveColumnDialog;

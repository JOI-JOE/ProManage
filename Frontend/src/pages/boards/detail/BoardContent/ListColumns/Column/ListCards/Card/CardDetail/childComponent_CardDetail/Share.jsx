import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Typography,
  Button,
  Box,
} from "@mui/material";

const ShareModal = ({ open, onClose, shareLink }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontSize: "1rem", textAlign: "center", pb: 1 }}>
        Chia sẻ
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          padding: "8px", // Giảm padding tổng thể
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
          Đường dẫn đến thẻ này
        </Typography>
        <TextField
          fullWidth
          value={shareLink}
          InputProps={{
            readOnly: true,
            style: { height: "30px", fontSize: "0.6rem" },
          }}
          sx={{ mb: 2 }}
        />

        <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
          Nhúng thẻ này
        </Typography>
        <TextField
          fullWidth
          value={`<blockquote class="trello-card"><a href="${shareLink}">${shareLink}</a></blockquote>`}
          InputProps={{
            readOnly: true,
            style: { height: "30px", fontSize: "0.6rem" },
          }}
          sx={{ mb: 2 }}
        />

        <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
          Gửi mail cho thẻ này
        </Typography>
        <TextField
          fullWidth
          value="phamthihongng+33sjy81b3bgfgc280f7j+34"
          InputProps={{
            readOnly: true,
            style: { height: "30px", fontSize: "0.6rem" },
          }}
          sx={{ mb: 2 }}
        />

        <Box display="flex" justifyContent="center">
          <Button
            onClick={onClose}
            variant="contained"
            color="primary"
            sx={{ fontSize: "0.7rem", padding: "5px 15px" }}
          >
            Đóng
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
